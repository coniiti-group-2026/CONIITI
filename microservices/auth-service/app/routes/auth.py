from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database.connection import get_db
from app.schemas.auth import (
    AuthenticatedUserResponse,
    ErrorResponse,
    ForgotPasswordRequest,
    HealthResponse,
    InternalUserCreateRequest,
    InternalUserResponse,
    InternalUserUpdateRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
)
from app.security.jwt import (
    clear_access_cookie,
    clear_oauth_state_cookie,
    generate_oauth_state,
    get_current_user,
    set_access_cookie,
    set_oauth_state_cookie,
)
from app.services import auth_service, email_service, event_service, oauth_service, users_client

router = APIRouter()


def _build_oauth_redirect_uri(request: Request, provider: str) -> str:
    forwarded_prefix = request.headers.get("x-forwarded-prefix", "").split(",", 1)[0].strip()
    if not forwarded_prefix:
        return (
            settings.GOOGLE_REDIRECT_URI
            if provider == "google"
            else settings.MICROSOFT_REDIRECT_URI
        )

    if not forwarded_prefix.startswith("/"):
        forwarded_prefix = f"/{forwarded_prefix}"

    forwarded_prefix = forwarded_prefix.rstrip("/")
    forwarded_proto = request.headers.get("x-forwarded-proto", request.url.scheme).split(",", 1)[0].strip()
    forwarded_host = request.headers.get("x-forwarded-host", request.headers.get("host", request.url.netloc))
    host = forwarded_host.split(",", 1)[0].strip()
    return f"{forwarded_proto}://{host}{forwarded_prefix}/oauth/{provider}/callback"


def _build_frontend_url(path: str, **params: str) -> str:
    query = urlencode({key: value for key, value in params.items() if value})
    base = settings.FRONTEND_URL.rstrip("/")
    normalized_path = "/" + path.lstrip("/")
    if query:
        return f"{base}{normalized_path}?{query}"
    return f"{base}{normalized_path}"


def _build_oauth_error_redirect(message: str) -> RedirectResponse:
    response = RedirectResponse(
        url=_build_frontend_url(settings.FRONTEND_LOGIN_PATH, error=message),
        status_code=status.HTTP_302_FOUND,
    )
    clear_oauth_state_cookie(response)
    return response


def _rollback_oauth_user(email: str, created: bool, db: Session) -> None:
    if not created or not email:
        return

    existing_user = auth_service.get_user_by_email(email, db)
    if not existing_user:
        return

    try:
        users_client.delete_profile(existing_user.id)
    except HTTPException:
        pass
    auth_service.delete_user(existing_user, db)


def _validate_oauth_state(request: Request, state: str) -> None:
    cookie_state = request.cookies.get("oauth_state")
    if not cookie_state or cookie_state != state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado OAuth invalido o expirado.",
        )


def _ensure_oauth_profile(user, full_name: str, created: bool) -> dict:
    if created:
        profile = users_client.create_profile(
            user_id=user.id,
            full_name=full_name,
            email=user.email,
            role="external",
        )
        event_service.publish_user_registered(user)
        return profile

    try:
        return users_client.get_profile(user.id)
    except HTTPException as exc:
        if exc.status_code != status.HTTP_404_NOT_FOUND:
            raise
        return users_client.create_profile(
            user_id=user.id,
            full_name=full_name,
            email=user.email,
            role="external",
        )


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_409_CONFLICT: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    },
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.register_user(payload, db)

    try:
        users_client.create_profile(
            user_id=user.id,
            full_name=payload.full_name,
            email=payload.email,
            role=payload.role,
            institution=payload.institution,
        )
        event_service.publish_user_registered(user)
    except event_service.EventPublishError as exc:
        try:
            users_client.delete_profile(user.id)
        except HTTPException:
            pass
        auth_service.delete_user(user, db)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo completar el registro porque RabbitMQ no esta disponible.",
        ) from exc
    except HTTPException as exc:
        try:
            users_client.delete_profile(user.id)
        except HTTPException:
            pass
        auth_service.delete_user(user, db)
        raise exc

    return RegisterResponse(
        message="Usuario registrado correctamente.",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=payload.role,
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
    },
)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(payload.email, payload.password, db)
    profile = users_client.get_profile(user.id)
    if profile.get("is_active") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta esta inactiva.",
        )
    token = auth_service.create_access_token_for_user(
        user,
        role=profile["role"],
        full_name=profile["full_name"],
    )
    set_access_cookie(response, token)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=profile["full_name"],
        role=profile["role"],
    )


@router.get(
    "/me",
    response_model=AuthenticatedUserResponse,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
)
def me(current_user=Depends(get_current_user)):
    profile = users_client.get_profile(current_user.id)
    return AuthenticatedUserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=profile["full_name"],
        role=profile["role"],
        institution=profile.get("institution"),
        is_active=current_user.is_active,
    )


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    clear_access_cookie(response)
    return MessageResponse(message="Sesion cerrada correctamente.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_message = "Si el correo esta registrado, recibiras instrucciones para restablecer tu contrasena."
    user = auth_service.get_user_by_email(payload.email, db)
    if not user or not user.is_active:
        return MessageResponse(message=generic_message)

    reset_token = auth_service.create_password_reset_token(user, db)
    reset_url = _build_frontend_url(
        settings.FRONTEND_RESET_PASSWORD_PATH,
        token=reset_token,
    )
    email_service.send_password_reset_email(
        to_email=user.email,
        full_name=user.full_name,
        reset_url=reset_url,
    )
    return MessageResponse(message=generic_message)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service.reset_password(payload.token, payload.new_password, db)
    return MessageResponse(message="Contrasena actualizada correctamente. Ya puedes iniciar sesion.")


@router.get("/oauth/google")
def google_login(request: Request):
    state = generate_oauth_state()
    redirect_uri = _build_oauth_redirect_uri(request, "google")
    response = RedirectResponse(
        url=oauth_service.get_google_authorization_url(state, redirect_uri=redirect_uri),
        status_code=status.HTTP_302_FOUND,
    )
    set_oauth_state_cookie(response, state)
    return response


@router.get("/oauth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    error = request.query_params.get("error")
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    created = False
    user_info: dict[str, str] = {}

    if error:
        return _build_oauth_error_redirect("Google no completo la autenticacion.")
    if not code or not state:
        return _build_oauth_error_redirect("Callback de Google incompleto.")

    try:
        redirect_uri = _build_oauth_redirect_uri(request, "google")
        _validate_oauth_state(request, state)
        user_info = await oauth_service.exchange_google_code(code, redirect_uri=redirect_uri)
        if not user_info.get("email"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google no devolvio un correo valido.",
            )

        user, created = auth_service.get_or_create_oauth_user(
            email=user_info["email"],
            full_name=user_info.get("full_name", ""),
            db=db,
        )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="La cuenta esta inactiva.",
            )

        profile = _ensure_oauth_profile(
            user=user,
            full_name=user_info.get("full_name") or user.full_name,
            created=created,
        )
        token = auth_service.create_access_token_for_user(
            user,
            role=profile["role"],
            full_name=profile["full_name"],
        )
        response = RedirectResponse(
            url=_build_frontend_url(settings.FRONTEND_LOGIN_PATH, oauth="success"),
            status_code=status.HTTP_302_FOUND,
        )
        set_access_cookie(response, token)
        clear_oauth_state_cookie(response)
        return response
    except event_service.EventPublishError:
        _rollback_oauth_user(user_info.get("email", ""), created, db)
        return _build_oauth_error_redirect("No se pudo finalizar el registro OAuth.")
    except HTTPException as exc:
        _rollback_oauth_user(user_info.get("email", ""), created, db)
        return _build_oauth_error_redirect(exc.detail)


@router.get("/oauth/microsoft")
def microsoft_login(request: Request):
    state = generate_oauth_state()
    redirect_uri = _build_oauth_redirect_uri(request, "microsoft")
    response = RedirectResponse(
        url=oauth_service.get_microsoft_authorization_url(state, redirect_uri=redirect_uri),
        status_code=status.HTTP_302_FOUND,
    )
    set_oauth_state_cookie(response, state)
    return response


@router.get("/oauth/microsoft/callback")
async def microsoft_callback(request: Request, db: Session = Depends(get_db)):
    error = request.query_params.get("error")
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    created = False
    user_info: dict[str, str] = {}

    if error:
        return _build_oauth_error_redirect("Microsoft no completo la autenticacion.")
    if not code or not state:
        return _build_oauth_error_redirect("Callback de Microsoft incompleto.")

    try:
        redirect_uri = _build_oauth_redirect_uri(request, "microsoft")
        _validate_oauth_state(request, state)
        user_info = await oauth_service.exchange_microsoft_code(code, redirect_uri=redirect_uri)
        if not user_info.get("email"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Microsoft no devolvio un correo valido.",
            )

        user, created = auth_service.get_or_create_oauth_user(
            email=user_info["email"],
            full_name=user_info.get("full_name", ""),
            db=db,
        )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="La cuenta esta inactiva.",
            )

        profile = _ensure_oauth_profile(
            user=user,
            full_name=user_info.get("full_name") or user.full_name,
            created=created,
        )
        token = auth_service.create_access_token_for_user(
            user,
            role=profile["role"],
            full_name=profile["full_name"],
        )
        response = RedirectResponse(
            url=_build_frontend_url(settings.FRONTEND_LOGIN_PATH, oauth="success"),
            status_code=status.HTTP_302_FOUND,
        )
        set_access_cookie(response, token)
        clear_oauth_state_cookie(response)
        return response
    except event_service.EventPublishError:
        _rollback_oauth_user(user_info.get("email", ""), created, db)
        return _build_oauth_error_redirect("No se pudo finalizar el registro OAuth.")
    except HTTPException as exc:
        _rollback_oauth_user(user_info.get("email", ""), created, db)
        return _build_oauth_error_redirect(exc.detail)


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", service="auth-service")


@router.post("/internal/users", response_model=InternalUserResponse, status_code=status.HTTP_201_CREATED)
def create_internal_user(payload: InternalUserCreateRequest, db: Session = Depends(get_db)):
    user = auth_service.create_internal_user(payload, db)
    return InternalUserResponse(
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )


@router.patch("/internal/users/{user_id}", response_model=InternalUserResponse)
def update_internal_user(
    user_id: str,
    payload: InternalUserUpdateRequest,
    db: Session = Depends(get_db),
):
    user = auth_service.update_internal_user(user_id, payload, db)
    return InternalUserResponse(
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )


@router.delete("/internal/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_internal_user(user_id: str, db: Session = Depends(get_db)):
    auth_service.delete_user_by_id(user_id, db)
