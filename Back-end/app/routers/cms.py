from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.session import get_db
from app.models.cms import ContentCard
from app.schemas.cms import ContentCardCreate, ContentCardUpdate, ContentCardRead
from app.models.user import UserRole
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/cms", tags=["CMS Genérico"])

def get_current_staff_user(current_user = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPERUSER, UserRole.STAFF]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para gestionar contenidos.")
    return current_user

@router.get("/cards/{section}", response_model=List[ContentCardRead])
def get_cards_by_section(section: str, active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(ContentCard).filter(ContentCard.section == section)
    if active_only:
        query = query.filter(ContentCard.is_active == True)
    return query.order_by(ContentCard.sort_order).all()

@router.post("/cards", response_model=ContentCardRead, status_code=status.HTTP_201_CREATED)
def create_card(
    card: ContentCardCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_staff_user)
):
    db_card = ContentCard(**card.model_dump())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.put("/cards/{card_id}", response_model=ContentCardRead)
def update_card(
    card_id: uuid.UUID, 
    card_update: ContentCardUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_staff_user)
):
    db_card = db.query(ContentCard).filter(ContentCard.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    update_data = card_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)
    
    db.commit()
    db.refresh(db_card)
    return db_card

@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: uuid.UUID, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_staff_user)
):
    db_card = db.query(ContentCard).filter(ContentCard.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    db.delete(db_card)
    db.commit()
