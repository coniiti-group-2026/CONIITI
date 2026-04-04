import os
import json
import asyncio
import aio_pika
from database import events_collection

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")

async def process_message(message: aio_pika.IncomingMessage):
    """Procesa el mensaje asíncronamente y confirma su recepción."""
    async with message.process(): # Automáticamente envía ACK si no hay excepciones
        try:
            body = message.body.decode()
            event_data = json.loads(body)
            print("Recibido evento:", event_data)
            
            # Almacena en la base de datos (Motor es 100% async)
            await save_to_mongo(event_data)
        except Exception as e:
            print(f"Error procesando el evento: {str(e)}")
            # Al usar message.process(), una excepción no controlada aquí mandaría un NACK
            # Para evitar que el mensaje atasque la cola infinitamente en caso de bug,
            # podríamos manejar la excepción y dejar que el 'async with' mande un ACK de todos modos.
            # (El mensaje se procesó operativamente aunque tuvo problemas lógicos).

async def save_to_mongo(data: dict):
    """Guarda el evento de análisis en MongoDB."""
    await events_collection.insert_one(data)
    print("Guardado en MongoDB")

async def start_consumer():
    """Conecta a RabbitMQ y empieza a escuchar indefinidamente de forma asíncrona."""
    # Construye la URL de conexión AMQP
    amqp_url = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_HOST}/"
    
    # Intenta la conexión (puede requerir reintentos en un entorno dockerizado real)
    try:
        connection = await aio_pika.connect_robust(amqp_url)
        channel = await connection.channel()
        
        # Opcional: configurar prefetch count para procesar varios a la vez
        await channel.set_qos(prefetch_count=10)
        
        # Declaramos la cola para asegurar que existe
        queue = await channel.declare_queue("analytics_queue", durable=True)
        
        print(' [*] Esperando mensajes en analytics_queue...')
        
        # Empezar a consumir mensajes (conecta la función `process_message`)
        await queue.consume(process_message)
        
        # Mantener el loop corriendo (este await nunca termina a menos que la app cierre)
        await asyncio.Future()
    except Exception as e:
        print(f"No se pudo conectar a RabbitMQ analíticas: {e}")
