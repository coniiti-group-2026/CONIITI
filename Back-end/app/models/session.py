# ============================================================
# Modelo de Sesión (Conferencia) — CONIITI API
# Define la tabla 'sessions' en PostgreSQL.
# Representa cada conferencia, taller o panel del congreso.
# ============================================================

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Integer, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class SessionStatus(str, enum.Enum):
    """Estado logístico de la sesión."""
    NORMAL = "Normal"
    CAMBIO_SALON = "Cambio de Salón"
    RETRASADO = "Retrasado"


class SessionModality(str, enum.Enum):
    """Modalidad de participación de la sesión."""
    PRESENCIAL = "Presencial"
    VIRTUAL = "Virtual"
    HIBRIDO = "Híbrido"


class SessionTrack(str, enum.Enum):
    """Área temática (track) de la sesión."""
    IA = "Inteligencia Artificial"
    CIBERSEGURIDAD = "Ciberseguridad"
    IOT = "Internet de las Cosas"
    DESARROLLO = "Desarrollo de Software"
    DATOS = "Ciencia de Datos"
    INNOVACION = "Innovación y Tendencias"


class SessionEventType(str, enum.Enum):
    """Tipo de evento."""
    CONFERENCE = "Conferencia"
    WORKSHOP = "Taller"
    SYMPOSIUM = "Simposio"
    PANEL = "Panel"


class Session(Base):
    """
    Representa una sesión del congreso CONIITI.
    Puede ser una conferencia, taller, simposio o panel.
    """
    __tablename__ = "sessions"

    # --- Identificador único ---
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # --- Información principal ---
    titulo = Column(String(500), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)

    # --- Ponente ---
    ponente = Column(String(255), nullable=False)
    afiliacion = Column(String(255), nullable=True)
    speaker_id = Column(String(50), nullable=True)  # Reservado para integración futura con modelo Speaker

    # --- Clasificación ---
    track = Column(Enum(SessionTrack), nullable=False)
    event_type = Column(Enum(SessionEventType), nullable=False)

    # --- Programación ---
    dia = Column(String(10), nullable=False, index=True)       # Formato: YYYY-MM-DD
    hora_inicio = Column(String(5), nullable=False)             # Formato: HH:MM
    hora_fin = Column(String(5), nullable=False)                # Formato: HH:MM

    # --- Logística ---
    salon = Column(String(255), nullable=False)
    salon_anterior = Column(String(255), nullable=True)         # Guardado si hubo cambio de salón
    modalidad = Column(Enum(SessionModality), nullable=False)
    status_logistico = Column(
        Enum(SessionStatus), nullable=False, default=SessionStatus.NORMAL
    )

    # --- Enlace virtual ---
    link_virtual = Column(String(1000), nullable=True)
    link_verificado = Column(Boolean, nullable=False, default=False)

    # --- Capacidad ---
    cupos_totales = Column(Integer, nullable=False, default=0)
    inscritos = Column(Integer, nullable=False, default=0)

    # --- Auditoría ---
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    timestamp_actualizacion = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # --- Relaciones ---
    created_by_user = relationship("User", back_populates="sessions", foreign_keys=[created_by])

    def __repr__(self) -> str:
        return f"<Session id={self.id} titulo={self.titulo[:40]}>"
