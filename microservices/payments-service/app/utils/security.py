import os
import uuid
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt


PAYMENT_MANAGER_ROLES = {"staff", "superuser"}
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not SECRET_KEY:
    raise ValueError("Missing JWT_SECRET_KEY (or SECRET_KEY) environment variable.")


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    role: str
    email: str | None = None
    full_name: str | None = None

    @property
    def can_manage_payments(self) -> bool:
        return self.role in PAYMENT_MANAGER_ROLES


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]

    token_from_cookie = request.cookies.get("access_token")
    if token_from_cookie:
        return token_from_cookie

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de acceso requerido.",
    )


def get_current_user(request: Request) -> AuthenticatedUser:
    try:
        payload = jwt.decode(
            _extract_token(request),
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado.",
        ) from exc

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso invalido.",
        )

    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token incompleto.",
        )

    try:
        normalized_user_id = str(uuid.UUID(str(user_id)))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido: subject no es UUID.",
        ) from exc

    return AuthenticatedUser(
        id=normalized_user_id,
        role=str(role).strip().lower(),
        email=payload.get("email"),
        full_name=payload.get("full_name"),
    )


def require_payment_access(user_id: uuid.UUID, current_user: AuthenticatedUser) -> None:
    if current_user.can_manage_payments:
        return

    if str(user_id) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes operar pagos de otro usuario.",
        )
