# ============================================================
# Script de Seed — CONIITI API
# Crea el superusuario inicial de la plataforma.
# Ejecutar una sola vez tras la primera migración de la BD:
#   python seed.py
# ============================================================

import sys
import getpass
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.models.user import User, UserRole, AuthProvider

# Importa todos los modelos para que Alembic/SQLAlchemy los registre
import app.models  # noqa: F401


def create_superuser() -> None:
    """Crea la cuenta de superusuario de forma interactiva."""
    print("\n" + "=" * 55)
    print("  CONIITI — Creación de Superusuario Inicial")
    print("=" * 55)
    print("Este script creará la cuenta de superusuario.")
    print("Se ejecuta una sola vez tras la primera migración.\n")

    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Verifica si ya existe un superusuario
        existing = db.query(User).filter(User.role == UserRole.SUPERUSER).first()
        if existing:
            print(f"⚠  Ya existe un superusuario: {existing.email}")
            print("   Para crear uno nuevo, elimine el actual desde la base de datos.")
            sys.exit(0)

        # Solicita los datos del superusuario interactivamente
        full_name = input("Nombre completo del superusuario: ").strip()
        if not full_name:
            print("❌  El nombre no puede estar vacío.")
            sys.exit(1)

        email = input("Correo electrónico: ").strip()
        if not email or "@" not in email:
            print("❌  Correo inválido.")
            sys.exit(1)

        # Verifica que el correo no esté en uso
        if db.query(User).filter(User.email == email).first():
            print(f"❌  Ya existe una cuenta con el correo: {email}")
            sys.exit(1)

        password = getpass.getpass("Contraseña (mínimo 8 caracteres): ")
        if len(password) < 8:
            print("❌  La contraseña debe tener al menos 8 caracteres.")
            sys.exit(1)

        confirm = getpass.getpass("Confirmar contraseña: ")
        if password != confirm:
            print("❌  Las contraseñas no coinciden.")
            sys.exit(1)

        # Crea el superusuario
        superuser = User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.SUPERUSER,
            auth_provider=AuthProvider.LOCAL,
            is_active=True,
            is_verified=True,
            accepted_data_policy=datetime.now(timezone.utc),
        )
        db.add(superuser)
        db.commit()

        print("\n✅  Superusuario creado exitosamente.")
        print(f"   Correo: {email}")
        print("   Puede iniciar sesión en: /login\n")

    except Exception as error:
        db.rollback()
        print(f"\n❌  Error al crear el superusuario: {error}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    create_superuser()
