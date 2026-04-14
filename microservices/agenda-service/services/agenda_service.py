import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from models.agenda import AgendaSession
from schemas.agenda import SessionCreate, SessionUpdate
from utils.rabbitmq import publish_event
from repositories.agenda_repository import AgendaRepository
import logging

logger = logging.getLogger(__name__)

def get_session_by_id_or_raise(session_id: uuid.UUID, repo: AgendaRepository) -> AgendaSession:
    session = repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada.")
    return session

def list_sessions(
    repo: AgendaRepository,
    day: Optional[str] = None,
    modality: Optional[str] = None,
    track: Optional[str] = None,
    event_type: Optional[str] = None,
    salon: Optional[str] = None,
    search: Optional[str] = None,
) -> List[AgendaSession]:
    return repo.get_all(
        day=day, modality=modality, track=track, 
        event_type=event_type, salon=salon, search=search
    )

def create_session(data: SessionCreate, author_id: uuid.UUID, repo: AgendaRepository) -> AgendaSession:
    # 1. Resolución transparente del Ponente (Preserva compatibilidad del Front)
    speaker = repo.get_or_create_speaker(
        nombre=data.ponente,
        afiliacion=data.afiliacion,
        descripcion=data.descripcion_ponente,
        foto_url=data.foto_ponente_url,
        es_principal=data.es_conferencista_principal
    )

    # 2. Exclusión de campos planos ya normalizados
    session_data = data.model_dump(exclude={
        "ponente", "afiliacion", "descripcion_ponente", 
        "foto_ponente_url", "es_conferencista_principal"
    })
    
    session = AgendaSession(**session_data, speaker_id=speaker.id, created_by=author_id)
    
    repo.add(session)
    repo.flush()
    
    event_data = {
        "event_id": str(uuid.uuid4()),
        "session_id": str(session.id),
        "titulo": session.titulo,
        "ponente": session.ponente,
        "dia": session.dia,
        "hora_inicio": str(session.hora_inicio) if session.hora_inicio else None
    }
    
    try:
        publish_event("ponencia.creada", event_data)
    except Exception as e:
        logger.error(f"Fallo crítico publicando evento de creación. Abortando transacción en BD. {e}")
        repo.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al comunicar con sistema de notificaciones. Transacción cancelada de forma segura."
        )
        
    repo.commit()
    repo.refresh(session)
    return session

def update_session(session_id: uuid.UUID, data: SessionUpdate, repo: AgendaRepository) -> AgendaSession:
    session = get_session_by_id_or_raise(session_id, repo)
    
    old_data = {
        "titulo": session.titulo,
        "ponente": session.ponente,
        "afiliacion": session.afiliacion,
        "descripcion_ponente": session.descripcion_ponente,
        "foto_ponente_url": session.foto_ponente_url,
        "es_conferencista_principal": session.es_conferencista_principal,
        "dia": session.dia,
        "hora_inicio": session.hora_inicio,
        "salon": session.salon
    }

    update_data = data.model_dump(exclude_unset=True)
    
    # 1. Evaluar si hubo cambios verdaderos basándose en update_data original
    has_changes = any(old_data.get(k) != update_data.get(k) for k in old_data if k in update_data)
    
    # 2. Reestructurar el ponente si los campos vienen
    speaker_fields = {"ponente", "afiliacion", "descripcion_ponente", "foto_ponente_url", "es_conferencista_principal"}
    if any(k in update_data for k in speaker_fields):
        nuevo_speaker = repo.get_or_create_speaker(
            nombre=update_data.get("ponente", session.ponente),  # usando la property segura
            afiliacion=update_data.get("afiliacion", session.afiliacion),
            descripcion=update_data.get("descripcion_ponente", session.descripcion_ponente),
            foto_url=update_data.get("foto_ponente_url", session.foto_ponente_url),
            es_principal=update_data.get("es_conferencista_principal", session.es_conferencista_principal)
        )
        session.speaker_id = nuevo_speaker.id
        
        for f in speaker_fields:
            update_data.pop(f, None)

    # 3. Aplicar datos de sesión planos
    for field, value in update_data.items():
        setattr(session, field, value)
    
    repo.flush()

    if has_changes:
        user_ids = repo.get_registered_user_ids(session.id)
        if user_ids:
            event_data = {
                "event_id": str(uuid.uuid4()),
                "session_id": str(session.id),
                "titulo": session.titulo,
                "cambios": {k: getattr(session, k) for k in old_data if getattr(session, k) != old_data[k]},
                "afectados": user_ids
            }
            try:
                publish_event("agenda.sesion_actualizada", event_data)
            except Exception as e:
                logger.error(f"Fallo crítico publicando actualización. Abortando. {e}")
                repo.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error al notificar cambios al bus de eventos. Actualización cancelada de forma segura."
                )

    repo.commit()
    repo.refresh(session)
    return session

def delete_session(session_id: uuid.UUID, repo: AgendaRepository) -> None:
    session = get_session_by_id_or_raise(session_id, repo)
    repo.delete(session)
    repo.commit()

def toggle_registration(session_id: uuid.UUID, user_id: uuid.UUID, repo: AgendaRepository) -> bool:
    session = get_session_by_id_or_raise(session_id, repo)
    
    if repo.is_user_registered(session.id, user_id):
        repo.remove_registration(session.id, user_id)
        session.inscritos = max(0, session.inscritos - 1)
        registered = False
    else:
        repo.add_registration(session.id, user_id)
        session.inscritos += 1
        registered = True
        
    repo.commit()
    return registered

def get_user_registered_sessions(user_id: uuid.UUID, repo: AgendaRepository) -> List[AgendaSession]:
    return repo.get_user_registered_sessions(user_id)

def get_unique_speakers(repo: AgendaRepository, principal_only: bool = False) -> List[dict]:
    speakers = repo.get_all_speakers(principal_only=principal_only)
    
    result = []
    for s in speakers:
        result.append({
            "ponente": s.nombre,
            "afiliacion": s.afiliacion,
            "descripcion_ponente": s.descripcion,
            "foto_ponente_url": s.foto_url,
            "es_conferencista_principal": s.es_principal,
            "sesiones": [
                {
                    "id": str(ses.id),
                    "titulo": ses.titulo,
                    "dia": ses.dia,
                    "hora_inicio": str(ses.hora_inicio) if ses.hora_inicio else None,
                }
                for ses in s.sesiones
            ]
        })
        
    return sorted(result, key=lambda x: str(x.get("ponente", "")).lower())

def toggle_link_verified(session_id: uuid.UUID, repo: AgendaRepository) -> AgendaSession:
    session = get_session_by_id_or_raise(session_id, repo)
    session.link_verificado = not session.link_verificado
    repo.commit()
    repo.refresh(session)
    return session
