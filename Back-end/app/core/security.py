# ============================================================
# Seguridad - CONIITI API
# El monolito ya no emite credenciales: solo valida JWTs
# emitidos por auth-service para proteger sus modulos propios.
# ============================================================

from typing import Optional

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt

from app.core.config import settings


def decode_token(token: str, expected_type: str = "access") -> dict:
    """Decodifica y valida un JWT emitido por auth-service."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No fue posible validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None or token_type != expected_type:
            raise credentials_exception

        return payload
    except JWTError as exc:
        raise credentials_exception from exc


def get_token_from_cookie(request: Request, cookie_name: str = "access_token") -> Optional[str]:
    """Extrae el valor de una cookie de la solicitud entrante."""
    return request.cookies.get(cookie_name)
