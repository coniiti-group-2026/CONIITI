import os
from datetime import datetime, timedelta, timezone

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret"
os.environ["INTERNAL_SERVICE_TOKEN"] = "test-internal-token"

from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


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
client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def auth_headers(role: str = "superuser") -> dict[str, str]:
    token = jwt.encode(
        {
            "sub": "00000000-0000-0000-0000-000000000001",
            "type": "access",
            "role": role,
            "email": "admin@coniiti.edu",
            "full_name": "Admin",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
        },
        "test-secret",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def test_committee_crud_for_superuser():
    create_response = client.post(
        "/members",
        headers=auth_headers(),
        json={
            "nombre": "Dra. Laura Rios",
            "cargo": "Comite cientifico",
            "institucion": "Universidad Catolica",
            "bio": "Coordina evaluacion academica.",
            "orden": 1,
            "activo": True,
        },
    )

    assert create_response.status_code == 201
    member_id = create_response.json()["id"]

    list_response = client.get("/members")
    assert list_response.status_code == 200
    assert list_response.json()[0]["nombre"] == "Dra. Laura Rios"

    update_response = client.patch(
        f"/members/{member_id}",
        headers=auth_headers(),
        json={"cargo": "Presidencia del comite"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["cargo"] == "Presidencia del comite"

    delete_response = client.delete(f"/members/{member_id}", headers=auth_headers())
    assert delete_response.status_code == 204
    assert client.get("/members").json() == []


def test_committee_write_requires_superuser():
    response = client.post(
        "/members",
        headers=auth_headers(role="staff"),
        json={"nombre": "Staff", "cargo": "Operacion"},
    )

    assert response.status_code == 403


def test_committee_rejects_blank_required_fields():
    response = client.post(
        "/members",
        headers=auth_headers(),
        json={"nombre": "  ", "cargo": "Comite cientifico"},
    )

    assert response.status_code == 422
