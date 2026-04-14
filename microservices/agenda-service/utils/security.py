import os

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt


SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("Missing SECRET_KEY environment variable. Default insecure fallback removed.")
ALGORITHM = "HS256"


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]

    token_from_cookie = request.cookies.get("access_token")
    if token_from_cookie:
        return token_from_cookie

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesion no encontrada.",
    )


def get_current_user_id(request: Request) -> str:
    """Extrae el ID del usuario del token, solo valida autenticación (Authentication)."""
    payload = decode_token(_extract_token(request))
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido: subject no encontrado.",
        )
    return user_id


def require_staff_or_superuser(request: Request) -> str:
    """Valida que el JWT emitido por la capa de identidad contenga los claims autorizados.
    
    agenda-service simplemente consume y valida estos literales para proteger sus rutas.
    No redefine, ni es dueño, ni conoce el catálogo oficial completo de usuarios del negocio.
    """
    payload = decode_token(_extract_token(request))
    role = payload.get("role")
    
    if role not in ("staff", "superuser"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere un nivel de usuario staff o superior.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido: subject no encontrado.",
        )

    return user_id
