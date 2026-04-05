# ============================================================
# Modelo de Usuario — CONIITI API
# Define la tabla 'users' en PostgreSQL.
# Soporta autenticación local y OAuth (Microsoft, Google),
# roles de acceso y verificación en dos pasos (2FA).
# ============================================================

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    """Roles de acceso disponibles en la plataforma."""
    SUPERUSER = "superuser"
    STAFF = "staff"
    STUDENT = "student"
    EXTERNAL = "external"


class AuthProvider(str, enum.Enum):
    """Proveedor de autenticación utilizado al crear la cuenta."""
    LOCAL = "local"
    MICROSOFT = "microsoft"
    GOOGLE = "google"


class User(Base):
    """
    Representa a un usuario registrado en la plataforma CONIITI.
    Almacena datos de identidad, autenticación y estado de la cuenta.
    """
    __tablename__ = "users"

    # --- Identificador único ---
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # --- Datos personales ---
    full_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    institution = Column(String(255), nullable=True)

    # --- Contraseña (nullable: los usuarios OAuth no la tienen) ---
    hashed_password = Column(String, nullable=True)

    # --- Roles y proveedor de autenticación ---
    role = Column(Enum(UserRole), nullable=False, default=UserRole.EXTERNAL)
    auth_provider = Column(
        Enum(AuthProvider), nullable=False, default=AuthProvider.LOCAL
    )

    # --- Estado de la cuenta ---
    is_active = Column(Boolean, nullable=False, default=True)

    # --- Verificación de correo / 2FA ---
    # Se activa al completar el flujo OTP por primera vez
    is_verified = Column(Boolean, nullable=False, default=False)

    # --- 2FA avanzado (TOTP) — reservado para versiones futuras ---
    totp_secret = Column(String, nullable=True)

    # --- Auditoría legal: fecha de aceptación de política de datos ---
    accepted_data_policy = Column(DateTime(timezone=True), nullable=True)

    # --- Auditoría de registro ---
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # --- Relaciones ---
    sessions = relationship(
        "Session", back_populates="created_by_user", foreign_keys="Session.created_by"
    )
    registered_sessions = relationship(
        "Session", secondary="session_registrations", back_populates="registered_users"
    )
    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
