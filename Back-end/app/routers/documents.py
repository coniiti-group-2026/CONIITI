# ============================================================
# Router de Documentos CONIITI — CONIITI API
# CRUD completo de documentos PDF del congreso.
# Categorías: 'sistema' (cronogramas, actas) y 'ponente'.
# Lectura pública, escritura requiere rol staff.
# ============================================================

import uuid
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel

from app.db.session import get_db
from app.dependencies.auth import require_staff
from app.models.user import User
from app.models.document import ConitiDocument

router = APIRouter(prefix="/documents", tags=["Documentos CONIITI"])


# --- Schemas inline ---

class DocumentCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    file_url: str
    category: str = "sistema"     # 'sistema' | 'ponente'
    ponente_nombre: Optional[str] = None
    sort_order: int = 0


class DocumentRead(BaseModel):
    id: uuid.UUID
    titulo: str
    descripcion: Optional[str]
    file_url: str
    category: str
    ponente_nombre: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================================================
# Endpoints públicos
# ==============================================================

@router.get("", response_model=List[DocumentRead], summary="Listar documentos")
def list_documents(
    category: Optional[str] = Query(None, description="Filtrar por categoría: 'sistema' o 'ponente'"),
    ponente_nombre: Optional[str] = Query(None, description="Filtrar por nombre de ponente"),
    db: DBSession = Depends(get_db),
):
    """Retorna todos los documentos activos, con filtros opcionales."""
    query = db.query(ConitiDocument).filter(ConitiDocument.is_active == True)
    if category:
        query = query.filter(ConitiDocument.category == category)
    if ponente_nombre:
        query = query.filter(ConitiDocument.ponente_nombre == ponente_nombre)
    return query.order_by(ConitiDocument.sort_order, ConitiDocument.created_at.desc()).all()


@router.get("/{doc_id}", response_model=DocumentRead, summary="Obtener documento por ID")
def get_document(doc_id: uuid.UUID, db: DBSession = Depends(get_db)):
    doc = db.query(ConitiDocument).filter(ConitiDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return doc


# ==============================================================
# Endpoints protegidos (staff)
# ==============================================================

@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED, summary="Crear documento")
def create_document(
    data: DocumentCreate,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_staff),
):
    """Crea un nuevo documento CONIITI. El archivo ya debe estar subido al files-service."""
    doc = ConitiDocument(**data.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.put("/{doc_id}", response_model=DocumentRead, summary="Actualizar documento")
def update_document(
    doc_id: uuid.UUID,
    data: DocumentCreate,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_staff),
):
    doc = db.query(ConitiDocument).filter(ConitiDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar documento")
def delete_document(
    doc_id: uuid.UUID,
    db: DBSession = Depends(get_db),
    _: User = Depends(require_staff),
):
    doc = db.query(ConitiDocument).filter(ConitiDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    db.delete(doc)
    db.commit()
