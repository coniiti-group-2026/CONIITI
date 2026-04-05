from typing import Any

import httpx

from app.config import settings


def _auth_headers() -> dict[str, str]:
    return {"X-Internal-Service-Token": settings.INTERNAL_SERVICE_TOKEN}


def create_auth_account(payload: dict[str, Any]) -> dict[str, Any]:
    response = httpx.post(
        f"{settings.AUTH_SERVICE_URL}/internal/users",
        json=payload,
        headers=_auth_headers(),
        timeout=10.0,
    )
    response.raise_for_status()
    return response.json()


def update_auth_account(user_id: str, payload: dict[str, Any]) -> None:
    response = httpx.patch(
        f"{settings.AUTH_SERVICE_URL}/internal/users/{user_id}",
        json=payload,
        headers=_auth_headers(),
        timeout=10.0,
    )
    response.raise_for_status()


def delete_auth_account(user_id: str) -> None:
    response = httpx.delete(
        f"{settings.AUTH_SERVICE_URL}/internal/users/{user_id}",
        headers=_auth_headers(),
        timeout=10.0,
    )
    if response.status_code not in (204, 404):
        response.raise_for_status()
