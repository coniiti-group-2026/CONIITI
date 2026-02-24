import uuid
import sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base import Base

class UserRole(str, enum.Enum):
    STUDENT: "student"
    EXTERNAL: "external"
    STAFF:"staff"
    WEBMASTER="webmaster"

class AuthProvider(str, enum.Enum):
    MICROSOFT = "microsoft" # de forma institucional
    GOOGLE = "google" # Externo
    LOCAL = "local" # Externo

class User(Base):
    __tablename__ = "users"

    # Usa UUID para que IDs sean seguros y no adivinables
    id = column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) #Nullable porque OAuth no usa password
    full_name = Column(String,index=True)

    # Manejo de Roles y Auth
    role = Column(Enum(UserRole), default=UserRole.EXTERNAL)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.LOCAL)

    # Estados
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False) # Para los emails externos

    # Auditoria legal
    accepted_data_policy = Column(DateTime, nullable=True) # Fecha exacta de aceptacion

    # Seguridad Staff
    totp_secret = Column(String, nullable=True) # Para 2FA

    