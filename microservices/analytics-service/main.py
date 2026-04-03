from fastapi import FastAPI
import threading
from rabbitmq_consumer import start_consumer
from database import events_collection

app = FastAPI(title="Analytics Service")

@app.on_event("startup")
def startup_event():
    """Inicia el consumidor de RabbitMQ en un hilo de fondo al prender la API."""
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()

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
