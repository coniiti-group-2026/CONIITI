from fastapi import FastAPI
import threading
from app.consumer import iniciar_consumidor

app = FastAPI()

@app.get("/")
def home():
    return {"mensaje": "Servicio de notificaciones activo (CONIITI)"}

# Ejecutar consumidor en segundo plano
threading.Thread(target=iniciar_consumidor, daemon=True).start()