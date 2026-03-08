# ============================================================
# Servicio de Sesiones — CONIITI API
# Responsabilidad única (SRP): encapsula la lógica CRUD
# de las sesiones/conferencias del congreso CONIITI.
# ============================================================

import uuid
from typing import Optional, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.models.session import Session, SessionTrack, SessionModality, SessionEventType
from app.models.user import User
from app.schemas.session import SessionCreate, SessionUpdate


# ==============================================================
# Sección: Consultas
# ==============================================================

def get_session_by_id(session_id: uuid.UUID, db: DBSession) -> Optional[Session]:
    """Busca una sesión por su identificador único."""
    return db.query(Session).filter(Session.id == session_id).first()


def get_session_by_id_or_raise(session_id: uuid.UUID, db: DBSession) -> Session:
    """
    Busca una sesión por ID.
    Lanza HTTPException 404 si no existe.
    """
    session = get_session_by_id(session_id, db)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada.",
        )
    return session


def list_sessions(
    db: DBSession,
    day: Optional[str] = None,
    modality: Optional[str] = None,
    track: Optional[str] = None,
    event_type: Optional[str] = None,
    room: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Session]:
    """
    Retorna la lista de sesiones aplicando filtros opcionales.
    Los resultados se ordenan por día y luego por hora de inicio.
    """
    query = db.query(Session)

    if day:
        query = query.filter(Session.dia == day)
    if modality:
        query = query.filter(Session.modalidad == modality)
    if track:
        query = query.filter(Session.track == track)
    if event_type:
        query = query.filter(Session.event_type == event_type)
    if room:
        query = query.filter(Session.salon == room)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            Session.titulo.ilike(term)
            | Session.ponente.ilike(term)
            | Session.descripcion.ilike(term)
        )

    return query.order_by(Session.dia, Session.hora_inicio).all()


# ==============================================================
# Sección: Creación
# ==============================================================

def create_session(data: SessionCreate, author: User, db: DBSession) -> Session:
    """Crea una nueva sesión de agenda y la persiste en la base de datos."""
    session = Session(
        **data.model_dump(),
        created_by=author.id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


# ==============================================================
# Sección: Actualización
# ==============================================================

def update_session(session: Session, data: SessionUpdate, db: DBSession) -> Session:
    """Aplica las actualizaciones parciales a una sesión existente."""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session


def toggle_link_verified(session: Session, db: DBSession) -> Session:
    """Alterna el estado de verificación del enlace virtual de una sesión."""
    session.link_verificado = not session.link_verificado
    db.commit()
    db.refresh(session)
    return session


# ==============================================================
# Sección: Eliminación
# ==============================================================

def delete_session(session: Session, db: DBSession) -> None:
    """Elimina permanentemente una sesión del congreso."""
    db.delete(session)
    db.commit()


# ==============================================================
# Sección: Preinscripciones (Mis Conferencias)
# ==============================================================

def toggle_registration(session: Session, user: User, db: DBSession) -> bool:
    """
    Alterna la preinscripción del usuario a la sesión.
    Retorna True si el usuario quedó inscrito, y False si fue desinscrito.
    """
    if session in user.registered_sessions:
        user.registered_sessions.remove(session)
        session.inscritos = max(0, session.inscritos - 1)
        registered = False
    else:
        user.registered_sessions.append(session)
        session.inscritos += 1
        registered = True

    db.commit()
    return registered


def get_user_registered_sessions(user: User, db: DBSession) -> List[Session]:
    """Retorna la lista de sesiones a las que el usuario está inscrito."""
    # Las sesiones ya están cacheadas o cargadas en user.registered_sessions, 
    # pero para forzar el sort usaremos el query original.
    from app.models.session import session_registrations
    return db.query(Session).join(session_registrations).filter(
        session_registrations.c.user_id == user.id
    ).order_by(Session.dia, Session.hora_inicio).all()
