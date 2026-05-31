import os

os.environ["DATABASE_URL"] = "sqlite://"

from pydantic import ValidationError
import pytest

from app.models.agenda import SessionEventType, SessionModality, SessionTrack
from app.schemas.agenda import SessionCreate


def base_payload():
    return {
        "titulo": "Arquitecturas distribuidas",
        "ponente": "Dra. Ana Mesa",
        "track": SessionTrack.DESARROLLO,
        "event_type": SessionEventType.CONFERENCE,
        "dia": "2026-10-01",
        "hora_inicio": "09:00",
        "hora_fin": "10:00",
        "salon": "Auditorio A",
        "modalidad": SessionModality.PRESENCIAL,
        "cupos_totales": 40,
    }


def test_session_create_accepts_core_event_fields():
    session = SessionCreate(**base_payload())

    assert session.titulo == "Arquitecturas distribuidas"
    assert session.cupos_totales == 40


def test_session_create_requires_track():
    payload = base_payload()
    payload.pop("track")

    with pytest.raises(ValidationError):
        SessionCreate(**payload)
