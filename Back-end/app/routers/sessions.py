# ============================================================
# Router de Sesiones — CONIITI API
# Expone el CRUD de sesiones/conferencias del congreso.
# Los endpoints de lectura son públicos.
# Los de escritura requieren rol de staff o superusuario.
# ============================================================

import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.dependencies.auth import require_staff
from app.models.user import User
from app.schemas.session import SessionCreate, SessionRead, SessionUpdate, SessionListResponse
from app.services import session_service

router = APIRouter(prefix="/sessions", tags=["Sesiones del Congreso"])


# ==============================================================
# Sección: Endpoints públicos (lectura)
# ==============================================================

@router.get(
    "",
    response_model=SessionListResponse,
    summary="Listar sesiones",
    description="Retorna todas las sesiones con filtros opcionales. Acceso público.",
)
def list_sessions(
    day: Optional[str] = Query(None, description="Filtrar por día (YYYY-MM-DD)", example="2026-10-01"),
    modality: Optional[str] = Query(None, description="Filtrar por modalidad", example="Virtual"),
    track: Optional[str] = Query(None, description="Filtrar por track"),
    event_type: Optional[str] = Query(None, description="Filtrar por tipo de evento"),
    search: Optional[str] = Query(None, description="Búsqueda por texto en título, ponente o descripción"),
    db: DBSession = Depends(get_db),
):
    """Retorna la lista de sesiones filtrada y ordenada por día/hora."""
    sessions = session_service.list_sessions(
        db, day=day, modality=modality, track=track,
        event_type=event_type, search=search,
    )
    return SessionListResponse(total=len(sessions), sessions=sessions)


@router.get(
    "/{session_id}",
    response_model=SessionRead,
    summary="Obtener sesión por ID",
    description="Retorna el detalle completo de una sesión. Acceso público.",
)
def get_session(session_id: uuid.UUID, db: DBSession = Depends(get_db)):
    """Retorna los datos completos de una sesión específica por su ID."""
    return session_service.get_session_by_id_or_raise(session_id, db)


# ==============================================================
# Sección: Endpoints protegidos (escritura — staff y superusuario)
# ==============================================================

@router.post(
    "",
    response_model=SessionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear sesión",
    description="Crea una nueva sesión en la agenda. Requiere rol de staff o superior.",
)
def create_session(
    data: SessionCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """Crea una nueva sesión para el congreso CONIITI."""
    return session_service.create_session(data, current_user, db)


@router.put(
    "/{session_id}",
    response_model=SessionRead,
    summary="Actualizar sesión",
    description="Actualiza los datos de una sesión existente. Requiere rol de staff o superior.",
)
def update_session(
    session_id: uuid.UUID,
    data: SessionUpdate,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_staff),
):
    """Actualiza parcialmente los datos de una sesión del congreso."""
    session = session_service.get_session_by_id_or_raise(session_id, db)
    return session_service.update_session(session, data, db)


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar sesión",
    description="Elimina permanentemente una sesión de la agenda. Requiere rol de staff o superior.",
)
def delete_session(
    session_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_staff),
):
    """Elimina una sesión del congreso CONIITI."""
    session = session_service.get_session_by_id_or_raise(session_id, db)
    session_service.delete_session(session, db)


@router.patch(
    "/{session_id}/verify-link",
    response_model=SessionRead,
    summary="Alternar verificación de enlace",
    description="Activa o desactiva la verificación del enlace virtual de la sesión.",
)
def toggle_link_verified(
    session_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_staff),
):
    """Alterna el estado de verificación del enlace virtual de una sesión."""
    session = session_service.get_session_by_id_or_raise(session_id, db)
    return session_service.toggle_link_verified(session, db)
