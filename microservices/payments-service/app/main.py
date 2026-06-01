import json
import logging
import time
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.api import payments


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

app = FastAPI(
    title="Payments Service",
    description="Microservicio para la gestion de pagos del CONIITI",
    version="1.0.0",
)

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

logging.basicConfig(level=logging.INFO)
access_logger = logging.getLogger("coniiti.access")


@app.middleware("http")
async def structured_access_log(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        access_logger.exception(json.dumps({
            "service": "payments-service",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": 500,
            "duration_ms": duration_ms,
            "error": str(exc),
        }))
        raise

    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    response.headers["x-request-id"] = request_id
    access_logger.info(json.dumps({
        "service": "payments-service",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration_ms,
    }))
    return response

@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "service": "payments-service", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Conexión con base de datos fallida")


@app.get("/")
def root():
    return {"message": "payments-service running"}


app.include_router(payments.router, tags=["payments"])
