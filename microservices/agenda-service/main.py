from fastapi import FastAPI
from routers import agenda
from database import engine, Base

# Crear tablas en el inicio (Auto-migración simple)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CONIITI Agenda Service",
    version="1.0.0",
    description="Microservicio para la gestión de sesiones, ponencias y horarios del Congreso CONIITI."
)

app.include_router(agenda.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "agenda-service"}

@app.get("/")
def root():
    return {"message": "Welcome to Agenda Service"}
