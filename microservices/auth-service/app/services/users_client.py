import time
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import settings


REQUEST_TIMEOUT_SECONDS = 10.0
RETRY_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 0.5


def _handle_http_error(exc: httpx.HTTPError, detail: str) -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=detail,
    ) from exc


def _request_users_service(
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
) -> httpx.Response:
    url = f"{settings.USERS_SERVICE_URL}{path}"
    last_error: httpx.HTTPError | None = None

    for attempt in range(RETRY_ATTEMPTS):
        try:
            response = httpx.request(
                method,
                url,
                json=json,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError:
            raise
        except httpx.HTTPError as exc:
            last_error = exc
            if attempt == RETRY_ATTEMPTS - 1:
                break
            time.sleep(RETRY_BACKOFF_SECONDS * (attempt + 1))

    if last_error is None:
        raise RuntimeError("users-service request failed without an httpx exception")

    raise last_error


def create_profile(
    user_id: str,
    full_name: str,
    email: str,
    role: str,
    institution: str | None = None,
    is_active: bool = True,
) -> dict[str, Any]:
    payload = {
        "id": user_id,
        "full_name": full_name,
        "email": email,
        "role": role,
        "institution": institution,
        "is_active": is_active,
    }

    try:
        response = _request_users_service("POST", "/users/", json=payload)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        if exc.response is not None:
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=exc.response.json().get("detail", "No se pudo crear el perfil del usuario."),
            ) from exc
        _handle_http_error(exc, "No se pudo crear el perfil del usuario.")
    except httpx.HTTPError as exc:
        _handle_http_error(exc, "No se pudo conectar con users-service.")


def get_profile(user_id: str) -> dict[str, Any]:
    try:
        response = _request_users_service("GET", f"/users/{user_id}")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        if exc.response is not None and exc.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Perfil de usuario no encontrado.") from exc
        _handle_http_error(exc, "No se pudo consultar el perfil del usuario.")
    except httpx.HTTPError as exc:
        _handle_http_error(exc, "No se pudo conectar con users-service.")


def update_profile(user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    try:
        response = _request_users_service("PATCH", f"/users/{user_id}", json=payload)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        if exc.response is not None:
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=exc.response.json().get("detail", "No se pudo actualizar el perfil."),
            ) from exc
        _handle_http_error(exc, "No se pudo actualizar el perfil.")
    except httpx.HTTPError as exc:
        _handle_http_error(exc, "No se pudo conectar con users-service.")


def delete_profile(user_id: str) -> None:
    try:
        response = _request_users_service("DELETE", f"/users/{user_id}")
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        if exc.response is not None and exc.response.status_code == 404:
            return
        _handle_http_error(exc, "No se pudo eliminar el perfil.")
    except httpx.HTTPError as exc:
        _handle_http_error(exc, "No se pudo conectar con users-service.")
