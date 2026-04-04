# ============================================================
# Paquete de Modelos — CONIITI API
# Importa todos los modelos para que Alembic los detecte
# automáticamente al generar las migraciones.
# ============================================================

from app.models.user import User, UserRole, AuthProvider
from app.models.session import Session, SessionStatus, SessionModality, SessionTrack, SessionEventType
from app.models.cms import ContentCard
from app.models.otp import OTPCode, OTPPurpose
from app.models.document import ConitiDocument

__all__ = [
    "User",
    "UserRole",
    "AuthProvider",
    "Session",
    "ContentCard",
    "SessionStatus",
    "SessionModality",
    "SessionTrack",
    "SessionEventType",
    "OTPCode",
    "OTPPurpose",
    "ConitiDocument",
]
