from sqlalchemy import Column, String
from app.database.connection import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String)
    email = Column(String, unique=True)
    role = Column(String)
