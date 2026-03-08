# ============================================================
# Alembic env.py — Configuración del entorno de migraciones
# Conecta Alembic con los modelos SQLAlchemy del proyecto.
# ============================================================

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Agrega la raíz del proyecto al path para importar los modelos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings
from app.db.base import Base

# Importa todos los modelos para que Alembic los detecte automáticamente
import app.models  # noqa: F401

# --- Configuración de Alembic ---
config = context.config

# Inyecta la DATABASE_URL desde la configuración de pydantic-settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Configura el sistema de logs de Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata de todos los modelos (necesario para autogenerate)
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Ejecuta las migraciones en modo 'offline'.
    Genera el SQL sin conectarse a la base de datos.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Ejecuta las migraciones en modo 'online'.
    Se conecta activamente a la base de datos.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
