# ============================================================
# Servicio de Usuarios - CONIITI API
# Fachada del monolito para la gestion de cuentas staff.
# Delega perfiles a users-service y credenciales a auth-service.
# ============================================================

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.user import UserCreate, UserUpdate


def _users_url(path: str) -> str:
    return f"{settings.USERS_SERVICE_URL}{path}"


def _auth_url(path: str) -> str:
    return f"{settings.AUTH_SERVICE_URL}{path}"


def _map_user(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": data["id"],
        "full_name": data["full_name"],
        "email": data["email"],
        "institution": data.get("institution"),
        "role": data["role"],
        "is_active": data.get("is_active", True),
        "created_at": data.get("created_at"),
    }


def _raise_http_error(exc: httpx.HTTPStatusError, fallback: str) -> None:
    detail = fallback
    if exc.response is not None:
        try:
            detail = exc.response.json().get("detail", fallback)
        except Exception:
            detail = fallback
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=fallback) from exc


def list_staff_users(_: object = None) -> list[dict[str, Any]]:
    try:
        response = httpx.get(_users_url("/users/"), params={"role": "staff"}, timeout=10.0)
        response.raise_for_status()
        return [_map_user(item) for item in response.json()]
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "No se pudo consultar la lista de staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="users-service no esta disponible.",
        ) from exc


def create_staff_account(data: UserCreate, _: object = None) -> dict[str, Any]:
    auth_payload = {
        "email": data.email,
        "password": data.password,
        "full_name": data.full_name,
        "is_active": True,
    }

    try:
        auth_response = httpx.post(
            _auth_url("/internal/users"),
            json=auth_payload,
            timeout=10.0,
        )
        auth_response.raise_for_status()
        auth_data = auth_response.json()

        profile_payload = {
            "id": auth_data["user_id"],
            "full_name": data.full_name,
            "email": data.email,
            "institution": data.institution,
            "role": data.role.value,
            "is_active": True,
        }
        profile_response = httpx.post(_users_url("/users/"), json=profile_payload, timeout=10.0)
        profile_response.raise_for_status()
        return _map_user(profile_response.json())
    except httpx.HTTPStatusError as exc:
        if "auth_data" in locals():
            try:
                httpx.delete(_auth_url(f"/internal/users/{auth_data['user_id']}"), timeout=10.0)
            except Exception:
                pass
        _raise_http_error(exc, "No se pudo crear la cuenta staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con auth-service o users-service.",
        ) from exc


def get_staff_account_or_raise(user_id: str) -> dict[str, Any]:
    try:
        response = httpx.get(_users_url(f"/users/{user_id}"), timeout=10.0)
        response.raise_for_status()
        return _map_user(response.json())
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "Cuenta staff no encontrada.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="users-service no esta disponible.",
        ) from exc


def update_staff_account(user_id: str, data: UserUpdate) -> dict[str, Any]:
    profile_payload: dict[str, Any] = {}
    if data.full_name is not None:
        profile_payload["full_name"] = data.full_name
    if data.institution is not None:
        profile_payload["institution"] = data.institution
    if data.role is not None:
        profile_payload["role"] = data.role.value
    if data.is_active is not None:
        profile_payload["is_active"] = data.is_active

    auth_payload: dict[str, Any] = {}
    if data.full_name is not None:
        auth_payload["full_name"] = data.full_name
    if data.password is not None:
        auth_payload["password"] = data.password
    if data.is_active is not None:
        auth_payload["is_active"] = data.is_active

    try:
        if profile_payload:
            profile_response = httpx.patch(
                _users_url(f"/users/{user_id}"),
                json=profile_payload,
                timeout=10.0,
            )
            profile_response.raise_for_status()
        if auth_payload:
            auth_response = httpx.patch(
                _auth_url(f"/internal/users/{user_id}"),
                json=auth_payload,
                timeout=10.0,
            )
            auth_response.raise_for_status()
        return get_staff_account_or_raise(user_id)
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "No se pudo actualizar la cuenta staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con auth-service o users-service.",
        ) from exc


def delete_staff_account(user_id: str) -> None:
    try:
        profile_response = httpx.delete(_users_url(f"/users/{user_id}"), timeout=10.0)
        if profile_response.status_code not in (204, 404):
            profile_response.raise_for_status()

        auth_response = httpx.delete(_auth_url(f"/internal/users/{user_id}"), timeout=10.0)
        if auth_response.status_code not in (204, 404):
            auth_response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "No se pudo eliminar la cuenta staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con auth-service o users-service.",
        ) from exc
