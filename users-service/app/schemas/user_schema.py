from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: str
    role: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True
