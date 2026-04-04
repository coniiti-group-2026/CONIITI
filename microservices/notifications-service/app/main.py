import threading

from fastapi import FastAPI

from .consumer import start_consumer

app = FastAPI(title="Notifications Service", version="1.0.0")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "notifications"}


@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=start_consumer, daemon=True, name="notifications-consumer")
    thread.start()
    print("Notifications consumer started in background.")


@app.get("/")
def root():
    return {"message": "Notifications Service is Running"}
