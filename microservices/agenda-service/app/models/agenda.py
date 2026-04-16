import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Integer, Text, Table, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class SessionStatus(str, enum.Enum):
    NORMAL = "Normal"
    CAMBIO_SALON = "Cambio de Salón"
    RETRASADO = "Retrasado"

class SessionModality(str, enum.Enum):
    PRESENCIAL = "Presencial"
    VIRTUAL = "Virtual"
    HIBRIDO = "Híbrido"

class SessionTrack(str, enum.Enum):
    IA = "Inteligencia Artificial"
    CIBERSEGURIDAD = "Ciberseguridad"
    IOT = "Internet de las Cosas"
    DESARROLLO = "Desarrollo de Software"
    DATOS = "Ciencia de Datos"
    INNOVACION = "Innovación y Tendencias"

class SessionEventType(str, enum.Enum):
    CONFERENCE = "Conferencia"
    WORKSHOP = "Taller"
    SYMPOSIUM = "Simposio"
    PANEL = "Panel"

# Tabla de asociación para inscripciones de usuarios (Desacoplada)
# Solo guarda user_id como UUID, sin ForeignKey física al otro microservicio.
session_registrations = Table(
    "session_registrations",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), primary_key=True),
    Column("session_id", UUID(as_uuid=True), primary_key=True),
    Column("registered_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
)

class Speaker(Base):
    """Dominio independiente para resolver redundancia de datos de Conferencistas."""
    __tablename__ = "speakers"
    __table_args__ = (
        UniqueConstraint('nombre', 'afiliacion', name='uix_speaker_nombre_afiliacion'),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre = Column(String(255), nullable=False, index=True)
    afiliacion = Column(String(255), nullable=False, default="")
    descripcion = Column(Text, nullable=True)
    foto_url = Column(String(1000), nullable=True)
    es_principal = Column(Boolean, nullable=False, default=False)
    
    sesiones = relationship("AgendaSession", back_populates="speaker")

    def __repr__(self) -> str:
        return f"<Speaker id={self.id} nombre={self.nombre}>"


class AgendaSession(Base):
    __tablename__ = "agenda_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(500), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    
    # El Ponente ahora vive en su propio Micro-Dominio 
    speaker_id = Column(UUID(as_uuid=True), ForeignKey("speakers.id"), nullable=False)
    speaker = relationship("Speaker", back_populates="sesiones")
    
    # Propiedades dinámicas de compatibilidad "hacia atrás" para preservar contratos JSON limpios en Swagger y Pydantic.
    @property
    def ponente(self) -> str:
        return self.speaker.nombre if self.speaker else ""

    @property
    def afiliacion(self):
        if not self.speaker:
            return None
        return self.speaker.afiliacion if self.speaker.afiliacion.strip() != "" else None

    @property
    def descripcion_ponente(self) -> str:
        return self.speaker.descripcion if self.speaker else None

    @property
    def foto_ponente_url(self) -> str:
        return self.speaker.foto_url if self.speaker else None

    @property
    def es_conferencista_principal(self) -> bool:
        return self.speaker.es_principal if self.speaker else False
    
    track = Column(Enum(SessionTrack), nullable=False)
    event_type = Column(Enum(SessionEventType), nullable=False)
    
    dia = Column(String(10), nullable=False, index=True)       # YYYY-MM-DD
    hora_inicio = Column(String(5), nullable=False)             # HH:MM
    hora_fin = Column(String(5), nullable=False)                # HH:MM
    
    salon = Column(String(255), nullable=False)
    salon_anterior = Column(String(255), nullable=True)
    modalidad = Column(Enum(SessionModality), nullable=False)
    status_logistico = Column(Enum(SessionStatus), nullable=False, default=SessionStatus.NORMAL)
    
    link_virtual = Column(String(1000), nullable=True)
    link_verificado = Column(Boolean, nullable=False, default=False)
    
    cupos_totales = Column(Integer, nullable=False, default=0)
    inscritos = Column(Integer, nullable=False, default=0)
    
    # Auditoría desacoplada
    created_by = Column(UUID(as_uuid=True), nullable=True) 
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self) -> str:
        return f"<AgendaSession id={self.id} titulo={self.titulo[:40]}>"
