import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.schemas.agenda import (
    SessionCreate, SessionRead, SessionUpdate, SessionListResponse, 
    SessionRegistrationResponse
)
from app.services import agenda_service
from app.utils.security import get_current_user_id, require_staff_or_superuser
from app.repositories.agenda_repository import AgendaRepository

router = APIRouter(tags=["Agenda del Congreso"])

def get_agenda_repo(db: DBSession = Depends(get_db)) -> AgendaRepository:
    return AgendaRepository(db)

@router.get("/", response_model=SessionListResponse)
def list_sessions(
    day: Optional[str] = Query(None),
    modality: Optional[str] = Query(None),
    track: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    salon: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    repo: AgendaRepository = Depends(get_agenda_repo),
):
    sessions = agenda_service.list_sessions(
        repo, day=day, modality=modality, track=track,
        event_type=event_type, salon=salon, search=search,
    )
    return SessionListResponse(total=len(sessions), sessions=sessions)

@router.get("/speakers", summary="Listar ponentes únicos")
def list_speakers(
    principal_only: bool = Query(False),
    repo: AgendaRepository = Depends(get_agenda_repo),
):
    return agenda_service.get_unique_speakers(repo, principal_only=principal_only)

@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: uuid.UUID, repo: AgendaRepository = Depends(get_agenda_repo)):
    return agenda_service.get_session_by_id_or_raise(session_id, repo)

@router.post("/", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    repo: AgendaRepository = Depends(get_agenda_repo),
    user_id: str = Depends(require_staff_or_superuser),
):
    return agenda_service.create_session(data, uuid.UUID(user_id), repo)

@router.put("/{session_id}", response_model=SessionRead)
def update_session(
    session_id: uuid.UUID,
    data: SessionUpdate,
    repo: AgendaRepository = Depends(get_agenda_repo),
    user_id: str = Depends(require_staff_or_superuser),
):
    return agenda_service.update_session(session_id, data, repo)

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: uuid.UUID,
    repo: AgendaRepository = Depends(get_agenda_repo),
    user_id: str = Depends(require_staff_or_superuser),
):
    agenda_service.delete_session(session_id, repo)

@router.post("/{session_id}/register", response_model=SessionRegistrationResponse)
def toggle_registration(
    session_id: uuid.UUID,
    repo: AgendaRepository = Depends(get_agenda_repo),
    user_id: str = Depends(get_current_user_id),
):
    registered = agenda_service.toggle_registration(session_id, uuid.UUID(user_id), repo)
    return SessionRegistrationResponse(registered=registered, session_id=session_id)

@router.get("/me/registered", response_model=List[SessionRead])
def get_my_registered_sessions(
    repo: AgendaRepository = Depends(get_agenda_repo),
    user_id: str = Depends(get_current_user_id),
):
    return agenda_service.get_user_registered_sessions(uuid.UUID(user_id), repo)

@router.patch("/{session_id}/verify-link", response_model=SessionRead)
def toggle_link_verified(
    session_id: uuid.UUID,
    repo: AgendaRepository = Depends(get_agenda_repo),
    user_id: str = Depends(require_staff_or_superuser),
):
    return agenda_service.toggle_link_verified(session_id, repo)
