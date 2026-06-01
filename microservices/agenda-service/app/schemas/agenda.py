import uuid
import re
from datetime import datetime
from typing import Optional, List
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models.agenda import SessionStatus, SessionModality, SessionTrack, SessionEventType

CONFERENCE_DAYS = {"2026-10-01", "2026-10-02", "2026-10-03"}
TIME_PATTERN = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _clean_required(value: str) -> str:
    if not isinstance(value, str):
        return value
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("Este campo no puede estar vacio.")
    return cleaned


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    cleaned = value.strip()
    return cleaned or None


def _validate_day(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = _clean_required(value)
    try:
        datetime.strptime(cleaned, "%Y-%m-%d")
    except ValueError as exc:
        raise ValueError("El dia debe usar formato YYYY-MM-DD.") from exc
    if cleaned not in CONFERENCE_DAYS:
        raise ValueError("El dia debe estar dentro del rango oficial del CONIITI 2026.")
    return cleaned


def _validate_time(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = _clean_required(value)
    if not TIME_PATTERN.match(cleaned):
        raise ValueError("La hora debe usar formato HH:MM de 24 horas.")
    return cleaned


def _time_to_minutes(value: str) -> int:
    hours, minutes = value.split(":", 1)
    return int(hours) * 60 + int(minutes)


def _validate_virtual_link(value: str | None) -> str | None:
    cleaned = _clean_optional(value)
    if cleaned is None:
        return None

    parsed = urlparse(cleaned)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("El enlace virtual debe ser una URL http o https valida.")
    return cleaned


class SessionBase(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=500)
    descripcion: Optional[str] = Field(default=None, max_length=4000)
    ponente: str = Field(..., min_length=2, max_length=255)
    afiliacion: Optional[str] = Field(default=None, max_length=255)
    descripcion_ponente: Optional[str] = Field(default=None, max_length=4000)
    foto_ponente_url: Optional[str] = Field(default=None, max_length=1000)
    es_conferencista_principal: bool = False
    track: SessionTrack
    event_type: SessionEventType
    dia: str = Field(..., min_length=10, max_length=10)
    hora_inicio: str = Field(..., min_length=5, max_length=5)
    hora_fin: str = Field(..., min_length=5, max_length=5)
    salon: str = Field(..., min_length=2, max_length=255)
    modalidad: SessionModality
    status_logistico: SessionStatus = SessionStatus.NORMAL
    link_virtual: Optional[str] = Field(default=None, max_length=1000)
    cupos_totales: int = Field(default=0, ge=0, le=10000)

    @field_validator("titulo", "ponente", "salon", mode="before")
    @classmethod
    def clean_required_strings(cls, value: str) -> str:
        return _clean_required(value)

    @field_validator("descripcion", "afiliacion", "descripcion_ponente", "foto_ponente_url")
    @classmethod
    def clean_optional_strings(cls, value: str | None) -> str | None:
        return _clean_optional(value)

    @field_validator("dia", mode="before")
    @classmethod
    def validate_day(cls, value: str) -> str:
        return _validate_day(value)

    @field_validator("hora_inicio", "hora_fin", mode="before")
    @classmethod
    def validate_time(cls, value: str) -> str:
        return _validate_time(value)

    @field_validator("link_virtual")
    @classmethod
    def validate_virtual_link(cls, value: str | None) -> str | None:
        return _validate_virtual_link(value)

    @model_validator(mode="after")
    def validate_time_range(self):
        if _time_to_minutes(self.hora_fin) <= _time_to_minutes(self.hora_inicio):
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio.")
        return self

class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=2, max_length=500)
    descripcion: Optional[str] = Field(default=None, max_length=4000)
    ponente: Optional[str] = Field(default=None, min_length=2, max_length=255)
    afiliacion: Optional[str] = Field(default=None, max_length=255)
    descripcion_ponente: Optional[str] = Field(default=None, max_length=4000)
    foto_ponente_url: Optional[str] = Field(default=None, max_length=1000)
    es_conferencista_principal: Optional[bool] = None
    track: Optional[SessionTrack] = None
    event_type: Optional[SessionEventType] = None
    dia: Optional[str] = Field(default=None, min_length=10, max_length=10)
    hora_inicio: Optional[str] = Field(default=None, min_length=5, max_length=5)
    hora_fin: Optional[str] = Field(default=None, min_length=5, max_length=5)
    salon: Optional[str] = Field(default=None, min_length=2, max_length=255)
    modalidad: Optional[SessionModality] = None
    status_logistico: Optional[SessionStatus] = None
    link_virtual: Optional[str] = Field(default=None, max_length=1000)
    cupos_totales: Optional[int] = Field(default=None, ge=0, le=10000)

    @field_validator("titulo", "ponente", "salon", mode="before")
    @classmethod
    def clean_required_strings(cls, value: str | None) -> str | None:
        return None if value is None else _clean_required(value)

    @field_validator("descripcion", "afiliacion", "descripcion_ponente", "foto_ponente_url")
    @classmethod
    def clean_optional_strings(cls, value: str | None) -> str | None:
        return _clean_optional(value)

    @field_validator("dia", mode="before")
    @classmethod
    def validate_day(cls, value: str | None) -> str | None:
        return _validate_day(value)

    @field_validator("hora_inicio", "hora_fin", mode="before")
    @classmethod
    def validate_time(cls, value: str | None) -> str | None:
        return _validate_time(value)

    @field_validator("link_virtual")
    @classmethod
    def validate_virtual_link(cls, value: str | None) -> str | None:
        return _validate_virtual_link(value)

    @model_validator(mode="after")
    def validate_time_range(self):
        for field in ("titulo", "ponente", "dia", "hora_inicio", "hora_fin", "salon"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} no puede ser null.")
        if self.hora_inicio is not None and self.hora_fin is not None:
            if _time_to_minutes(self.hora_fin) <= _time_to_minutes(self.hora_inicio):
                raise ValueError("La hora de fin debe ser posterior a la hora de inicio.")
        return self

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
