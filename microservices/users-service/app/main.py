import time

from fastapi import FastAPI
from sqlalchemy import text

from app.routes.users import router
from app.database.connection import engine, Base
from app.models.user import User


DATABASE_READY_ATTEMPTS = 15
DATABASE_READY_DELAY_SECONDS = 2


def initialize_database() -> None:
    last_error: Exception | None = None

    for attempt in range(DATABASE_READY_ATTEMPTS):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            return
        except Exception as exc:
            last_error = exc
            if attempt == DATABASE_READY_ATTEMPTS - 1:
                break
            time.sleep(DATABASE_READY_DELAY_SECONDS)

    if last_error is not None:
        raise last_error


initialize_database()

app = FastAPI()

app.include_router(router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "users-service running"}
