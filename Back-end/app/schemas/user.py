# ============================================================
# Esquemas de Usuario - CONIITI API
# Contratos usados por el panel de superusuario para gestionar
# cuentas staff a traves del monolito como fachada.
# ============================================================

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    institution: Optional[str] = Field(None, max_length=255)
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.STAFF


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    institution: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=8)


class UserRead(BaseModel):
    id: str | uuid.UUID
    full_name: str
    email: str
    institution: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None


class UserListItem(BaseModel):
    id: str | uuid.UUID
    full_name: str
    email: str
    institution: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None
