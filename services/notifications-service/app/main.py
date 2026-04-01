from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Modelo de datos
class Notificacion(BaseModel):
    correo: str
    asunto: str
    mensaje: str

@app.get("/")
def home():
    return {"mensaje": "Servicio de notificaciones CONIITI activo"}

@app.post("/notificar")
def enviar_notificacion(notificacion: Notificacion):
    return {
        "estado": "enviado",
        "correo": notificacion.correo,
        "asunto": notificacion.asunto,
        "mensaje": notificacion.mensaje
    }