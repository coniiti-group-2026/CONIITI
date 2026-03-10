from sqlalchemy import Column, String, Boolean, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base

class ContentCard(Base):
    """
    Modelo genérico CMS para almacenar tarjetas de información
    de secciones como 'comite', 'conferencistas', 'autores', 'galerias', 'memorias'.
    """
    __tablename__ = "content_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    section = Column(String(50), nullable=False, index=True)  # ej: 'galerias', 'comite'
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)  # Cargo, Especialidad, etc.
    year = Column(Integer, nullable=True)          # Año para memorias
    description = Column(Text, nullable=True)
    image_url = Column(String(1000), nullable=True)
    link_url = Column(String(1000), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
