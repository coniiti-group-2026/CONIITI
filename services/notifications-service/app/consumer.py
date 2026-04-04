import pika
import json

def callback(ch, method, properties, body):
    evento = json.loads(body)

    print("\n📩 Evento recibido:")
    print(evento)

    if evento.get("tipo") == "usuario.registrado":
        print(f"📧 Enviando correo de bienvenida a {evento['correo']}")

    elif evento.get("tipo") == "ponencia.creada":
        print(f"📢 Notificando nueva ponencia: {evento['titulo']}")

    else:
        print("⚠️ Evento no reconocido")

def iniciar_consumidor():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost')
    )
    channel = connection.channel()

    # 👇 IMPORTANTE: misma cola que usaste en RabbitMQ
    channel.queue_declare(queue='notificaciones', durable=True)

    print("🎧 Esperando eventos...")

    channel.basic_consume(
        queue='notificaciones',
        on_message_callback=callback,
        auto_ack=True
    )

    channel.start_consuming()
    #comentario