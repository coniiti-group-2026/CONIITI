from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.schemas.user_schema import ProfileCreateRequest, ProfileUpdateRequest


def get_user_or_404(user_id: str, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def create_profile_record(profile: ProfileCreateRequest, db: Session) -> User:
    existing_email = db.query(User).filter(User.email == profile.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="User email already exists")

    if profile.id:
        existing_id = db.query(User).filter(User.id == profile.id).first()
        if existing_id:
            raise HTTPException(status_code=409, detail="User id already exists")

    user_data = {
        "full_name": profile.full_name,
        "email": profile.email,
        "role": profile.role,
        "institution": profile.institution,
        "is_active": profile.is_active,
    }
    if profile.id:
        user_data["id"] = profile.id

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def list_profiles(db: Session, role: str | None = None) -> list[User]:
    query = db.query(User)
    if role:
        query = query.filter(func.lower(User.role) == role.strip().lower())
    return query.all()


def get_profile_by_email(email: str, db: Session) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_profile_record(user: User, profile_update: ProfileUpdateRequest, db: Session) -> User:
    if profile_update.full_name:
        user.full_name = profile_update.full_name

    if profile_update.email:
        normalized_email = str(profile_update.email)
        existing = db.query(User).filter(User.email == normalized_email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=409, detail="User email already exists")
        user.email = normalized_email

    if profile_update.role:
        user.role = profile_update.role

    if profile_update.institution is not None:
        user.institution = profile_update.institution

    if profile_update.is_active is not None:
        user.is_active = profile_update.is_active

    db.commit()
    db.refresh(user)
    return user


def delete_profile_record(user: User, db: Session) -> None:
    db.delete(user)
    db.commit()


def list_staff_profiles(db: Session) -> list[User]:
    return db.query(User).filter(func.lower(User.role) == "staff").order_by(User.created_at.desc()).all()
