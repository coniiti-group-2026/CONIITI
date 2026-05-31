from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.committee_schema import (
    CommitteeMemberCreate,
    CommitteeMemberResponse,
    CommitteeMemberUpdate,
)
from app.services import committee_service
from app.utils.security import require_superuser


router = APIRouter(tags=["Committees"])


@router.get("/members", response_model=list[CommitteeMemberResponse])
def list_members(
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    return committee_service.list_committee_members(db, active_only=active_only)


@router.post("/members", response_model=CommitteeMemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    payload: CommitteeMemberCreate,
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    return committee_service.create_committee_member(payload, db)


@router.put("/members/{member_id}", response_model=CommitteeMemberResponse)
@router.patch("/members/{member_id}", response_model=CommitteeMemberResponse)
def update_member(
    member_id: str,
    payload: CommitteeMemberUpdate,
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    return committee_service.update_committee_member(member_id, payload, db)


@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    _: Any = Depends(require_superuser),
):
    committee_service.delete_committee_member(member_id, db)
