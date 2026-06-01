import uuid

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentApplicationService
from app.utils.security import (
    AuthenticatedUser,
    get_current_user,
    require_payment_access,
)


router = APIRouter()
payment_service = PaymentApplicationService()


@router.post("/create-checkout", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment: PaymentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    require_payment_access(payment.user_id, current_user)
    return await payment_service.create_payment(payment, request, db)


@router.get("/mock-checkout/{payment_id}", response_class=HTMLResponse)
def mock_checkout(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    payment = payment_service.get_payment(payment_id, db)
    require_payment_access(payment.user_id, current_user)
    return payment_service.render_mock_checkout(payment_id, db)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment_status(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    payment = payment_service.get_payment(payment_id, db)
    require_payment_access(payment.user_id, current_user)
    return payment


@router.post("/webhook/paypal")
async def paypal_webhook(request: Request, db: Session = Depends(get_db)):
    return await payment_service.handle_paypal_webhook(request, db)


@router.post("/webhook/mercadopago")
async def mercadopago_webhook(request: Request, db: Session = Depends(get_db)):
    return await payment_service.handle_mercadopago_webhook(request, db)
