import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Integer, Text, Table
)
from sqlalchemy.dialects.postgresql import UUID
from database import Base

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

class AgendaSession(Base):
    __tablename__ = "agenda_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(500), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    
    ponente = Column(String(255), nullable=False)
    afiliacion = Column(String(255), nullable=True)
    descripcion_ponente = Column(Text, nullable=True)
    foto_ponente_url = Column(String(1000), nullable=True)
    es_conferencista_principal = Column(Boolean, nullable=False, default=False)
    
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
