# ============================================================
# Configuración Central — CONIITI API
# Carga las variables de entorno desde el archivo .env
# y las expone como objeto de configuración tipado.
# ============================================================

from pydantic_settings import BaseSettings


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
    AUTH_SERVICE_URL: str = "http://auth-service:8000"
    USERS_SERVICE_URL: str = "http://users-service:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Instancia única compartida por toda la aplicación (patrón Singleton implícito)
settings = Settings()
