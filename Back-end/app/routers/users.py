# ============================================================
# Router de Usuarios — CONIITI API
# Expone endpoints de gestión de cuentas staff.
# Solo accesible para el superusuario (rol SUPERUSER).
# ============================================================

import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.dependencies.auth import require_superuser
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserListItem
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Gestión de Usuarios"])


@router.get(
    "/staff",
    response_model=List[UserListItem],
    summary="Listar cuentas staff",
    description="Retorna todas las cuentas con rol de staff. Solo superusuario.",
)
def list_staff(
    db: DBSession = Depends(get_db),
    _: User = Depends(require_superuser),
):
    """Lista todos los usuarios con rol staff para el panel del superusuario."""
    return user_service.list_staff_users(db)


@router.post(
    "/staff",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear cuenta staff",
    description="Crea una nueva cuenta con rol de staff. Solo superusuario.",
)
def create_staff(
    data: UserCreate,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_superuser),
):
    """Crea una cuenta de staff. La cuenta queda activa y verificada de inmediato."""
    return user_service.create_staff_account(data, db)


@router.put(
    "/staff/{user_id}",
    response_model=UserRead,
    summary="Actualizar cuenta staff",
    description="Actualiza los datos de una cuenta staff existente. Solo superusuario.",
)
def update_staff(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_superuser),
):
    """Actualiza parcialmente los datos de un usuario staff."""
    user = user_service.get_user_by_id_or_raise(user_id, db)
    return user_service.update_user(user, data, db)


@router.delete(
    "/staff/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar cuenta staff",
    description="Elimina permanentemente una cuenta staff. Solo superusuario.",
)
def delete_staff(
    user_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_superuser),
):
    """Elimina una cuenta de staff de la plataforma."""
    user = user_service.get_user_by_id_or_raise(user_id, db)
    user_service.delete_user(user, db)
