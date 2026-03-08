# ============================================================
# Configuración Central — CONIITI API
# Carga las variables de entorno desde el archivo .env
# y las expone como objeto de configuración tipado.
# ============================================================

from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl


class Settings(BaseSettings):
    """Configuración global de la aplicación cargada desde variables de entorno."""

    # --- Identificación ---
    PROJECT_NAME: str = "CONIITI API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # --- Base de datos ---
    DATABASE_URL: str

    # --- JWT ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # --- CORS ---
    FRONTEND_URL: str = "http://localhost:3000"

    # --- Microsoft OAuth ---
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    MICROSOFT_TENANT_ID: str = "common"
    MICROSOFT_REDIRECT_URI: str = "http://localhost:8000/auth/oauth/microsoft/callback"

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/oauth/google/callback"

    # --- SMTP (correo OTP) ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM_NAME: str = "CONIITI 2026"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Instancia única compartida por toda la aplicación (patrón Singleton implícito)
settings = Settings()