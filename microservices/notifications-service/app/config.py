import os


class Settings:
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@notifications-db:5432/notificationsdb",
    )
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "shared-rabbitmq")
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
    RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")
    RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "coniiti_events")
    RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "notifications_queue")
    RABBITMQ_BINDING_KEY = os.getenv("RABBITMQ_BINDING_KEY", "#")


settings = Settings()
