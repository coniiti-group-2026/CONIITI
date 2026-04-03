import os
import motor.motor_asyncio

MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:adminpassword@localhost:27017")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
database = client["analytics_db"]

# Colecciones
events_collection = database.get_collection("events")
