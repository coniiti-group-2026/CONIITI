from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from app.security import require_internal_request, require_superuser

router = APIRouter()


def _get_user_or_404(user_id: str, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _normalized_role(value: str | None) -> str | None:
    if value is None:
        return value
    return value.strip().lower()


def _auth_headers() -> dict[str, str]:
    return {"X-Internal-Service-Token": settings.INTERNAL_SERVICE_TOKEN}


def _create_profile_record(user: UserCreate, db: Session) -> User:
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="User email already exists")

    if user.id:
        existing_id = db.query(User).filter(User.id == user.id).first()
        if existing_id:
            raise HTTPException(status_code=409, detail="User id already exists")

    user_data = {
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "institution": user.institution,
        "is_active": user.is_active,
    }
    if user.id:
        user_data["id"] = user.id

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def _update_profile_record(user: User, user_data: UserUpdate, db: Session) -> User:
    if user_data.full_name:
        user.full_name = user_data.full_name

    if user_data.email:
        normalized_email = str(user_data.email)
        existing = db.query(User).filter(User.email == normalized_email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=409, detail="User email already exists")
        user.email = normalized_email

    if user_data.role:
        user.role = _normalized_role(user_data.role)

    if user_data.institution is not None:
        user.institution = user_data.institution

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)
    return user


def _delete_profile_record(user: User, db: Session) -> None:
    db.delete(user)
    db.commit()


def _create_auth_account(payload: dict[str, Any]) -> dict[str, Any]:
    response = httpx.post(
        f"{settings.AUTH_SERVICE_URL}/internal/users",
        json=payload,
        headers=_auth_headers(),
        timeout=10.0,
    )
    response.raise_for_status()
    return response.json()


def _update_auth_account(user_id: str, payload: dict[str, Any]) -> None:
    response = httpx.patch(
        f"{settings.AUTH_SERVICE_URL}/internal/users/{user_id}",
        json=payload,
        headers=_auth_headers(),
        timeout=10.0,
    )
    response.raise_for_status()


def _delete_auth_account(user_id: str) -> None:
    response = httpx.delete(
        f"{settings.AUTH_SERVICE_URL}/internal/users/{user_id}",
        headers=_auth_headers(),
        timeout=10.0,
    )
    if response.status_code not in (204, 404):
        response.raise_for_status()


@router.post("/internal/profiles", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    user: UserCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_internal_request),
):
    return _create_profile_record(user, db)


@router.get("/internal/profiles")
def get_profiles(
    role: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: None = Depends(require_internal_request),
):
    query = db.query(User)
    if role:
        query = query.filter(func.lower(User.role) == role.strip().lower())
    return query.all()


@router.get("/internal/profiles/by-email", response_model=UserResponse)
def get_profile_by_email(
    email: str = Query(...),
    db: Session = Depends(get_db),
    _: None = Depends(require_internal_request),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/internal/profiles/{user_id}", response_model=UserResponse)
def get_profile(
    user_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(require_internal_request),
):
    return _get_user_or_404(user_id, db)


@router.patch("/internal/profiles/{user_id}", response_model=UserResponse)
def update_profile(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_internal_request),
):
    user = _get_user_or_404(user_id, db)
    return _update_profile_record(user, user_data, db)


@router.delete("/internal/profiles/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    user_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(require_internal_request),
):
    user = _get_user_or_404(user_id, db)
    _delete_profile_record(user, db)


@router.get("/staff", response_model=list[UserResponse])
def list_staff(
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    return db.query(User).filter(func.lower(User.role) == "staff").order_by(User.created_at.desc()).all()


@router.post("/staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_staff(
    user: UserCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    if _normalized_role(user.role) != "staff":
        raise HTTPException(status_code=422, detail="Solo se permiten cuentas de staff.")
    if not user.password:
        raise HTTPException(status_code=422, detail="La contrasena es obligatoria para staff.")

    try:
        auth_user = _create_auth_account(
            {
                "user_id": user.id,
                "email": user.email,
                "password": getattr(user, "password", None),
                "full_name": user.full_name,
                "is_active": user.is_active,
            }
        )
    except httpx.HTTPStatusError as exc:
        detail = exc.response.json().get("detail", "No se pudo crear la cuenta staff.")
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="auth-service no esta disponible.") from exc

    try:
        payload = UserCreate(**user.model_dump(exclude={"password", "id"}), id=auth_user["user_id"])
        return _create_profile_record(payload, db)
    except HTTPException as exc:
        try:
            _delete_auth_account(auth_user["user_id"])
        except Exception:
            pass
        raise exc


@router.put("/staff/{user_id}", response_model=UserResponse)
@router.patch("/staff/{user_id}", response_model=UserResponse)
def update_staff(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    user = _get_user_or_404(user_id, db)
    if _normalized_role(user.role) != "staff":
        raise HTTPException(status_code=404, detail="Cuenta staff no encontrada.")

    auth_payload: dict[str, Any] = {}
    if user_data.email is not None:
        auth_payload["email"] = str(user_data.email)
    if user_data.full_name is not None:
        auth_payload["full_name"] = user_data.full_name
    if hasattr(user_data, "password") and getattr(user_data, "password", None):
        auth_payload["password"] = getattr(user_data, "password")
    if user_data.is_active is not None:
        auth_payload["is_active"] = user_data.is_active

    if auth_payload:
        try:
            _update_auth_account(user_id, auth_payload)
        except httpx.HTTPStatusError as exc:
            detail = exc.response.json().get("detail", "No se pudo actualizar la cuenta staff.")
            raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=503, detail="auth-service no esta disponible.") from exc

    return _update_profile_record(user, user_data, db)


@router.delete("/staff/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    user_id: str,
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    user = _get_user_or_404(user_id, db)
    if _normalized_role(user.role) != "staff":
        raise HTTPException(status_code=404, detail="Cuenta staff no encontrada.")

    _delete_profile_record(user, db)

    try:
        _delete_auth_account(user_id)
    except httpx.HTTPStatusError as exc:
        detail = exc.response.json().get("detail", "No se pudo eliminar la cuenta staff.")
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="auth-service no esta disponible.") from exc
