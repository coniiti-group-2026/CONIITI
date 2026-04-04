import threading
from fastapi import FastAPI
from app import consumer

app = FastAPI(title="Notifications Service", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "notifications"}

@app.on_event("startup")
def startup_event():
    # Iniciar el consumidor en un hilo separado para no bloquear la API
    thread = threading.Thread(target=consumer.iniciar_consumidor, daemon=True)
    thread.start()
    print("🚀 Consumidor de Notificaciones iniciado en segundo plano.")

@app.get("/")
def root():
    return {"message": "Notifications Service is Running"}