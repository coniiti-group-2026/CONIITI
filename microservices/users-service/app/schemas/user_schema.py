from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    id: Optional[str] = None
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    role: str
    institution: Optional[str] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    institution: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str
    institution: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
