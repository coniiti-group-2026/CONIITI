from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Payments Service",
    description="Microservicio para la simulación de pagos del CONIITI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from database import engine, Base
from routers import payments

# Crear las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Health check accesible en /api/payments/health (a través de Traefik)
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])

@app.get("/api/payments/health")
def health_check():
    return {"status": "ok", "service": "payments"}

