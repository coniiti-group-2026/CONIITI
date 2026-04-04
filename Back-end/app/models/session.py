import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class SessionStatus(str, enum.Enum):
    NORMAL = "normal"
    CAMBIO_SALON = "cambio_salon"
    RETRASADO = "retrasado"


class SessionModality(str, enum.Enum):
    PRESENCIAL = "presencial"
    VIRTUAL = "virtual"
    HIBRIDO = "hibrido"


class SessionTrack(str, enum.Enum):
    IA = "ia"
    CIBERSEGURIDAD = "ciberseguridad"
    IOT = "iot"
    DESARROLLO = "desarrollo"
    DATOS = "datos"
    INNOVACION = "innovacion"


class SessionEventType(str, enum.Enum):
    CONFERENCE = "conference"
    WORKSHOP = "workshop"
    SYMPOSIUM = "symposium"
    PANEL = "panel"


session_registrations = Table(
    "session_registrations",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("session_id", UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "registered_at",
        DateTime(timezone=True),
        nullable=True,
        default=lambda: datetime.now(timezone.utc),
    ),
)


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(500), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    ponente = Column(String(255), nullable=False)
    afiliacion = Column(String(255), nullable=True)
    speaker_id = Column(String(50), nullable=True)
    track = Column(Enum(SessionTrack), nullable=False)
    event_type = Column(Enum(SessionEventType), nullable=False)
    dia = Column(String(10), nullable=False, index=True)
    hora_inicio = Column(String(5), nullable=False)
    hora_fin = Column(String(5), nullable=False)
    salon = Column(String(255), nullable=False)
    salon_anterior = Column(String(255), nullable=True)
    modalidad = Column(Enum(SessionModality), nullable=False)
    status_logistico = Column(Enum(SessionStatus), nullable=False, default=SessionStatus.NORMAL)
    link_virtual = Column(String(1000), nullable=True)
    link_verificado = Column(Boolean, nullable=False, default=False)
    cupos_totales = Column(Integer, nullable=False)
    inscritos = Column(Integer, nullable=False, default=0)
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
    descripcion_ponente = Column(Text, nullable=True)
    foto_ponente_url = Column(String(1000), nullable=True)
    es_conferencista_principal = Column(Boolean, nullable=False, default=False)

    created_by_user = relationship("User", back_populates="sessions", foreign_keys=[created_by])
    registered_users = relationship(
        "User",
        secondary=session_registrations,
        back_populates="registered_sessions",
    )

    def __repr__(self) -> str:
        return f"<Session id={self.id} titulo={self.titulo!r}>"
