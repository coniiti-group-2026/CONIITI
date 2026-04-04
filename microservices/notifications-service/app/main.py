import threading
import time

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from .consumer import start_consumer
from .database import Base, SessionLocal, engine, get_db
from .models import NotificationEvent


DATABASE_READY_ATTEMPTS = 15
DATABASE_READY_DELAY_SECONDS = 2


def initialize_database() -> None:
    last_error: Exception | None = None

    for attempt in range(DATABASE_READY_ATTEMPTS):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            return
        except Exception as exc:
            last_error = exc
            if attempt == DATABASE_READY_ATTEMPTS - 1:
                break
            time.sleep(DATABASE_READY_DELAY_SECONDS)

    if last_error is not None:
        raise last_error


initialize_database()

app = FastAPI(title="Notifications Service", version="1.0.0")


@app.get("/health")
def health_check():
    db = SessionLocal()
    try:
        total_events = db.query(NotificationEvent).count()
    finally:
        db.close()
    return {"status": "ok", "service": "notifications", "stored_events": total_events}


@app.get("/events")
def list_events(limit: int = 25, db: Session = Depends(get_db)):
    records = (
        db.query(NotificationEvent)
        .order_by(NotificationEvent.processed_at.desc())
        .limit(max(1, min(limit, 100)))
        .all()
    )
    return {
        "total": len(records),
        "events": [
            {
                "event_id": record.event_id,
                "routing_key": record.routing_key,
                "status": record.status,
                "action_summary": record.action_summary,
                "processed_at": record.processed_at,
            }
            for record in records
        ],
    }


@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=start_consumer, daemon=True, name="notifications-consumer")
    thread.start()


@app.get("/")
def root():
    return {"message": "Notifications Service is Running"}
