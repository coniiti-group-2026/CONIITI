import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine
from app.models import AuthUser, OTPCode, PasswordResetToken  # noqa: F401
from app.api.auth import router as auth_router


DATABASE_READY_ATTEMPTS = 15
DATABASE_READY_DELAY_SECONDS = 2


def _ensure_schema_updates() -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    if "auth_users" in table_names:
        auth_user_columns = {column["name"] for column in inspector.get_columns("auth_users")}
        if "is_verified" not in auth_user_columns:
            with engine.begin() as connection:
                connection.execute(
                    text(
                        "ALTER TABLE auth_users "
                        "ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT TRUE"
                    )
                )


def initialize_database() -> None:
    last_error: Exception | None = None

    for attempt in range(DATABASE_READY_ATTEMPTS):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            _ensure_schema_updates()
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
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Microservicio desacoplado para autenticacion de usuarios en CONIITI.",
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

app.include_router(auth_router)

@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Conexión con base de datos fallida")

@app.get("/")
def root():
    return {
        "message": "auth-service running",
        "docs": "/docs",
    }
