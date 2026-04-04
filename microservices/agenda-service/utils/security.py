import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import Request, HTTPException, status
from jose import JWTError, jwt

SECRET_KEY = os.getenv("SECRET_KEY", "supersecreto123")
ALGORITHM = "HS256"

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_id(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        # Intentar desde header Authorization (opcional)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no encontrada.",
        )
    
    payload = decode_token(token)
    return payload.get("sub")

def require_staff(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no encontrada.")
    
    payload = decode_token(token)
    role = payload.get("role")
    
    if role not in ("staff", "superuser"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de staff o superior.",
        )
    return payload.get("sub")
