import pika
import os
import json

import logging

logger = logging.getLogger(__name__)

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST")
RABBITMQ_USER = os.getenv("RABBITMQ_USER")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS")

if not all([RABBITMQ_HOST, RABBITMQ_USER, RABBITMQ_PASS]):
    raise ValueError("Faltan variables de entorno obligatorias para RabbitMQ (RABBITMQ_HOST, RABBITMQ_USER, RABBITMQ_PASS).")

def publish_event(routing_key: str, message: dict):
    """Publica un evento en RabbitMQ."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
    
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        exchange_name = 'coniiti_events'
        
        # Explicar exchange y propiedades de publicación
        channel.exchange_declare(exchange=exchange_name, exchange_type='topic', durable=True)
        
        channel.basic_publish(
            exchange=exchange_name,
            routing_key=routing_key,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Mensaje persistente (2 = PERSISTENT_DELIVERY_MODE)
                content_type='application/json'
            )
        )
        connection.close()
        logger.info(f" [x] Sent '{routing_key}': {message}")
    except Exception as e:
        logger.error(f" [!] Error publishing to RabbitMQ: {e}")
        # Relanzamos la excepción para evitar inconsistencia si hay transacciones en BD
        raise Exception(f"Falla crítica publicando en RabbitMQ: {e}") from e
