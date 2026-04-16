from typing import Literal

from pydantic import BaseModel


class AssetRead(BaseModel):
    id: str
    filename: str
    original_name: str
    url: str
    content_type: str | None = None
    size_bytes: int = 0
    created_at: str


class DocumentCreate(BaseModel):
    titulo: str
    descripcion: str | None = None
    category: Literal["sistema", "ponente"]
    ponente_nombre: str | None = None
    session_id: str | None = None
    file_url: str
    asset_id: str | None = None
    original_name: str | None = None
    sort_order: int = 0


class DocumentRead(DocumentCreate):
    id: str
    created_at: str


class ContentCardCreate(BaseModel):
    section: str
    title: str
    subtitle: str | None = None
    year: int | None = None
    description: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class ContentCardRead(ContentCardCreate):
    id: str
    created_at: str
    updated_at: str
