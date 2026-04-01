from fastapi import FastAPI
from app.routes.users import router

app = FastAPI()

app.include_router(router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "users-service running"}
