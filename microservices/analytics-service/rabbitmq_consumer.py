import asyncio
import json
import os

import aio_pika

from database import events_collection


RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "shared-rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")
RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "coniiti_events")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "analytics_queue")
RABBITMQ_BINDING_KEY = os.getenv("RABBITMQ_BINDING_KEY", "#")


async def save_to_mongo(data: dict) -> None:
    await events_collection.insert_one(data)


async def process_message(message: aio_pika.IncomingMessage) -> None:
    async with message.process():
        try:
            body = message.body.decode()
            event_data = json.loads(body)
            if isinstance(event_data, dict):
                await save_to_mongo(event_data)
        except Exception as exc:
            print(f"Error procesando evento analytics: {exc}")


async def start_consumer() -> None:
    amqp_url = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_HOST}/"
    retry_delay_seconds = 5

    while True:
        try:
            connection = await aio_pika.connect_robust(amqp_url)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=10)

                exchange = await channel.declare_exchange(
                    RABBITMQ_EXCHANGE,
                    aio_pika.ExchangeType.TOPIC,
                    durable=True,
                )
                queue = await channel.declare_queue(RABBITMQ_QUEUE, durable=True)
                await queue.bind(exchange, routing_key=RABBITMQ_BINDING_KEY)
                await queue.consume(process_message)

                await asyncio.Future()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            print(f"No se pudo conectar analytics-service a RabbitMQ: {exc}")
            await asyncio.sleep(retry_delay_seconds)
