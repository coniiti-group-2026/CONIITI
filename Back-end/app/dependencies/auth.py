# ============================================================
# Dependencias de Autenticacion - CONIITI API
# El monolito ya no autentica credenciales; solo valida JWTs
# emitidos por auth-service para autorizar sus propios modulos.
# ============================================================

from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status

from app.core.security import decode_token, get_token_from_cookie
from app.models.user import UserRole


@dataclass
class AuthenticatedUser:
    id: str
    email: str | None
    full_name: str | None
    role: UserRole
    is_active: bool = True
    is_verified: bool = True


def get_current_user(request: Request) -> AuthenticatedUser:
    token = get_token_from_cookie(request, "access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontro sesion activa. Inicie sesion.",
        )

    payload = decode_token(token, expected_type="access")
    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o incompleto.",
        )

    try:
        normalized_role = UserRole(role)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Rol invalido en el token.",
        ) from exc

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        full_name=payload.get("full_name"),
        role=normalized_role,
        is_active=True,
        is_verified=True,
    )


def get_verified_user(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    return current_user


def require_staff(
    current_user: AuthenticatedUser = Depends(get_verified_user),
) -> AuthenticatedUser:
    if current_user.role not in (UserRole.STAFF, UserRole.SUPERUSER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de staff o superior.",
        )
    return current_user


def require_superuser(
    current_user: AuthenticatedUser = Depends(get_verified_user),
) -> AuthenticatedUser:
    if current_user.role != UserRole.SUPERUSER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de superusuario.",
        )
    return current_user
