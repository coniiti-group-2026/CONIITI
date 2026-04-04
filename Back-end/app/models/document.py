from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone

from app.db.base import Base


class ConitiDocument(Base):
    """
    Modelo para documentos PDF relacionados al CONIITI.
    Puede ser del sistema (cronogramas, actas) o de un ponente específico.
    """
    __tablename__ = "coniiti_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=True)
    file_url = Column(String(1000), nullable=False)      # URL del files-service
    category = Column(String(50), nullable=False, default="sistema")  # 'sistema' | 'ponente'
    ponente_nombre = Column(String(255), nullable=True)  # Para documentos de un ponente
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
