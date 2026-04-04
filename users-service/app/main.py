from fastapi import FastAPI
from app.routes.users import router
from app.database.connection import engine, Base
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "users-service running"}