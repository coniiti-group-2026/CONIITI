import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.orm import Session as DBSession
from database import get_db
from schemas.agenda import (
    SessionCreate, SessionRead, SessionUpdate, SessionListResponse, 
    SessionRegistrationResponse
)
from services import agenda_service
from utils.security import get_current_user_id, require_staff

router = APIRouter(tags=["Agenda del Congreso"])

@router.get("/", response_model=SessionListResponse)
def list_sessions(
    day: Optional[str] = Query(None),
    modality: Optional[str] = Query(None),
    track: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    salon: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    sessions = agenda_service.list_sessions(
        db, day=day, modality=modality, track=track,
        event_type=event_type, salon=salon, search=search,
    )
    return SessionListResponse(total=len(sessions), sessions=sessions)

@router.get("/speakers", summary="Listar ponentes únicos")
def list_speakers(
    principal_only: bool = Query(False),
    db: DBSession = Depends(get_db),
):
    from models.agenda import AgendaSession
    query = db.query(AgendaSession)
    if principal_only:
        query = query.filter(AgendaSession.es_conferencista_principal == True)
    sessions = query.order_by(AgendaSession.ponente).all()

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

@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: uuid.UUID, db: DBSession = Depends(get_db)):
    return agenda_service.get_session_by_id_or_raise(session_id, db)

@router.post("/", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    db: DBSession = Depends(get_db),
    user_id: str = Depends(require_staff),
):
    return agenda_service.create_session(data, uuid.UUID(user_id), db)

@router.put("/{session_id}", response_model=SessionRead)
def update_session(
    session_id: uuid.UUID,
    data: SessionUpdate,
    db: DBSession = Depends(get_db),
    user_id: str = Depends(require_staff),
):
    session = agenda_service.get_session_by_id_or_raise(session_id, db)
    return agenda_service.update_session(session, data, db)

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    user_id: str = Depends(require_staff),
):
    session = agenda_service.get_session_by_id_or_raise(session_id, db)
    agenda_service.delete_session(session, db)

@router.post("/{session_id}/register", response_model=SessionRegistrationResponse)
def toggle_registration(
    session_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    session = agenda_service.get_session_by_id_or_raise(session_id, db)
    registered = agenda_service.toggle_registration(session, uuid.UUID(user_id), db)
    return SessionRegistrationResponse(registered=registered, session_id=session.id)

@router.get("/me/registered", response_model=List[SessionRead])
def get_my_registered_sessions(
    db: DBSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return agenda_service.get_user_registered_sessions(uuid.UUID(user_id), db)

@router.patch("/{session_id}/verify-link", response_model=SessionRead)
def toggle_link_verified(
    session_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    user_id: str = Depends(require_staff),
):
    session = agenda_service.get_session_by_id_or_raise(session_id, db)
    session.link_verificado = not session.link_verificado
    db.commit()
    db.refresh(session)
    return session
