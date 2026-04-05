import base64
import os
import uuid

import httpx
import mercadopago
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Payment, PaymentProvider, PaymentRegion, PaymentStatus
from schemas import PaymentCreate, PaymentResponse


PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "TEST_PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "TEST_PAYPAL_SECRET")
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "TEST-placeholder-access-token")
PAYMENT_PROVIDER_MODE = os.getenv("PAYMENT_PROVIDER_MODE", "live").strip().lower()
PUBLIC_APP_URL = os.getenv("PUBLIC_APP_URL", "http://localhost").rstrip("/")

sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
router = APIRouter()


def _is_mock_mode() -> bool:
    return PAYMENT_PROVIDER_MODE == "mock"


def _forwarded_prefix(request: Request) -> str:
    forwarded_prefix = request.headers.get("x-forwarded-prefix", "").split(",", 1)[0].strip()
    if not forwarded_prefix:
        return "/api/payments"
    if not forwarded_prefix.startswith("/"):
        forwarded_prefix = f"/{forwarded_prefix}"
    return forwarded_prefix.rstrip("/")


def _public_base_url(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto", request.url.scheme).split(",", 1)[0].strip()
    host = request.headers.get("x-forwarded-host", request.headers.get("host", "")).split(",", 1)[0].strip()
    if host:
        return f"{proto}://{host}"
    return PUBLIC_APP_URL


def _build_mock_checkout_url(request: Request, payment_id: uuid.UUID) -> str:
    return f"{_public_base_url(request)}{_forwarded_prefix(request)}/mock-checkout/{payment_id}"


def _frontend_url(path: str) -> str:
    return f"{PUBLIC_APP_URL}/{path.lstrip('/')}"


async def get_paypal_access_token() -> str:
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


@router.post("/create-checkout", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment: PaymentCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    provider = (
        PaymentProvider.MERCADOPAGO
        if payment.payment_region == PaymentRegion.LOCAL
        else PaymentProvider.PAYPAL
    )

    nueva_op = Payment(
        user_id=payment.user_id,
        amount=payment.amount,
        currency=payment.currency,
        payment_region=payment.payment_region,
        provider=provider,
        status=PaymentStatus.PENDING,
    )
    db.add(nueva_op)
    db.commit()
    db.refresh(nueva_op)

    checkout_url = ""

    if _is_mock_mode():
        checkout_url = _build_mock_checkout_url(request, nueva_op.id)
        nueva_op.provider_reference_id = f"mock-{provider.value.lower()}-{nueva_op.id}"
    elif provider == PaymentProvider.PAYPAL:
        try:
            token = await get_paypal_access_token()

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }
            order_payload = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "reference_id": str(nueva_op.id),
                        "amount": {
                            "currency_code": payment.currency.upper(),
                            "value": str(round(payment.amount, 2)),
                        },
                        "description": "Entrada CONIITI 2026",
                    }
                ],
                "application_context": {
                    "return_url": _frontend_url("success"),
                    "cancel_url": _frontend_url("cancel"),
                    "user_action": "PAY_NOW",
                },
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    f"{PAYPAL_API_BASE}/v2/checkout/orders",
                    headers=headers,
                    json=order_payload,
                )

            if res.status_code != 201:
                raise Exception(f"PayPal devolvio error: {res.text}")

            order_data = res.json()
            nueva_op.provider_reference_id = order_data["id"]
            checkout_url = next(link["href"] for link in order_data["links"] if link["rel"] == "approve")
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Error con PayPal: {exc}") from exc
    else:
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
                "external_reference": str(nueva_op.id),
                "back_urls": {
                    "success": _frontend_url("success"),
                    "failure": _frontend_url("cancel"),
                    "pending": _frontend_url("pending"),
                },
            }
            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]
            if "init_point" not in preference:
                raise HTTPException(
                    status_code=500,
                    detail=f"MercadoPago no devolvio init_point. Respuesta: {preference}",
                )
            checkout_url = preference["init_point"]
            nueva_op.provider_reference_id = preference["id"]
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Error con MercadoPago: {exc}") from exc

    nueva_op.checkout_url = checkout_url
    db.commit()
    db.refresh(nueva_op)

    return nueva_op


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment_status(payment_id: uuid.UUID, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return payment


@router.get("/mock-checkout/{payment_id}", response_class=HTMLResponse)
def mock_checkout(payment_id: uuid.UUID, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

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


@router.post("/webhook/paypal")
async def paypal_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()

    if payload.get("event_type") == "PAYMENT.CAPTURE.COMPLETED":
        try:
            resource = payload["resource"]
            print("Webhook PayPal completado:", resource)
        except Exception:
            pass

    return {"status": "success"}


@router.post("/webhook/mercadopago")
async def mercadopago_webhook(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    if data.get("action") in ["payment.created", "payment.updated"]:
        mp_payment_id = data["data"]["id"]

        payment = db.query(Payment).filter(Payment.provider_reference_id == str(mp_payment_id)).first()
        if payment and payment.status == PaymentStatus.PENDING:
            payment.status = PaymentStatus.COMPLETED
            db.commit()

    return {"status": "success"}
