from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.committee import CommitteeMember
from app.schemas.committee_schema import CommitteeMemberCreate, CommitteeMemberUpdate


def list_committee_members(db: Session, active_only: bool = True) -> list[CommitteeMember]:
    query = db.query(CommitteeMember)
    if active_only:
        query = query.filter(CommitteeMember.activo.is_(True))
    return query.order_by(CommitteeMember.orden.asc(), CommitteeMember.nombre.asc()).all()


def get_committee_member_or_404(member_id: str, db: Session) -> CommitteeMember:
    member = db.query(CommitteeMember).filter(CommitteeMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Miembro de comite no encontrado.")
    return member


def create_committee_member(payload: CommitteeMemberCreate, db: Session) -> CommitteeMember:
    member = CommitteeMember(**payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def update_committee_member(
    member_id: str,
    payload: CommitteeMemberUpdate,
    db: Session,
) -> CommitteeMember:
    member = get_committee_member_or_404(member_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    return member


def delete_committee_member(member_id: str, db: Session) -> None:
    member = get_committee_member_or_404(member_id, db)
    db.delete(member)
    db.commit()
