from datetime import datetime, timezone
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .models import NotificationEvent


class DuplicateEventError(Exception):
    """Raised when a message with the same event_id was already processed."""


class InvalidPayloadError(Exception):
    """Raised when an event payload should be discarded."""


def _require_str(payload: dict[str, Any], field: str) -> str:
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip():
        raise InvalidPayloadError(f"'{field}' es obligatorio y debe ser string.")
    return value.strip()


def _require_list(payload: dict[str, Any], field: str) -> list[Any]:
    value = payload.get(field)
    if not isinstance(value, list):
        raise InvalidPayloadError(f"'{field}' debe ser una lista.")
    return value


def _require_dict(payload: dict[str, Any], field: str) -> dict[str, Any]:
    value = payload.get(field)
    if not isinstance(value, dict):
        raise InvalidPayloadError(f"'{field}' debe ser un objeto JSON.")
    return value


def process_event(routing_key: str, payload: dict[str, Any]) -> str:
    _require_str(payload, "event_id")

    if routing_key == "usuario.registrado":
        email = _require_str(payload, "email")
        name = _require_str(payload, "name")
        return f"Correo de bienvenida preparado para {name} <{email}>."

    if routing_key == "ponencia.creada":
        titulo = _require_str(payload, "titulo")
        ponente = _require_str(payload, "ponente")
        return f"Notificacion general preparada para la nueva ponencia '{titulo}' de {ponente}."

    if routing_key == "agenda.sesion_actualizada":
        titulo = _require_str(payload, "titulo")
        cambios = _require_dict(payload, "cambios")
        afectados = _require_list(payload, "afectados")
        if not cambios:
            raise InvalidPayloadError("'cambios' no puede estar vacio.")
        return (
            f"Actualizacion de agenda preparada para {len(afectados)} usuarios sobre '{titulo}'."
        )

    raise InvalidPayloadError(f"Routing key no soportada: {routing_key}")


def persist_processed_event(
    db: Session,
    routing_key: str,
    payload: dict[str, Any],
    action_summary: str,
) -> NotificationEvent:
    record = NotificationEvent(
        event_id=str(payload["event_id"]),
        routing_key=routing_key,
        status="processed",
        action_summary=action_summary,
        payload=payload,
        processed_at=datetime.now(timezone.utc),
    )
    db.add(record)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateEventError("El evento ya fue procesado previamente.") from exc

    db.refresh(record)
    return record
