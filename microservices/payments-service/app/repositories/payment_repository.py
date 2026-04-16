from uuid import UUID

from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentProvider, PaymentStatus
from app.schemas.payment import PaymentCreate


class PaymentRepository:
    def __init__(self, db: Session):
        self._db = db

    def create_pending(self, payload: PaymentCreate, provider: PaymentProvider) -> Payment:
        payment = Payment(
            user_id=payload.user_id,
            amount=payload.amount,
            currency=payload.currency,
            payment_region=payload.payment_region,
            provider=provider,
            status=PaymentStatus.PENDING,
        )
        self._db.add(payment)
        self._db.commit()
        self._db.refresh(payment)
        return payment

    def get_by_id(self, payment_id: UUID) -> Payment | None:
        return self._db.query(Payment).filter(Payment.id == payment_id).first()

    def get_by_provider_reference(self, provider_reference_id: str) -> Payment | None:
        return (
            self._db.query(Payment)
            .filter(Payment.provider_reference_id == provider_reference_id)
            .first()
        )

    def save(self, payment: Payment) -> Payment:
        self._db.commit()
        self._db.refresh(payment)
        return payment
