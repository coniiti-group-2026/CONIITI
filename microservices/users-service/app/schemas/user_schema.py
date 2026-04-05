from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


def _normalize_role(value: str | None) -> str | None:
    if value is None:
        return value
    return value.strip().lower()


class ProfileCreateRequest(BaseModel):
    id: Optional[str] = None
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    role: str
    institution: Optional[str] = None
    is_active: bool = True

    @field_validator("role")
    @classmethod
    def normalize_role(cls, value: str) -> str:
        return _normalize_role(value)


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    institution: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("role")
    @classmethod
    def normalize_role(cls, value: str | None) -> str | None:
        return _normalize_role(value)


class StaffCreateRequest(ProfileCreateRequest):
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class StaffUpdateRequest(ProfileUpdateRequest):
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str
    institution: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    @field_validator("role")
    @classmethod
    def normalize_role(cls, value: str) -> str:
        return _normalize_role(value)

    class Config:
        from_attributes = True


# Compatibilidad temporal con nombres anteriores.
UserCreate = StaffCreateRequest
UserUpdate = StaffUpdateRequest
UserResponse = ProfileResponse
