import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, Enum, DateTime, Uuid

from app.database import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REJECTED = "REJECTED"

class PaymentRegion(str, enum.Enum):
    LOCAL = "LOCAL"
    INTERNATIONAL = "INTERNATIONAL"

class PaymentProvider(str, enum.Enum):
    MERCADOPAGO = "MERCADOPAGO"
    PAYPAL = "PAYPAL"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    # No usamos ForeignKey cruzada para mantener el microservicio desacoplado
    user_id = Column(Uuid(as_uuid=True), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="COP", nullable=False)
    
    # Nuevos campos para la arquitectura dual
    payment_region = Column(Enum(PaymentRegion), nullable=False)
    provider = Column(Enum(PaymentProvider), nullable=False)
    
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    # Campo para guardar el ID de transacción REAL de Stripe o MercadoPago
    provider_reference_id = Column(String, nullable=True, unique=True)
    
    # URL de pago temporal devuelta por el API
    checkout_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
