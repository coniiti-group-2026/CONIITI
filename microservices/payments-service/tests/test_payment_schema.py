from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.models.payment import PaymentRegion
from app.schemas.payment import PaymentCreate


def test_payment_create_requires_positive_amount():
    with pytest.raises(ValidationError):
        PaymentCreate(
            user_id=uuid4(),
            amount=0,
            currency="cop",
            payment_region=PaymentRegion.LOCAL,
        )


def test_payment_create_normalizes_currency():
    payload = PaymentCreate(
        user_id=uuid4(),
        amount=150000,
        currency="usd",
        payment_region=PaymentRegion.INTERNATIONAL,
    )

    assert payload.currency == "USD"
