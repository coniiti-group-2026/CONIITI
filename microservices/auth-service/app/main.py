from fastapi import FastAPI

from app.config import settings
from app.database.connection import Base, engine
from app.models.auth_user import AuthUser
from app.models.password_reset_token import PasswordResetToken
from app.routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Microservicio desacoplado para autenticacion de usuarios en CONIITI.",
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "auth-service running",
        "docs": "/docs",
    }
