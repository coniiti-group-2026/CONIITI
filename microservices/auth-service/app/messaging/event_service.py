import json
import uuid
from datetime import datetime, timezone

import pika

from app.config import settings
from app.models.auth_user import AuthUser


class EventPublishError(Exception):
    """Raised when the auth service cannot publish its integration event."""


def build_user_registered_event(user: AuthUser) -> dict:
    return {
        "event_id": str(uuid.uuid4()),
        "event": "usuario.registrado",
        "user_id": user.id,
        "email": user.email,
        "name": user.full_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def publish_user_registered(user: AuthUser) -> None:
    credentials = pika.PlainCredentials(
        settings.RABBITMQ_USER,
        settings.RABBITMQ_PASS,
    )
    parameters = pika.ConnectionParameters(
        host=settings.RABBITMQ_HOST,
        credentials=credentials,
    )
    payload = build_user_registered_event(user)

    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.exchange_declare(
            exchange=settings.RABBITMQ_EXCHANGE,
            exchange_type="topic",
            durable=True,
        )
        channel.basic_publish(
            exchange=settings.RABBITMQ_EXCHANGE,
            routing_key="usuario.registrado",
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        connection.close()
    except Exception as exc:
        raise EventPublishError("No se pudo publicar usuario.registrado.") from exc
