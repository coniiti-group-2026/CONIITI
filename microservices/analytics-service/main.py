import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import database, events_collection
from rabbitmq_consumer import start_consumer


app = FastAPI(title="Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_consumer())


@app.get("/health")
async def health_check():
    await database.command("ping")
    return {"status": "ok", "service": "analytics-service"}


@app.get("/")
def root():
    return {"message": "analytics-service running"}


@app.get("/stats")
async def get_stats():
    total_events = await events_collection.count_documents({})
    pipeline = [{"$group": {"_id": "$event", "count": {"$sum": 1}}}]
    cursor = events_collection.aggregate(pipeline)
    by_type = await cursor.to_list(length=100)

    return {
        "total_events_logged": total_events,
        "breakdown_by_type": by_type,
    }
