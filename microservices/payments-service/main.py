from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import payments

app = FastAPI(
    title="Payments Service",
    description="Microservicio para la simulacion de pagos del CONIITI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear las tablas en la base de datos si no existen.
Base.metadata.create_all(bind=engine)


@app.get("/api/payments/health")
def health_check():
    return {"status": "ok", "service": "payments"}


app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
