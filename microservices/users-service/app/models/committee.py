from datetime import datetime, timezone
import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.database import Base


class CommitteeMember(Base):
    __tablename__ = "committee_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String(255), nullable=False)
    cargo = Column(String(255), nullable=False)
    institucion = Column(String(255), nullable=True)
    foto_url = Column(String(1000), nullable=True)
    bio = Column(Text, nullable=True)
    orden = Column(Integer, nullable=False, default=0)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
