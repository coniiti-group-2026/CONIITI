# ============================================================
# Router de Autenticación — CONIITI API
# Gestiona el registro de usuarios, inicio y cierre de sesión,
# verificación OTP y renovación de tokens JWT.
# Todos los tokens viajan en cookies HttpOnly.
# ============================================================

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.core.security import (
    create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies,
    verify_password, get_token_from_cookie, decode_token,
)
from app.models.user import UserRole, AuthProvider
from app.models.otp import OTPPurpose
from app.schemas.auth import (
    RegisterRequest, LoginRequest,
    OTPVerifyRequest, TokenResponse, MessageResponse,
)
from app.services import user_service, otp_service, email_service
from app.dependencies.auth import get_current_user
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["Autenticación"])


# ==============================================================
# Sección: Registro
# ==============================================================

@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
    description="Crea una cuenta nueva y envía un código OTP al correo para verificación.",
)
async def register(data: RegisterRequest, db: DBSession = Depends(get_db)):
    """Registra un nuevo usuario local y envía el código OTP de verificación por correo."""
    # Valida que el usuario aceptó la política de datos
    if not data.accept_data_policy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe aceptar la política de datos para registrarse.",
        )

    # Asigna el rol permitido (solo student o external para auto-registro)
    allowed_roles = {UserRole.STUDENT.value, UserRole.EXTERNAL.value}
    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rol no permitido en el auto-registro.",
        )

    from app.core.security import hash_password
    hashed_pw = hash_password(data.password)

    user = user_service.create_regular_user(
        full_name=data.full_name,
        email=data.email,
        hashed_pw=hashed_pw,
        role=UserRole(data.role),
        institution=data.institution,
        db=db,
    )

    # Registra la aceptación de la política de datos
    user.accepted_data_policy = datetime.now(timezone.utc)
    db.commit()

    # Genera y envía el código OTP
    code = otp_service.generate_otp(user, OTPPurpose.REGISTER, db)
    await email_service.send_otp_email(user.email, user.full_name, code, "register")

    return MessageResponse(
        message="Cuenta creada. Se envió un código de verificación a su correo electrónico."
    )


# ==============================================================
# Sección: Verificación OTP
# ==============================================================

@router.post(
    "/verify-otp",
    response_model=TokenResponse,
    summary="Verificar código OTP",
    description="Valida el código de 6 dígitos y emite los tokens JWT en cookies HttpOnly.",
)
async def verify_otp(
    data: OTPVerifyRequest,
    response: Response,
    db: DBSession = Depends(get_db),
):
    """Verifica el código OTP y emite las cookies de autenticación."""
    user = user_service.get_user_by_email(data.email, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    otp_service.verify_otp(user, data.code, data.purpose, db)

    # Marca al usuario como verificado si es su primera verificación
    if not user.is_verified:
        user_service.mark_user_verified(user, db)

    # Emite los tokens JWT como cookies HttpOnly
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(message="Verificación exitosa. Sesión iniciada.")


# ==============================================================
# Sección: Inicio de sesión local
# ==============================================================

@router.post(
    "/login",
    response_model=MessageResponse,
    summary="Iniciar sesión con email y contraseña",
    description="Valida credenciales y envía OTP al correo para completar el inicio de sesión.",
)
async def login(data: LoginRequest, db: DBSession = Depends(get_db)):
    """Autentica con email/contraseña y dispara el flujo de 2FA por correo."""
    user = user_service.get_user_by_email(data.email, db)

    # Valida credenciales sin revelar cuál campo es incorrecto (seguridad)
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta inactiva. Contacte al administrador.",
        )

    # Genera y envía el código OTP de inicio de sesión
    code = otp_service.generate_otp(user, OTPPurpose.LOGIN, db)
    await email_service.send_otp_email(user.email, user.full_name, code, "login")

    return MessageResponse(
        message="Se envió un código de verificación a su correo electrónico."
    )


# ==============================================================
# Sección: Cierre de sesión
# ==============================================================

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Cerrar sesión",
    description="Elimina las cookies de autenticación del navegador.",
)
def logout(response: Response, _: object = Depends(get_current_user)):
    """Cierra la sesión del usuario limpiando las cookies HttpOnly."""
    clear_auth_cookies(response)
    return MessageResponse(message="Sesión cerrada exitosamente.")


# ==============================================================
# Sección: Renovación de token
# ==============================================================

@router.post(
    "/refresh",
    response_model=MessageResponse,
    summary="Renovar access token",
    description="Usa el refresh token (cookie) para emitir un nuevo access token.",
)
def refresh_token(request: Request, response: Response, db: DBSession = Depends(get_db)):
    """Emite un nuevo access token usando el refresh token almacenado en cookie."""
    token = get_token_from_cookie(request, "refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no encontrado.",
        )

    payload = decode_token(token, expected_type="refresh")
    user = user_service.get_user_by_id(payload.get("sub"), db)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no válido.",
        )

    new_access_token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return MessageResponse(message="Token renovado exitosamente.")


# ==============================================================
# Sección: Datos del usuario autenticado
# ==============================================================

@router.get(
    "/me",
    response_model=UserRead,
    summary="Obtener usuario autenticado",
    description="Retorna los datos del usuario actual según el access token en cookie.",
)
def get_me(current_user=Depends(get_current_user)):
    """Retorna el perfil del usuario que está actualmente autenticado."""
    return current_user
