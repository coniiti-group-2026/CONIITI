# ============================================================
# Servicio de Usuarios - CONIITI API
# Fachada del monolito para la gestion de cuentas staff.
# Delega perfiles a users-service y credenciales a auth-service.
# ============================================================

import os
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.user import UserCreate, UserUpdate


def _extract_error_detail(exc: httpx.HTTPStatusError, fallback: str) -> str:
    if exc.response is None:
        return fallback

    try:
        return exc.response.json().get("detail", fallback)
    except Exception:
        return fallback


def _raise_http_error(exc: httpx.HTTPStatusError, fallback: str) -> None:
    detail = _extract_error_detail(exc, fallback)
    if exc.response is not None:
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail) from exc


def _internal_service_headers() -> dict[str, str]:
    return {
        "X-Internal-Service-Token": os.getenv("INTERNAL_SERVICE_TOKEN", "coniiti-internal-token")
    }


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


def _sort_users_by_created_at_desc(users: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(users, key=lambda item: item.get("created_at") or "", reverse=True)


def _build_auth_create_payload(data: UserCreate) -> dict[str, Any]:
    return {
        "email": data.email,
        "password": data.password,
        "full_name": data.full_name,
        "is_active": True,
    }


def _build_profile_create_payload(data: UserCreate, user_id: str) -> dict[str, Any]:
    return {
        "id": user_id,
        "full_name": data.full_name,
        "email": data.email,
        "institution": data.institution,
        "role": data.role.value,
        "is_active": True,
    }


def _build_profile_update_payload(data: UserUpdate) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    if data.full_name is not None:
        payload["full_name"] = data.full_name
    if data.institution is not None:
        payload["institution"] = data.institution
    if data.role is not None:
        payload["role"] = data.role.value
    if data.is_active is not None:
        payload["is_active"] = data.is_active
    return payload


def _build_auth_update_payload(data: UserUpdate) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    if data.full_name is not None:
        payload["full_name"] = data.full_name
    if data.password is not None:
        payload["password"] = data.password
    if data.is_active is not None:
        payload["is_active"] = data.is_active
    return payload


class UsersServiceClient:
    def __init__(self):
        self._base_url = settings.USERS_SERVICE_URL.rstrip("/")

    def _request(
        self,
        method: str,
        path: str,
        *,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> httpx.Response:
        response = httpx.request(
            method,
            f"{self._base_url}{path}",
            json=json,
            params=params,
            headers=_internal_service_headers(),
            timeout=10.0,
        )
        response.raise_for_status()
        return response

    def list_staff_profiles(self) -> list[dict[str, Any]]:
        response = self._request("GET", "/internal/profiles", params={"role": "staff"})
        return response.json()

    def create_profile(self, payload: dict[str, Any]) -> dict[str, Any]:
        response = self._request("POST", "/internal/profiles", json=payload)
        return response.json()

    def get_profile(self, user_id: str) -> dict[str, Any]:
        response = self._request("GET", f"/internal/profiles/{user_id}")
        return response.json()

    def update_profile(self, user_id: str, payload: dict[str, Any]) -> None:
        self._request("PATCH", f"/internal/profiles/{user_id}", json=payload)

    def delete_profile(self, user_id: str) -> None:
        response = httpx.request(
            "DELETE",
            f"{self._base_url}/internal/profiles/{user_id}",
            headers=_internal_service_headers(),
            timeout=10.0,
        )
        if response.status_code not in (204, 404):
            response.raise_for_status()


class AuthServiceClient:
    def __init__(self):
        self._base_url = settings.AUTH_SERVICE_URL.rstrip("/")

    def create_user(self, payload: dict[str, Any]) -> dict[str, Any]:
        response = httpx.post(
            f"{self._base_url}/internal/users",
            json=payload,
            headers=_internal_service_headers(),
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()

    def update_user(self, user_id: str, payload: dict[str, Any]) -> None:
        response = httpx.patch(
            f"{self._base_url}/internal/users/{user_id}",
            json=payload,
            headers=_internal_service_headers(),
            timeout=10.0,
        )
        response.raise_for_status()

    def delete_user(self, user_id: str) -> None:
        response = httpx.delete(
            f"{self._base_url}/internal/users/{user_id}",
            headers=_internal_service_headers(),
            timeout=10.0,
        )
        if response.status_code not in (204, 404):
            response.raise_for_status()


def list_staff_users(_: object = None) -> list[dict[str, Any]]:
    users_client = UsersServiceClient()

    try:
        users = [_map_user(item) for item in users_client.list_staff_profiles()]
        return _sort_users_by_created_at_desc(users)
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "No se pudo consultar la lista de staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="users-service no esta disponible.",
        ) from exc


def create_staff_account(data: UserCreate, _: object = None) -> dict[str, Any]:
    users_client = UsersServiceClient()
    auth_client = AuthServiceClient()

    try:
        auth_data = auth_client.create_user(_build_auth_create_payload(data))
        profile = users_client.create_profile(_build_profile_create_payload(data, auth_data["user_id"]))
        return _map_user(profile)
    except httpx.HTTPStatusError as exc:
        if "auth_data" in locals():
            try:
                auth_client.delete_user(auth_data["user_id"])
            except Exception:
                pass
        _raise_http_error(exc, "No se pudo crear la cuenta staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con auth-service o users-service.",
        ) from exc


def get_staff_account_or_raise(user_id: str) -> dict[str, Any]:
    users_client = UsersServiceClient()

    try:
        return _map_user(users_client.get_profile(user_id))
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "Cuenta staff no encontrada.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="users-service no esta disponible.",
        ) from exc


def update_staff_account(user_id: str, data: UserUpdate) -> dict[str, Any]:
    users_client = UsersServiceClient()
    auth_client = AuthServiceClient()
    profile_payload = _build_profile_update_payload(data)
    auth_payload = _build_auth_update_payload(data)

    try:
        if profile_payload:
            users_client.update_profile(user_id, profile_payload)
        if auth_payload:
            auth_client.update_user(user_id, auth_payload)
        return get_staff_account_or_raise(user_id)
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "No se pudo actualizar la cuenta staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con auth-service o users-service.",
        ) from exc


def delete_staff_account(user_id: str) -> None:
    users_client = UsersServiceClient()
    auth_client = AuthServiceClient()

    try:
        users_client.delete_profile(user_id)
        auth_client.delete_user(user_id)
    except httpx.HTTPStatusError as exc:
        _raise_http_error(exc, "No se pudo eliminar la cuenta staff.")
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo conectar con auth-service o users-service.",
        ) from exc
