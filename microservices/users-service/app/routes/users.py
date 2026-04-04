from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="User email already exists")

    if user.id:
        existing_id = db.query(User).filter(User.id == user.id).first()
        if existing_id:
            raise HTTPException(status_code=409, detail="User id already exists")

    user_data = {
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "institution": user.institution,
        "is_active": user.is_active,
    }
    if user.id:
        user_data["id"] = user.id

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/")
def get_users(
    role: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@router.get("/by-email", response_model=UserResponse)
def get_user_by_email(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}")
def update_user(user_id: str, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.full_name:
        user.full_name = user_data.full_name

    if user_data.email:
        user.email = user_data.email

    if user_data.role:
        user.role = user_data.role

    if user_data.institution is not None:
        user.institution = user_data.institution

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)

    return user

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
