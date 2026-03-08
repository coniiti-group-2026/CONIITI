# ============================================================
# Esquemas de Usuario — CONIITI API
# Define los contratos de entrada/salida para operaciones
# CRUD sobre usuarios (principalmente cuentas staff).
# ============================================================

import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.models.user import UserRole, AuthProvider


class UserCreate(BaseModel):
    """Datos para crear una cuenta staff desde el panel del superusuario."""
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    institution: Optional[str] = Field(None, max_length=255)
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.STAFF


class UserUpdate(BaseModel):
    """Datos actualizables de un usuario. Todos los campos son opcionales."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    institution: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UserRead(BaseModel):
    """Representación pública de un usuario (sin contraseña)."""
    id: uuid.UUID
    full_name: str
    email: str
    institution: Optional[str]
    role: UserRole
    auth_provider: AuthProvider
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    """Representación compacta para listados de usuarios."""
    id: uuid.UUID
    full_name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
