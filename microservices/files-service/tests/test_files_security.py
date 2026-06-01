import os
import tempfile
import uuid
from datetime import datetime, timedelta, timezone

os.environ["JWT_SECRET_KEY"] = "test-secret"
_TEMP_UPLOADS = tempfile.TemporaryDirectory()
os.environ["UPLOAD_DIR"] = _TEMP_UPLOADS.name
os.environ["FILES_DATA_DIR"] = os.path.join(_TEMP_UPLOADS.name, "_metadata")

from fastapi.testclient import TestClient
from jose import jwt

from app.main import app


client = TestClient(app)


def auth_headers(role: str = "staff", user_id: uuid.UUID | None = None) -> dict[str, str]:
    token = jwt.encode(
        {
            "sub": str(user_id or uuid.uuid4()),
            "type": "access",
            "role": role,
            "email": "user@coniiti.edu",
            "full_name": "Test User",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
        },
        "test-secret",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def content_card_payload() -> dict:
    return {
        "section": "memorias",
        "title": "Memorias CONIITI",
        "description": "Repositorio de memorias.",
        "is_active": True,
        "sort_order": 1,
    }


def test_content_write_requires_token():
    response = client.post("/content/cards", json=content_card_payload())

    assert response.status_code == 401


def test_content_write_rejects_non_staff_user():
    response = client.post(
        "/content/cards",
        headers=auth_headers(role="external"),
        json=content_card_payload(),
    )

    assert response.status_code == 403


def test_content_write_allows_staff():
    response = client.post(
        "/content/cards",
        headers=auth_headers(role="staff"),
        json=content_card_payload(),
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Memorias CONIITI"
