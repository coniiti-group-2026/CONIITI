import os


class Settings:
    PROJECT_NAME = "CONIITI Auth Service"
    VERSION = "1.0.0"

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./auth_service.db",
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        os.getenv("SECRET_KEY", "change-me"),
    )
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )
    OTP_EXPIRATION_MINUTES = int(
        os.getenv("OTP_EXPIRATION_MINUTES", "10")
    )
    OAUTH_STATE_EXPIRE_MINUTES = int(
        os.getenv("OAUTH_STATE_EXPIRE_MINUTES", "10")
    )
    RESET_PASSWORD_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("RESET_PASSWORD_TOKEN_EXPIRE_MINUTES", "30")
    )
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://users-service:8000")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    FRONTEND_LOGIN_PATH = os.getenv("FRONTEND_LOGIN_PATH", "/login")
    FRONTEND_RESET_PASSWORD_PATH = os.getenv(
        "FRONTEND_RESET_PASSWORD_PATH",
        "/restablecer-contrasena",
    )

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://localhost/api/auth/oauth/google/callback",
    )

    MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID", "")
    MICROSOFT_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET", "")
    MICROSOFT_TENANT_ID = os.getenv("MICROSOFT_TENANT_ID", "common")
    MICROSOFT_REDIRECT_URI = os.getenv(
        "MICROSOFT_REDIRECT_URI",
        "http://localhost/api/auth/oauth/microsoft/callback",
    )

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "CONIITI")

    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "shared-rabbitmq")
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
    RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")
    RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "coniiti_events")
    INTERNAL_SERVICE_TOKEN = os.getenv("INTERNAL_SERVICE_TOKEN", "coniiti-internal-token")


settings = Settings()
