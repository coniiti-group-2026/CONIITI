import os


class Settings:
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@users-db:5432/usersdb",
    )
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        os.getenv("SECRET_KEY", "change-me"),
    )
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")
    INTERNAL_SERVICE_TOKEN = os.getenv("INTERNAL_SERVICE_TOKEN", "coniiti-internal-token")


settings = Settings()
