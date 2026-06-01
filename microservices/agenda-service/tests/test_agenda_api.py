import os
import uuid
from datetime import datetime, timedelta, timezone

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret"
os.environ["RABBITMQ_HOST"] = "rabbitmq"
os.environ["RABBITMQ_USER"] = "user"
os.environ["RABBITMQ_PASS"] = "pass"

from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.services import agenda_service


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
agenda_service.publish_event = lambda routing_key, message: None
client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def auth_headers(role: str = "staff", user_id: uuid.UUID | None = None) -> dict[str, str]:
    token = jwt.encode(
        {
            "sub": str(user_id or uuid.uuid4()),
            "type": "access",
            "role": role,
            "email": "staff@coniiti.edu",
            "full_name": "Staff CONIITI",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
        },
        "test-secret",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def session_payload() -> dict:
    return {
        "titulo": "Pruebas de integracion en microservicios",
        "ponente": "Dra. QA DevOps",
        "track": "Desarrollo de Software",
        "event_type": "Conferencia",
        "dia": "2026-10-01",
        "hora_inicio": "09:00",
        "hora_fin": "10:00",
        "salon": "Auditorio A",
        "modalidad": "Presencial",
        "cupos_totales": 40,
    }


def test_create_session_rejects_missing_token():
    response = client.post("/", json=session_payload())

    assert response.status_code == 401


def test_create_session_rejects_non_staff_role():
    response = client.post(
        "/",
        headers=auth_headers(role="external"),
        json=session_payload(),
    )

    assert response.status_code == 403


def test_staff_can_create_update_list_and_delete_session():
    create_response = client.post(
        "/",
        headers=auth_headers(role="staff"),
        json=session_payload(),
    )

    assert create_response.status_code == 201
    session_id = create_response.json()["id"]

    list_response = client.get("/")
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1

    update_response = client.put(
        f"/{session_id}",
        headers=auth_headers(role="superuser"),
        json={"salon": "Auditorio B"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["salon"] == "Auditorio B"

    delete_response = client.delete(f"/{session_id}", headers=auth_headers(role="superuser"))
    assert delete_response.status_code == 204
    assert client.get("/").json()["total"] == 0
