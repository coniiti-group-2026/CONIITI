import uuid
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from models.agenda import SessionStatus, SessionModality, SessionTrack, SessionEventType

class SessionBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    ponente: str
    afiliacion: Optional[str] = None
    descripcion_ponente: Optional[str] = None
    foto_ponente_url: Optional[str] = None
    es_conferencista_principal: bool = False
    track: SessionTrack
    event_type: SessionEventType
    dia: str
    hora_inicio: str
    hora_fin: str
    salon: str
    modalidad: SessionModality
    status_logistico: SessionStatus = SessionStatus.NORMAL
    link_virtual: Optional[str] = None
    cupos_totales: int = 0

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    ponente: Optional[str] = None
    afiliacion: Optional[str] = None
    descripcion_ponente: Optional[str] = None
    foto_ponente_url: Optional[str] = None
    es_conferencista_principal: Optional[bool] = None
    track: Optional[SessionTrack] = None
    event_type: Optional[SessionEventType] = None
    dia: Optional[str] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    salon: Optional[str] = None
    modalidad: Optional[SessionModality] = None
    status_logistico: Optional[SessionStatus] = None
    link_virtual: Optional[str] = None
    cupos_totales: Optional[int] = None

class SessionRead(SessionBase):
    id: uuid.UUID
    inscritos: int = 0
    link_verificado: bool = False
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SessionListResponse(BaseModel):
    total: int
    sessions: List[SessionRead]

class SessionRegistrationResponse(BaseModel):
    registered: bool
    session_id: uuid.UUID
