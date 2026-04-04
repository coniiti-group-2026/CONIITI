import json
import os
import time
from typing import Any

import pika

EXCHANGE_NAME = "coniiti_events"
QUEUE_NAME = "notifications_queue"
QUEUE_BINDING_KEY = "#"
RETRYABLE_EXCEPTIONS = (pika.exceptions.AMQPError, OSError, RuntimeError)

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "shared-rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")


class InvalidPayloadError(Exception):
    """Raised when an event payload should be discarded."""


def create_connection_parameters() -> pika.ConnectionParameters:
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    return pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        credentials=credentials,
        heartbeat=30,
        blocked_connection_timeout=30,
        connection_attempts=1,
        socket_timeout=10,
    )


def handle_event(routing_key: str, payload: dict[str, Any]) -> None:
    print(f"\nEvent received [{routing_key}]: {payload}")

    if routing_key == "ponencia.creada":
        titulo = payload.get("titulo", "N/A")
        print(f"[NOTIFICATION] Nueva ponencia creada: '{titulo}'.")
        print("[EMAIL] Enviando aviso general a todos los interesados...")
        return

    if routing_key == "agenda.sesion_actualizada":
        titulo = payload.get("titulo", "N/A")
        cambios = payload.get("cambios", {})
        afectados = payload.get("afectados", [])

        if not isinstance(cambios, dict):
            raise InvalidPayloadError("'cambios' debe ser un objeto JSON.")
        if not isinstance(afectados, list):
            raise InvalidPayloadError("'afectados' debe ser una lista.")

        print(f"[NOTIFICATION] La sesion '{titulo}' ha sido modificada.")
        for campo, nuevo_valor in cambios.items():
            print(f" - Cambio en {campo}: {nuevo_valor}")

        print(f"[EMAIL] Enviando correos urgentes a {len(afectados)} usuarios preinscritos...")
        for user_id in afectados:
            print(f" >> Notificando a usuario: {user_id}")
        return

    if routing_key == "usuario.registrado":
        correo = payload.get("email") or payload.get("correo", "N/A")
        nombre = payload.get("name") or payload.get("full_name", "usuario")
        print(f"[NOTIFICATION] Registro detectado para: {nombre} <{correo}>")
        print(f"[EMAIL] Enviando correo de bienvenida a: {correo}")
        return

    print(f"[INFO] Evento recibido sin accion especifica: {routing_key}")


def _process_delivery(
    channel: pika.adapters.blocking_connection.BlockingChannel,
    method: pika.spec.Basic.Deliver,
    body: bytes,
) -> None:
    try:
        decoded_body = body.decode("utf-8")
        payload = json.loads(decoded_body)
        if not isinstance(payload, dict):
            raise InvalidPayloadError("El payload JSON debe ser un objeto.")

        handle_event(method.routing_key, payload)
    except InvalidPayloadError as exc:
        print(f"[ERROR] Payload invalido descartado: {exc}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return
    except json.JSONDecodeError as exc:
        print(f"[ERROR] No se pudo decodificar el JSON: {exc}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return
    except RETRYABLE_EXCEPTIONS as exc:
        print(f"[WARN] Error reintentable procesando evento: {exc}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        return
    except Exception as exc:
        print(f"[WARN] Error inesperado procesando evento, se reintentara: {exc}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        return

    channel.basic_ack(delivery_tag=method.delivery_tag)


def consume_forever() -> None:
    parameters = create_connection_parameters()
    backoff_seconds = 5

    while True:
        connection = None

        try:
            print(f"Connecting to RabbitMQ at {RABBITMQ_HOST}...")
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="topic", durable=True)
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.queue_bind(
                exchange=EXCHANGE_NAME,
                queue=QUEUE_NAME,
                routing_key=QUEUE_BINDING_KEY,
            )
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=lambda ch, method, properties, body: _process_delivery(
                    ch, method, body
                ),
                auto_ack=False,
            )

            print(f"Waiting for events in '{QUEUE_NAME}' bound to '{EXCHANGE_NAME}'.")
            backoff_seconds = 5
            channel.start_consuming()
        except KeyboardInterrupt:
            print("Notifications consumer stopped by user.")
            break
        except pika.exceptions.AMQPConnectionError as exc:
            print(f"[WARN] RabbitMQ unavailable: {exc}")
        except pika.exceptions.AMQPChannelError as exc:
            print(f"[WARN] RabbitMQ channel error: {exc}")
        except Exception as exc:
            print(f"[WARN] Consumer stopped unexpectedly: {exc}")
        finally:
            if connection is not None:
                try:
                    if connection.is_open:
                        connection.close()
                except Exception:
                    pass

        print(f"Reconnecting in {backoff_seconds} seconds...")
        time.sleep(backoff_seconds)
        backoff_seconds = min(backoff_seconds * 2, 30)


def start_consumer() -> None:
    consume_forever()


if __name__ == "__main__":
    start_consumer()
