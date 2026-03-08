# ============================================================
# Seguridad — CONIITI API
# Maneja el hashing de contraseñas, la creación y validación
# de tokens JWT, y la gestión de cookies HttpOnly seguras.
# ============================================================

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Response, Request, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# --- Contexto de hashing con bcrypt ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==============================================================
# Sección: Manejo de contraseñas
# ==============================================================

def hash_password(plain_password: str) -> str:
    """Genera el hash bcrypt de una contraseña en texto plano."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con el hash almacenado."""
    return pwd_context.verify(plain_password, hashed_password)


# ==============================================================
# Sección: Creación de tokens JWT
# ==============================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT de corta duración (access token).
    Incluye la fecha de expiración como claim estándar 'exp'.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """
    Crea un token JWT de larga duración (refresh token).
    Se utiliza para renovar el access token sin requerir nuevas credenciales.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ==============================================================
# Sección: Validación de tokens JWT
# ==============================================================

def decode_token(token: str, expected_type: str = "access") -> dict:
    """
    Decodifica y valida un token JWT.
    Lanza HTTPException 401 si el token es inválido, expirado o del tipo incorrecto.
    """
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
    except JWTError:
        raise credentials_exception


# ==============================================================
# Sección: Gestión de cookies HttpOnly
# ==============================================================

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """
    Establece el access token y el refresh token como cookies HttpOnly.
    - HttpOnly: no accesibles desde JavaScript (protección XSS).
    - Secure: solo se envían por HTTPS en producción.
    - SameSite=Lax: protección básica contra CSRF.
    """
    is_production = settings.ENVIRONMENT == "production"

    # access_token: cookie de sesión (sin max_age).
    # El navegador la elimina automáticamente al cerrar la pestaña o el navegador.
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        path="/",
        # Sin max_age → cookie de sesión del navegador
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth/refresh",
    )


def clear_auth_cookies(response: Response) -> None:
    """Elimina las cookies de autenticación al cerrar sesión."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/auth/refresh")


def get_token_from_cookie(request: Request, cookie_name: str = "access_token") -> Optional[str]:
    """Extrae el valor de una cookie de la solicitud entrante."""
    return request.cookies.get(cookie_name)
