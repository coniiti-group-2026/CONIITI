import pytest

from app.services import InvalidPayloadError, process_event


def test_process_user_registered_event_builds_welcome_summary():
    summary = process_event(
        "usuario.registrado",
        {
            "event_id": "evt-001",
            "email": "ada@coniiti.edu",
            "name": "Ada Lovelace",
        },
    )

    assert "Ada Lovelace" in summary
    assert "ada@coniiti.edu" in summary


def test_process_agenda_update_requires_non_empty_changes():
    with pytest.raises(InvalidPayloadError):
        process_event(
            "agenda.sesion_actualizada",
            {
                "event_id": "evt-002",
                "titulo": "Arquitectura distribuida",
                "cambios": {},
                "afectados": ["user-1"],
            },
        )


def test_process_event_rejects_unsupported_routing_key():
    with pytest.raises(InvalidPayloadError):
        process_event("desconocido", {"event_id": "evt-003"})
