import pika
import json
import os
import time

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "shared-rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")

def callback(ch, method, properties, body):
    routing_key = method.routing_key
    try:
        evento = json.loads(body)
    except Exception as e:
        print(f"❌ Error decodificando evento: {e}")
        return

    print(f"\n📩 Evento recibido [{routing_key}]:")
    
    if routing_key == "ponencia.creada":
        titulo = evento.get("titulo", "N/A")
        print(f"📢 [NOTIFICACIÓN] Nueva ponencia creada: '{titulo}'.")
        print(f"📧 Enviando aviso general a todos los interesados...")

    elif routing_key == "agenda.sesion_actualizada":
        titulo = evento.get("titulo", "N/A")
        cambios = evento.get("cambios", {})
        afectados = evento.get("afectados", [])
        
        print(f"⚠️ [NOTIFICACIÓN] La sesión '{titulo}' ha sido modificada.")
        for campo, nuevo_valor in cambios.items():
            print(f"   - Cambio en {campo}: {nuevo_valor}")
        
        print(f"📧 Enviando correos urgentes a {len(afectados)} usuarios preinscritos...")
        for user_id in afectados:
            print(f"   >> Notificando a usuario: {user_id}")

    elif routing_key == "usuario.registrado":
        correo = evento.get("correo", "N/A")
        print(f"📧 [NOTIFICACIÓN] Enviando correo de bienvenida a: {correo}")

    else:
        print(f"ℹ️ Evento recibido (sin acción específica): {routing_key}")

def iniciar_consumidor():
    print(f"🎧 Conectando a RabbitMQ en {RABBITMQ_HOST}...")
    
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
    
    # Reintento de conexión (útil en Docker al arrancar)
    for i in range(10):
        try:
            connection = pika.BlockingConnection(parameters)
            break
        except Exception as e:
            print(f"⏳ Esperando a RabbitMQ... ({i+1}/10)")
            time.sleep(5)
    else:
        print("❌ No se pudo conectar a RabbitMQ.")
        return

    channel = connection.channel()

    # Declaramos el exchange tipo 'topic'
    channel.exchange_declare(exchange='coniiti_events', exchange_type='topic', durable=True)

    # Creamos una cola exclusiva para Notificaciones
    result = channel.queue_declare(queue='notifications_queue', durable=True)
    queue_name = result.method.queue

    # Nos suscribimos a los eventos de nuestro interés
    # # captura todos los eventos del exchange
    channel.queue_bind(exchange='coniiti_events', queue=queue_name, routing_key='#')

    print("🎧 Esperando eventos en 'notifications_queue'. Presiona CTRL+C para salir.")

    channel.basic_consume(
        queue=queue_name,
        on_message_callback=callback,
        auto_ack=True
    )

    channel.start_consuming()

if __name__ == "__main__":
    iniciar_consumidor()