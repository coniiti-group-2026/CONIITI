import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String

from app.database.connection import Base


class OTPPurpose(str, enum.Enum):
    REGISTER = "register"
    LOGIN = "login"


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("auth_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code = Column(String(6), nullable=False)
    purpose = Column(Enum(OTPPurpose), nullable=False)
    used = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def is_expired(self) -> bool:
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) > expires_at
