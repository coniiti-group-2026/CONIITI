# ============================================================
# Servicio de Usuarios — CONIITI API
# Responsabilidad única (SRP): encapsula toda la lógica de
# negocio relacionada con la creación, consulta y gestión
# de cuentas de usuario en la plataforma.
# ============================================================

import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.models.user import User, UserRole, AuthProvider
from app.core.security import hash_password
from app.schemas.user import UserCreate, UserUpdate


# ==============================================================
# Sección: Consultas de usuario
# ==============================================================

def get_user_by_email(email: str, db: DBSession) -> Optional[User]:
    """Busca y retorna un usuario por su dirección de correo electrónico."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(user_id: uuid.UUID, db: DBSession) -> Optional[User]:
    """Busca y retorna un usuario por su identificador único."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_id_or_raise(user_id: uuid.UUID, db: DBSession) -> User:
    """
    Busca un usuario por ID.
    Lanza HTTPException 404 si no existe.
    """
    user = get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return user


def list_staff_users(db: DBSession) -> List[User]:
    """Retorna todos los usuarios con rol de staff, ordenados por nombre."""
    return (
        db.query(User)
        .filter(User.role == UserRole.STAFF)
        .order_by(User.full_name)
        .all()
    )


# ==============================================================
# Sección: Creación de usuarios
# ==============================================================

def create_regular_user(
    full_name: str,
    email: str,
    hashed_pw: str,
    role: UserRole,
    institution: Optional[str],
    db: DBSession,
) -> User:
    """
    Crea un usuario con autenticación local (email + contraseña).
    Verifica que el correo no esté registrado previamente.
    """
    if get_user_by_email(email, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo electrónico.",
        )

    user = User(
        full_name=full_name,
        email=email,
        hashed_password=hashed_pw,
        role=role,
        institution=institution,
        auth_provider=AuthProvider.LOCAL,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_staff_account(data: UserCreate, db: DBSession) -> User:
    """
    Crea una cuenta de staff desde el panel del superusuario.
    La cuenta se marca como verificada directamente (no requiere OTP).
    """
    if get_user_by_email(data.email, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo electrónico.",
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        institution=data.institution,
        role=UserRole.STAFF,
        auth_provider=AuthProvider.LOCAL,
        is_verified=True,  # El superusuario crea cuentas ya verificadas
        accepted_data_policy=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_oauth_user(
    email: str,
    full_name: str,
    provider: AuthProvider,
    db: DBSession,
) -> tuple[User, bool]:
    """
    Busca un usuario por correo en el flujo OAuth.
    Si no existe, lo crea automáticamente con el rol apropiado según el dominio.
    Retorna la tupla (usuario, es_nuevo). Un usuario nuevo aún no está verificado.
    """
    existing = get_user_by_email(email, db)
    if existing:
        return existing, False

    # Asigna rol initial según el dominio del correo institucional
    role = UserRole.STUDENT if email.endswith("@ucatolica.edu.co") else UserRole.EXTERNAL

    user = User(
        full_name=full_name,
        email=email,
        role=role,
        auth_provider=provider,
        accepted_data_policy=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, True


# ==============================================================
# Sección: Actualización y eliminación
# ==============================================================

def update_user(user: User, data: UserUpdate, db: DBSession) -> User:
    """Aplica las actualizaciones parciales a un usuario existente."""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(user: User, db: DBSession) -> None:
    """Elimina permanentemente un usuario de la base de datos."""
    db.delete(user)
    db.commit()


def mark_user_verified(user: User, db: DBSession) -> None:
    """Marca al usuario como verificado tras completar el flujo OTP exitosamente."""
    user.is_verified = True
    db.commit()
