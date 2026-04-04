from fastapi import FastAPI
import asyncio
from rabbitmq_consumer import start_consumer
from database import events_collection

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Analytics Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Inicia el consumidor de RabbitMQ en el loop de eventos de FastAPI al prender la API."""
    asyncio.create_task(start_consumer())

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "analytics"}

@app.get("/api/analytics/stats")
async def get_stats():
    """Devuelve conteos básicos para el Dashboard administrativo."""
    total_events = await events_collection.count_documents({})
    
    # Ejemplo de agregación básica en MongoDB (Contar por tipo de evento)
    pipeline = [
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}}
    ]
    cursor = events_collection.aggregate(pipeline)
    by_type = await cursor.to_list(length=100)
    
    return {
        "total_events_logged": total_events,
        "breakdown_by_type": by_type
    }
