# ============================================================
# Esquemas de Sesión — CONIITI API
# Define los contratos de entrada/salida para las operaciones
# CRUD sobre las sesiones/conferencias del congreso.
# Sirve también como contrato con el front-end.
# ============================================================

import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl

from app.models.session import (
    SessionStatus, SessionModality, SessionTrack, SessionEventType
)


class SessionCreate(BaseModel):
    """Datos requeridos para crear una nueva sesión de agenda."""
    titulo: str = Field(..., min_length=5, max_length=500)
    descripcion: Optional[str] = None
    ponente: str = Field(..., min_length=2, max_length=255)
    afiliacion: Optional[str] = Field(None, max_length=255)
    descripcion_ponente: Optional[str] = None
    foto_ponente_url: Optional[str] = Field(None, max_length=1000)
    es_conferencista_principal: bool = False
    track: SessionTrack
    event_type: SessionEventType
    dia: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", examples=["2026-10-01"])
    hora_inicio: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["09:00"])
    hora_fin: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["10:00"])
    salon: str = Field(..., max_length=255)
    salon_anterior: Optional[str] = Field(None, max_length=255)
    modalidad: SessionModality
    status_logistico: SessionStatus = SessionStatus.NORMAL
    link_virtual: Optional[str] = Field(None, max_length=1000)
    link_verificado: bool = False
    cupos_totales: int = Field(0, ge=0)
    inscritos: int = Field(0, ge=0)


class SessionUpdate(BaseModel):
    """Datos actualizables de una sesión. Todos los campos son opcionales."""
    titulo: Optional[str] = Field(None, min_length=5, max_length=500)
    descripcion: Optional[str] = None
    ponente: Optional[str] = Field(None, min_length=2, max_length=255)
    afiliacion: Optional[str] = Field(None, max_length=255)
    descripcion_ponente: Optional[str] = None
    foto_ponente_url: Optional[str] = Field(None, max_length=1000)
    es_conferencista_principal: Optional[bool] = None
    track: Optional[SessionTrack] = None
    event_type: Optional[SessionEventType] = None
    dia: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    hora_inicio: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    hora_fin: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    salon: Optional[str] = Field(None, max_length=255)
    salon_anterior: Optional[str] = Field(None, max_length=255)
    modalidad: Optional[SessionModality] = None
    status_logistico: Optional[SessionStatus] = None
    link_virtual: Optional[str] = Field(None, max_length=1000)
    link_verificado: Optional[bool] = None
    cupos_totales: Optional[int] = Field(None, ge=0)
    inscritos: Optional[int] = Field(None, ge=0)


class SessionRead(BaseModel):
    """Representación completa de una sesión para el cliente."""
    id: uuid.UUID
    titulo: str
    descripcion: Optional[str]
    ponente: str
    afiliacion: Optional[str]
    descripcion_ponente: Optional[str]
    foto_ponente_url: Optional[str]
    es_conferencista_principal: bool
    speaker_id: Optional[str]
    track: SessionTrack
    event_type: SessionEventType
    dia: str
    hora_inicio: str
    hora_fin: str
    salon: str
    salon_anterior: Optional[str]
    modalidad: SessionModality
    status_logistico: SessionStatus
    link_virtual: Optional[str]
    link_verificado: bool
    cupos_totales: int
    inscritos: int
    timestamp_actualizacion: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """Respuesta paginada de listado de sesiones."""
    total: int
    sessions: List[SessionRead]

class SessionRegistrationResponse(BaseModel):
    """Respuesta al alternar la preinscripción a una conferencia."""
    registered: bool
    session_id: uuid.UUID
