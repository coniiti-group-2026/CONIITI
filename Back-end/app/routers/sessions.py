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
from app.dependencies.auth import require_staff, get_current_user
from app.models.user import User
from app.schemas.session import (
    SessionCreate, SessionRead, SessionUpdate, SessionListResponse, 
    SessionRegistrationResponse
)
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
    room: Optional[str] = Query(None, description="Filtrar por sala"),
    db: DBSession = Depends(get_db),
):
    """Retorna la lista de sesiones filtrada y ordenada por día/hora."""
    sessions = session_service.list_sessions(
        db, day=day, modality=modality, track=track,
        event_type=event_type, room=room, search=search,
    )
    return SessionListResponse(total=len(sessions), sessions=sessions)


@router.get(
    "/speakers",
    summary="Listar ponentes únicos",
    description="Retorna la lista de ponentes únicos del congreso, con info del ponente. Acceso público.",
)
def list_speakers(
    principal_only: bool = Query(False, description="Si true, solo retorna conferencistas principales"),
    db: DBSession = Depends(get_db),
):
    """Retorna ponentes únicos del congreso, opcionalmente filtrados por es_conferencista_principal."""
    from app.models.session import Session as SessionModel
    query = db.query(SessionModel)
    if principal_only:
        query = query.filter(SessionModel.es_conferencista_principal == True)
    sessions = query.order_by(SessionModel.ponente).all()

    # Deduplica por nombre de ponente, conservando el más reciente con foto
    seen = {}
    for s in sessions:
        name = s.ponente
        if name not in seen or (s.foto_ponente_url and not seen[name].get("foto_ponente_url")):
            seen[name] = {
                "ponente": s.ponente,
                "afiliacion": s.afiliacion,
                "descripcion_ponente": s.descripcion_ponente,
                "foto_ponente_url": s.foto_ponente_url,
                "es_conferencista_principal": s.es_conferencista_principal,
                "sesiones": []
            }
        seen[name]["sesiones"].append({
            "id": str(s.id),
            "titulo": s.titulo,
            "dia": s.dia,
            "hora_inicio": s.hora_inicio,
        })

    return list(seen.values())



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
# Sección: Endpoints protegidos para Usuarios (Mis Conferencias)
# ==============================================================

@router.get(
    "/me/registered",
    response_model=List[SessionRead],
    summary="Mis conferencias inscritas",
    description="Retorna la lista de conferencias en las que el usuario actual se ha preinscrito.",
)
def get_my_registered_sessions(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retorna las sesiones en las que el usuario está preinscrito."""
    return session_service.get_user_registered_sessions(current_user, db)


@router.post(
    "/{session_id}/register",
    response_model=SessionRegistrationResponse,
    summary="Inscribirse o desinscribirse de una sesión",
    description="Alterna el estado de inscripción del usuario autenticado en la sesión indicada.",
)
def toggle_session_registration(
    session_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alterna preinscripción en una sesión usando id."""
    session = session_service.get_session_by_id_or_raise(session_id, db)
    registered = session_service.toggle_registration(session, current_user, db)
    return SessionRegistrationResponse(registered=registered, session_id=session.id)


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
