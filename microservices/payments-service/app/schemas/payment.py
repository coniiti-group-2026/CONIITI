from pydantic import BaseModel, ConfigDict, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models.payment import PaymentStatus, PaymentRegion, PaymentProvider

class PaymentCreate(BaseModel):
    user_id: UUID
    amount: float = Field(..., gt=0)
    currency: Optional[str] = Field(default="COP", min_length=3, max_length=3)
    payment_region: PaymentRegion

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str:
        return (value or "COP").strip().upper()

class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    amount: float
    currency: str
    payment_region: PaymentRegion
    provider: PaymentProvider
    status: PaymentStatus
    checkout_url: Optional[str] = None
    provider_reference_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
