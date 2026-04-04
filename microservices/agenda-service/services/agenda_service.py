import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session as DBSession
from models.agenda import AgendaSession
from schemas.agenda import SessionCreate, SessionUpdate
from utils.rabbitmq import publish_event
import json

def get_session_by_id(session_id: uuid.UUID, db: DBSession) -> Optional[AgendaSession]:
    return db.query(AgendaSession).filter(AgendaSession.id == session_id).first()

def get_session_by_id_or_raise(session_id: uuid.UUID, db: DBSession) -> AgendaSession:
    session = get_session_by_id(session_id, db)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada.")
    return session

def list_sessions(
    db: DBSession,
    day: Optional[str] = None,
    modality: Optional[str] = None,
    track: Optional[str] = None,
    event_type: Optional[str] = None,
    salon: Optional[str] = None,
    search: Optional[str] = None,
) -> List[AgendaSession]:
    query = db.query(AgendaSession)
    if day: query = query.filter(AgendaSession.dia == day)
    if modality: query = query.filter(AgendaSession.modalidad == modality)
    if track: query = query.filter(AgendaSession.track == track)
    if event_type: query = query.filter(AgendaSession.event_type == event_type)
    if salon: query = query.filter(AgendaSession.salon == salon)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            AgendaSession.titulo.ilike(term) | 
            AgendaSession.ponente.ilike(term) | 
            AgendaSession.descripcion.ilike(term)
        )
    return query.order_by(AgendaSession.dia, AgendaSession.hora_inicio).all()

def create_session(data: SessionCreate, author_id: uuid.UUID, db: DBSession) -> AgendaSession:
    session = AgendaSession(**data.model_dump(), created_by=author_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Publicar evento en RabbitMQ
    event_data = {
        "event_id": str(uuid.uuid4()),
        "session_id": str(session.id),
        "titulo": session.titulo,
        "ponente": session.ponente,
        "dia": session.dia,
        "hora_inicio": session.hora_inicio
    }
    publish_event("ponencia.creada", event_data)
    
    return session

def update_session(session: AgendaSession, data: SessionUpdate, db: DBSession) -> AgendaSession:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session

def delete_session(session: AgendaSession, db: DBSession) -> None:
    db.delete(session)
    db.commit()

def toggle_registration(session: AgendaSession, user_id: uuid.UUID, db: DBSession) -> bool:
    from models.agenda import session_registrations
    # Buscar si ya existe la inscripción
    registration = db.execute(
        session_registrations.select().where(
            (session_registrations.c.user_id == user_id) & 
            (session_registrations.c.session_id == session.id)
        )
    ).first()
    
    if registration:
        # Desinscribir
        db.execute(
            session_registrations.delete().where(
                (session_registrations.c.user_id == user_id) & 
                (session_registrations.c.session_id == session.id)
            )
        )
        session.inscritos = max(0, session.inscritos - 1)
        registered = False
    else:
        # Inscribir
        db.execute(
            session_registrations.insert().values(user_id=user_id, session_id=session.id)
        )
        session.inscritos += 1
        registered = True
        
    db.commit()
    return registered

def get_user_registered_sessions(user_id: uuid.UUID, db: DBSession) -> List[AgendaSession]:
    from app.models.agenda import session_registrations
    return db.query(AgendaSession).join(
        session_registrations, 
        session_registrations.c.session_id == AgendaSession.id
    ).filter(session_registrations.c.user_id == user_id).all()
