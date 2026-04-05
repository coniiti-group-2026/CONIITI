import os

import motor.motor_asyncio


MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:adminpassword@analytics-mongo:27017/?authSource=admin")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "analytics_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
database = client[MONGO_DB_NAME]
events_collection = database.get_collection("events")
