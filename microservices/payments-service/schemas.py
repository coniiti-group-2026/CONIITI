from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from models import PaymentStatus, PaymentRegion, PaymentProvider

class PaymentCreate(BaseModel):
    user_id: UUID
    amount: float
    currency: Optional[str] = "COP"
    payment_region: PaymentRegion

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
