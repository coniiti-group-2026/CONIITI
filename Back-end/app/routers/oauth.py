# ============================================================
# Router OAuth — CONIITI API
# Gestiona los flujos de autenticación externa con
# Microsoft (Azure AD) y Google OAuth 2.0.
# Al completar el flujo, envía un OTP al correo del usuario.
# ============================================================

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.models.otp import OTPPurpose
from app.models.user import AuthProvider
from app.services import oauth_service, user_service, otp_service, email_service
from app.core.config import settings

router = APIRouter(prefix="/auth/oauth", tags=["OAuth"])

# Almacén temporal de estados OAuth (en producción usar Redis o BD)
_oauth_states: dict[str, str] = {}


def _generate_state(provider: str) -> str:
    """Genera un token de estado único para prevenir ataques CSRF en el flujo OAuth."""
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = provider
    return state


def _validate_state(state: str) -> str:
    """Valida y consume el estado OAuth. Lanza 400 si es inválido o ya fue usado."""
    provider = _oauth_states.pop(state, None)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado OAuth inválido o expirado. Intente iniciar sesión de nuevo.",
        )
    return provider


# ==============================================================
# Sección: Microsoft OAuth
# ==============================================================

@router.get(
    "/microsoft",
    summary="Iniciar sesión con Microsoft",
    description="Redirige al proveedor de identidad de Microsoft para autenticación institucional.",
)
def microsoft_login():
    """Redirige al usuario a la página de login de Microsoft."""
    state = _generate_state("microsoft")
    auth_url = oauth_service.get_microsoft_authorization_url(state)
    return RedirectResponse(url=auth_url)


@router.get(
    "/microsoft/callback",
    summary="Callback de Microsoft OAuth",
    description="Recibe el código de Microsoft, obtiene el perfil del usuario y envía OTP al correo.",
)
async def microsoft_callback(
    request: Request,
    db: DBSession = Depends(get_db),
):
    """Procesa el callback de Microsoft tras autenticación exitosa."""
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parámetros de callback incompletos.",
        )

    _validate_state(state)

    # Intercambia el código por el perfil del usuario
    user_info = await oauth_service.exchange_microsoft_code(code)

    if not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fue posible obtener el correo desde Microsoft. Verifique los permisos de la aplicación.",
        )

    # Busca o crea el usuario automáticamente
    user, _ = user_service.get_or_create_oauth_user(
        email=user_info["email"],
        full_name=user_info.get("full_name", ""),
        provider=AuthProvider.MICROSOFT,
        db=db,
    )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta inactiva. Contacte al administrador.",
        )

    # Envía código OTP al correo (siempre requerido para OAuth)
    code_otp = otp_service.generate_otp(user, OTPPurpose.LOGIN, db)
    await email_service.send_otp_email(user.email, user.full_name, code_otp, "login")

    # Redirige al front-end con el email como parámetro para el formulario OTP
    redirect_url = f"{settings.FRONTEND_URL}/verificar-otp?email={user.email}&purpose=login"
    return RedirectResponse(url=redirect_url)


# ==============================================================
# Sección: Google OAuth
# ==============================================================

@router.get(
    "/google",
    summary="Iniciar sesión con Google",
    description="Redirige al proveedor de identidad de Google para autenticación externa.",
)
def google_login():
    """Redirige al usuario a la página de login de Google."""
    state = _generate_state("google")
    auth_url = oauth_service.get_google_authorization_url(state)
    return RedirectResponse(url=auth_url)


@router.get(
    "/google/callback",
    summary="Callback de Google OAuth",
    description="Recibe el código de Google, obtiene el perfil del usuario y envía OTP al correo.",
)
async def google_callback(
    request: Request,
    db: DBSession = Depends(get_db),
):
    """Procesa el callback de Google tras autenticación exitosa."""
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parámetros de callback incompletos.",
        )

    _validate_state(state)

    user_info = await oauth_service.exchange_google_code(code)

    if not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fue posible obtener el correo desde Google.",
        )

    user, _ = user_service.get_or_create_oauth_user(
        email=user_info["email"],
        full_name=user_info.get("full_name", ""),
        provider=AuthProvider.GOOGLE,
        db=db,
    )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta inactiva. Contacte al administrador.",
        )

    code_otp = otp_service.generate_otp(user, OTPPurpose.LOGIN, db)
    await email_service.send_otp_email(user.email, user.full_name, code_otp, "login")

    redirect_url = f"{settings.FRONTEND_URL}/verificar-otp?email={user.email}&purpose=login"
    return RedirectResponse(url=redirect_url)
