# ============================================================
# Base de SQLAlchemy 2.0 — CONIITI API
# Todos los modelos heredan de esta clase base.
# Se usa DeclarativeBase (API moderna de SQLAlchemy >= 2.0).
# ============================================================

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Clase base de la que heredan todos los modelos SQLAlchemy del proyecto."""
    pass
