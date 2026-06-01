import uuid
from typing import Optional, List
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, contains_eager
from app.models.agenda import AgendaSession, session_registrations, Speaker

class AgendaRepository:
    """Capa de acceso a datos para AgendaSession, aislando a SQLAlchemy de la lógica de negocio."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, session_id: uuid.UUID) -> Optional[AgendaSession]:
        return self.db.query(AgendaSession).options(joinedload(AgendaSession.speaker)).filter(AgendaSession.id == session_id).first()

    def get_all(
        self, day: str = None, modality: str = None, track: str = None, 
        event_type: str = None, salon: str = None, search: str = None,
        principal_only: bool = False
    ) -> List[AgendaSession]:
        query = self.db.query(AgendaSession).join(AgendaSession.speaker).options(contains_eager(AgendaSession.speaker))
        
        if day:
            query = query.filter(AgendaSession.dia == day)
        if modality:
            query = query.filter(AgendaSession.modalidad == modality)
        if track:
            query = query.filter(AgendaSession.track == track)
        if event_type:
            query = query.filter(AgendaSession.event_type == event_type)
        if salon:
            query = query.filter(AgendaSession.salon == salon)
        if principal_only:
            query = query.filter(Speaker.es_principal.is_(True))
        
        if search:
            term = f"%{search.lower()}%"
            query = query.filter(
                AgendaSession.titulo.ilike(term) | 
                Speaker.nombre.ilike(term) | 
                AgendaSession.descripcion.ilike(term)
            )
            
        return query.order_by(AgendaSession.dia, AgendaSession.hora_inicio).all()

    def get_all_speakers(self, principal_only: bool = False) -> List[Speaker]:
        query = self.db.query(Speaker).options(joinedload(Speaker.sesiones))
        if principal_only:
            query = query.filter(Speaker.es_principal.is_(True))
        return query.all()

    def get_or_create_speaker(self, nombre: str, afiliacion: str, descripcion: str, foto_url: str, es_principal: bool) -> Speaker:
        # Normalizar para proteger unicidad lógicamente y homogeneizar strings
        norm_nombre = nombre.strip()
        # Transformar NULL / None en '' (Empty String) resuelve la ceguera de NULLs en constraints UNIQUE.
        norm_afiliacion = (afiliacion or "").strip()
        
        # Criterio compuesto de unicidad más seguro
        speaker = self.db.query(Speaker).filter(
            Speaker.nombre == norm_nombre,
            Speaker.afiliacion == norm_afiliacion
        ).first()

        if speaker:
            # Actualizamos información en caso de que un registro traiga foto o correcciones
            if descripcion:
                speaker.descripcion = descripcion
            if foto_url:
                speaker.foto_url = foto_url
            # Si en otra sesión sí figura como principal, actualizar el flag general
            if es_principal:
                speaker.es_principal = True
        else:
            speaker = Speaker(
                nombre=norm_nombre,
                afiliacion=norm_afiliacion,
                descripcion=descripcion,
                foto_url=foto_url,
                es_principal=es_principal
            )
            self.db.add(speaker)
            try:
                with self.db.begin_nested():
                    self.db.flush()
            except IntegrityError:
                speaker = self.db.query(Speaker).filter(
                    Speaker.nombre == norm_nombre,
                    Speaker.afiliacion == norm_afiliacion
                ).first()
        return speaker

    def add(self, session: AgendaSession) -> AgendaSession:
        self.db.add(session)
        self.db.flush()
        return session

    def delete(self, session: AgendaSession) -> None:
        self.db.delete(session)

    def commit(self) -> None:
        self.db.commit()

    def flush(self) -> None:
        self.db.flush()

    def rollback(self) -> None:
        self.db.rollback()

    def refresh(self, instance) -> None:
        self.db.refresh(instance)
        
    def get_registered_user_ids(self, session_id: uuid.UUID) -> List[str]:
        users = self.db.execute(
            session_registrations.select().where(session_registrations.c.session_id == session_id)
        ).fetchall()
        return [str(u.user_id) for u in users]

    def is_user_registered(self, session_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        registration = self.db.execute(
            session_registrations.select().where(
                (session_registrations.c.user_id == user_id) & 
                (session_registrations.c.session_id == session_id)
            )
        ).first()
        return bool(registration)

    def add_registration(self, session_id: uuid.UUID, user_id: uuid.UUID) -> None:
        self.db.execute(
            session_registrations.insert().values(user_id=user_id, session_id=session_id)
        )

    def remove_registration(self, session_id: uuid.UUID, user_id: uuid.UUID) -> None:
        self.db.execute(
            session_registrations.delete().where(
                (session_registrations.c.user_id == user_id) & 
                (session_registrations.c.session_id == session_id)
            )
        )

    def get_user_registered_sessions(self, user_id: uuid.UUID) -> List[AgendaSession]:
        return self.db.query(AgendaSession).options(joinedload(AgendaSession.speaker)).join(
            session_registrations, 
            session_registrations.c.session_id == AgendaSession.id
        ).filter(session_registrations.c.user_id == user_id).all()
