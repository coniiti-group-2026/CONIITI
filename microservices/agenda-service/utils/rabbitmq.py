import pika
import os
import json

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "shared-rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")

def publish_event(routing_key: str, message: dict):
    """Publica un evento en RabbitMQ."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
    
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Aseguramos que el exchange exista (usaremos uno simple por defecto o tipo 'topic')
        channel.exchange_declare(exchange='coniiti_events', exchange_type='topic', durable=True)
        
        channel.basic_publish(
            exchange='coniiti_events',
            routing_key=routing_key,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Mensaje persistente
            )
        )
        connection.close()
        print(f" [x] Sent '{routing_key}': {message}")
    except Exception as e:
        print(f" [!] Error publishing to RabbitMQ: {e}")
