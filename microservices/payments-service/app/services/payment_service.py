import logging
import uuid

from fastapi import HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.models.payment import PaymentProvider, PaymentRegion, PaymentStatus
from app.repositories.payment_repository import PaymentRepository
from app.schemas.payment import PaymentCreate
from app.clients.payment_gateways import PaymentGatewayResolver


class PaymentApplicationService:
    def __init__(self, gateway_resolver: PaymentGatewayResolver | None = None):
        self._gateway_resolver = gateway_resolver or PaymentGatewayResolver()

    def _resolve_provider(self, payment: PaymentCreate) -> PaymentProvider:
        if payment.payment_region == PaymentRegion.LOCAL:
            return PaymentProvider.MERCADOPAGO
        return PaymentProvider.PAYPAL

    async def create_payment(
        self,
        payment_payload: PaymentCreate,
        request: Request,
        db: Session,
    ):
        repository = PaymentRepository(db)
        payment = repository.create_pending(
            payment_payload,
            provider=self._resolve_provider(payment_payload),
        )

        checkout_session = await self._gateway_resolver.create_checkout(payment, request)
        payment.checkout_url = checkout_session.checkout_url
        payment.provider_reference_id = checkout_session.provider_reference_id
        return repository.save(payment)

    def get_payment(self, payment_id: uuid.UUID, db: Session):
        repository = PaymentRepository(db)
        payment = repository.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        return payment

    def render_mock_checkout(self, payment_id: uuid.UUID, db: Session) -> HTMLResponse:
        payment = self.get_payment(payment_id, db)

        html = f"""
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Mock Checkout CONIITI</title>
        <style>
          body {{ font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }}
          .card {{ max-width: 560px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 32px; }}
          h1 {{ margin-top: 0; }}
          code {{ color: #93c5fd; }}
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Checkout local activo</h1>
          <p>payments-service respondio correctamente detras de Traefik.</p>
          <p><strong>Pago:</strong> <code>{payment.id}</code></p>
          <p><strong>Proveedor:</strong> {payment.provider.value}</p>
          <p><strong>Monto:</strong> {payment.amount} {payment.currency}</p>
          <p><strong>Estado:</strong> {payment.status.value}</p>
        </div>
      </body>
    </html>
    """
        return HTMLResponse(content=html)

    async def handle_paypal_webhook(self, request: Request, db: Session) -> dict[str, str]:
        logger = logging.getLogger(__name__)
        payload = await request.json()

        if payload.get("event_type") == "PAYMENT.CAPTURE.COMPLETED":
            try:
                resource = payload["resource"]
                logger.info("Webhook PayPal PAYMENT.CAPTURE.COMPLETED: %s", resource)
            except Exception:
                logger.warning("Webhook PayPal recibido pero no se pudo leer resource.")

        return {"status": "success"}

    async def handle_mercadopago_webhook(self, request: Request, db: Session) -> dict[str, str]:
        data = await request.json()
        if data.get("action") in ["payment.created", "payment.updated"]:
            mp_payment_id = data["data"]["id"]
            repository = PaymentRepository(db)
            payment = repository.get_by_provider_reference(str(mp_payment_id))
            if payment and payment.status == PaymentStatus.PENDING:
                payment.status = PaymentStatus.COMPLETED
                repository.save(payment)

        return {"status": "success"}
