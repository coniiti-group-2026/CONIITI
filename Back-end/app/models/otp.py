# ============================================================
# Modelo de Código OTP — CONIITI API
# Define la tabla 'otp_codes' en PostgreSQL.
# Almacena los códigos de 6 dígitos enviados por correo
# para verificar el registro y el inicio de sesión OAuth.
# ============================================================

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class OTPPurpose(str, enum.Enum):
    """Propósito del código OTP generado."""
    REGISTER       = "register"        # Verificación al registrarse
    LOGIN          = "login"           # Verificación al iniciar sesión
    PASSWORD_RESET = "password_reset"  # Recuperación de contraseña


class OTPCode(Base):
    """
    Almacena un código OTP de 6 dígitos enviado al correo del usuario.
    Cada código tiene una expiración de 10 minutos y puede usarse una sola vez.
    """
    __tablename__ = "otp_codes"

    # --- Identificador único ---
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # --- Referencia al usuario propietario ---
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # --- Código de 6 dígitos (almacenado como string) ---
    code = Column(String(6), nullable=False)

    # --- Propósito del código ---
    purpose = Column(Enum(OTPPurpose), nullable=False)

    # --- Control de uso ---
    used = Column(Boolean, nullable=False, default=False)

    # --- Control de tiempo ---
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # --- Relación inversa con el usuario ---
    user = relationship("User", back_populates="otp_codes")

    def is_expired(self) -> bool:
        """Retorna True si el código ya caducó."""
        return datetime.now(timezone.utc) > self.expires_at

    def __repr__(self) -> str:
        return f"<OTPCode user_id={self.user_id} purpose={self.purpose} used={self.used}>"
