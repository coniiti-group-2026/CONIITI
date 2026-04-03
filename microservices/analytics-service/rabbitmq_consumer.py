import pika
import os
import json
import asyncio
from database import events_collection

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")

def process_message(ch, method, properties, body):
    try:
        event_data = json.loads(body)
        print("Recibido evento:", event_data)
        
        # Como es async, creamos una tarea
        loop = asyncio.get_event_loop()
        loop.create_task(save_to_mongo(event_data))
        
        # Confirmamos que se procesó bien
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Error procesando el evento: {str(e)}")
        # No ack, el mensaje vuele a la cola (en prod, enviar a DLQ)

async def save_to_mongo(data: dict):
    # Inserta asincrónicamente
    await events_collection.insert_one(data)
    print("Guardado en MongoDB")

def start_consumer():
    """Conecta a RabbitMQ y empieza a escuchar."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(RABBITMQ_HOST, 5672, '/', credentials)
    
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Declaramos la cola (debe ser la misma que usen Users y Agenda)
        channel.queue_declare(queue='analytics_queue', durable=True)
        
        print(' [*] Esperando mensajes en analytics_queue...')
        
        # Empezar a consumir
        channel.basic_consume(queue='analytics_queue', on_message_callback=process_message)
        channel.start_consuming()
    except Exception as e:
        print(f"No se pudo conectar a RabbitMQ analíticas: {e}")
