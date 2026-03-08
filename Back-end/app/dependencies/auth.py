# ============================================================
# Dependencias de Autenticación — CONIITI API
# Define las dependencias de FastAPI para inyección en routers.
# Principio DIP: los routers dependen de estas abstracciones,
# no de los detalles de implementación de seguridad o BD.
# ============================================================

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.core.security import decode_token, get_token_from_cookie
from app.models.user import User, UserRole
from app.services import user_service


def get_current_user(
    request: Request,
    db: DBSession = Depends(get_db),
) -> User:
    """
    Dependencia que extrae y valida el access token desde la cookie HttpOnly.
    Retorna el usuario autenticado o lanza HTTPException 401.
    """
    token = get_token_from_cookie(request, "access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró sesión activa. Inicie sesión.",
        )

    payload = decode_token(token, expected_type="access")
    user_id = payload.get("sub")

    user = user_service.get_user_by_id(user_id, db)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o cuenta inactiva.",
        )

    return user


def get_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependencia que exige que el usuario haya completado la verificación OTP.
    Lanza HTTPException 403 si no está verificado.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta no verificada. Complete el proceso de verificación por correo.",
        )
    return current_user


def require_staff(current_user: User = Depends(get_verified_user)) -> User:
    """
    Dependencia que exige rol de staff o superusuario.
    Lanza HTTPException 403 si el rol es insuficiente.
    """
    if current_user.role not in (UserRole.STAFF, UserRole.SUPERUSER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de staff o superior.",
        )
    return current_user


def require_superuser(current_user: User = Depends(get_verified_user)) -> User:
    """
    Dependencia que exige el rol de superusuario.
    Lanza HTTPException 403 si el usuario no es superusuario.
    """
    if current_user.role != UserRole.SUPERUSER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de superusuario.",
        )
    return current_user
