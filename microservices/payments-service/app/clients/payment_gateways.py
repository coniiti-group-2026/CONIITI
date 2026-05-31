import base64
import logging
import os

import httpx
import mercadopago
from dataclasses import dataclass
from fastapi import HTTPException, Request

from app.models.payment import Payment, PaymentProvider


PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "TEST_PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "TEST_PAYPAL_SECRET")
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "TEST-placeholder-access-token")
PAYMENT_PROVIDER_MODE = os.getenv("PAYMENT_PROVIDER_MODE", "mock").strip().lower()
PUBLIC_APP_URL = os.getenv("PUBLIC_APP_URL", "http://localhost").rstrip("/")

_PAYMENT_PLACEHOLDERS = {"TEST_PAYPAL_CLIENT_ID", "TEST_PAYPAL_SECRET", "TEST-placeholder-access-token", ""}
if PAYMENT_PROVIDER_MODE not in ("mock", "test") and (
    PAYPAL_CLIENT_ID in _PAYMENT_PLACEHOLDERS
    or PAYPAL_CLIENT_SECRET in _PAYMENT_PLACEHOLDERS
    or MP_ACCESS_TOKEN in _PAYMENT_PLACEHOLDERS
):
    logging.getLogger(__name__).warning(
        "payments-service: credenciales de pasarela no configuradas. "
        "Los pagos reales fallaran. Use PAYMENT_PROVIDER_MODE=mock para pruebas locales."
    )


@dataclass(frozen=True)
class CheckoutSession:
    provider_reference_id: str
    checkout_url: str


class PublicUrlBuilder:
    def forwarded_prefix(self, request: Request) -> str:
        forwarded_prefix = request.headers.get("x-forwarded-prefix", "").split(",", 1)[0].strip()
        if not forwarded_prefix:
            return "/api/payments"
        if not forwarded_prefix.startswith("/"):
            forwarded_prefix = f"/{forwarded_prefix}"
        return forwarded_prefix.rstrip("/")

    def public_base_url(self, request: Request) -> str:
        proto = request.headers.get("x-forwarded-proto", request.url.scheme).split(",", 1)[0].strip()
        host = request.headers.get("x-forwarded-host", request.headers.get("host", "")).split(",", 1)[0].strip()
        if host:
            return f"{proto}://{host}"
        return PUBLIC_APP_URL

    def build_mock_checkout_url(self, request: Request, payment: Payment) -> str:
        return f"{self.public_base_url(request)}{self.forwarded_prefix(request)}/mock-checkout/{payment.id}"

    def frontend_url(self, path: str) -> str:
        return f"{PUBLIC_APP_URL}/{path.lstrip('/')}"


class PayPalGateway:
    async def _get_access_token(self) -> str:
        auth_string = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
        b64_auth = base64.b64encode(auth_string.encode()).decode()

        headers = {
            "Authorization": f"Basic {b64_auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{PAYPAL_API_BASE}/v1/oauth2/token", headers=headers, data=data)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error autenticando con PayPal")

        return response.json()["access_token"]

    async def create_checkout(self, payment: Payment, url_builder: PublicUrlBuilder) -> CheckoutSession:
        try:
            token = await self._get_access_token()

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }
            order_payload = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "reference_id": str(payment.id),
                        "amount": {
                            "currency_code": payment.currency.upper(),
                            "value": str(round(payment.amount, 2)),
                        },
                        "description": "Entrada CONIITI 2026",
                    }
                ],
                "application_context": {
                    "return_url": url_builder.frontend_url("success"),
                    "cancel_url": url_builder.frontend_url("cancel"),
                    "user_action": "PAY_NOW",
                },
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{PAYPAL_API_BASE}/v2/checkout/orders",
                    headers=headers,
                    json=order_payload,
                )

            if response.status_code != 201:
                raise Exception(f"PayPal devolvio error: {response.text}")

            order_data = response.json()
            return CheckoutSession(
                provider_reference_id=order_data["id"],
                checkout_url=next(link["href"] for link in order_data["links"] if link["rel"] == "approve"),
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Error con PayPal: {exc}") from exc


class MercadoPagoGateway:
    def __init__(self):
        self._sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

    async def create_checkout(self, payment: Payment, url_builder: PublicUrlBuilder) -> CheckoutSession:
        try:
            preference_data = {
                "items": [
                    {
                        "title": "Entrada CONIITI 2026",
                        "quantity": 1,
                        "currency_id": payment.currency.upper(),
                        "unit_price": float(payment.amount),
                    }
                ],
                "external_reference": str(payment.id),
                "back_urls": {
                    "success": url_builder.frontend_url("success"),
                    "failure": url_builder.frontend_url("cancel"),
                    "pending": url_builder.frontend_url("pending"),
                },
            }
            preference_response = self._sdk.preference().create(preference_data)
            preference = preference_response["response"]
            if "init_point" not in preference:
                raise HTTPException(
                    status_code=500,
                    detail=f"MercadoPago no devolvio init_point. Respuesta: {preference}",
                )
            return CheckoutSession(
                provider_reference_id=preference["id"],
                checkout_url=preference["init_point"],
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Error con MercadoPago: {exc}") from exc


class MockPaymentGateway:
    async def create_checkout(
        self,
        payment: Payment,
        request: Request,
        url_builder: PublicUrlBuilder,
    ) -> CheckoutSession:
        return CheckoutSession(
            provider_reference_id=f"mock-{payment.provider.value.lower()}-{payment.id}",
            checkout_url=url_builder.build_mock_checkout_url(request, payment),
        )


class PaymentGatewayResolver:
    def __init__(
        self,
        *,
        url_builder: PublicUrlBuilder | None = None,
        paypal_gateway: PayPalGateway | None = None,
        mercadopago_gateway: MercadoPagoGateway | None = None,
        mock_gateway: MockPaymentGateway | None = None,
    ):
        self._url_builder = url_builder or PublicUrlBuilder()
        self._paypal_gateway = paypal_gateway or PayPalGateway()
        self._mercadopago_gateway = mercadopago_gateway or MercadoPagoGateway()
        self._mock_gateway = mock_gateway or MockPaymentGateway()
        self._provider_gateways = {
            PaymentProvider.PAYPAL: self._paypal_gateway,
            PaymentProvider.MERCADOPAGO: self._mercadopago_gateway,
        }

    def is_mock_mode(self) -> bool:
        return PAYMENT_PROVIDER_MODE == "mock"

    async def create_checkout(self, payment: Payment, request: Request) -> CheckoutSession:
        if self.is_mock_mode():
            return await self._mock_gateway.create_checkout(payment, request, self._url_builder)

        gateway = self._provider_gateways[payment.provider]
        return await gateway.create_checkout(payment, self._url_builder)
