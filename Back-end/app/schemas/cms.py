import uuid
from typing import Optional
from pydantic import BaseModel, HttpUrl

class ContentCardBase(BaseModel):
    section: str
    title: str
    subtitle: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class ContentCardCreate(ContentCardBase):
    pass

class ContentCardUpdate(BaseModel):
    section: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    year: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class ContentCardRead(ContentCardBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
