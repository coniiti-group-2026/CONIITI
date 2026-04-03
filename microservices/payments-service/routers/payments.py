import uuid
import os
import base64
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from schemas import PaymentCreate, PaymentResponse
from models import Payment, PaymentStatus, PaymentRegion, PaymentProvider
from database import get_db

import mercadopago

# Configuración de llaves (Las puedes cambiar en el .env)
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "TEST_PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "TEST_PAYPAL_SECRET")
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "TEST-placeholder-access-token")
sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

router = APIRouter()

async def get_paypal_access_token() -> str:
    """Genera el Bearer Token comunicándose con PayPal OAuth2."""
    auth_string = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth_string.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{PAYPAL_API_BASE}/v1/oauth2/token", headers=headers, data=data)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error autenticando con PayPal")
            
        return response.json()["access_token"]


@router.post("/create-checkout", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """
    Ruteo estático (Strategy Pattern) para iniciar el cobro.
    LOCAL -> Mercado Pago
    INTERNATIONAL -> PayPal
    """
    provider = PaymentProvider.MERCADOPAGO if payment.payment_region == PaymentRegion.LOCAL else PaymentProvider.PAYPAL
    
    nueva_op = Payment(
        user_id=payment.user_id,
        amount=payment.amount,
        currency=payment.currency,
        payment_region=payment.payment_region,
        provider=provider,
        status=PaymentStatus.PENDING
    )
    db.add(nueva_op)
    db.commit()
    db.refresh(nueva_op)

    checkout_url = ""
    
    if provider == PaymentProvider.PAYPAL:
        try:
            # 1. Obtener Token
            token = await get_paypal_access_token()
            
            # 2. Crear Orden
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }
            order_payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "reference_id": str(nueva_op.id),
                    "amount": {
                        "currency_code": payment.currency.upper(),
                        "value": str(round(payment.amount, 2))
                    },
                    "description": "Entrada CONIITI 2026"
                }],
                "application_context": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel",
                    "user_action": "PAY_NOW"
                }
            }
            
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{PAYPAL_API_BASE}/v2/checkout/orders", headers=headers, json=order_payload)
                if res.status_code != 201:
                    raise Exception(f"PayPal devolvió error: {res.text}")
                    
                order_data = res.json()
                nueva_op.provider_reference_id = order_data["id"]
                
                # Buscar el link de aprobación (pantalla de PayPal)
                approve_link = next(link["href"] for link in order_data["links"] if link["rel"] == "approve")
                checkout_url = approve_link

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error con PayPal: {str(e)}")

    elif provider == PaymentProvider.MERCADOPAGO:
        try:
            preference_data = {
                "items": [
                    {
                        "title": "Entrada CONIITI 2026",
                        "quantity": 1,
                        "currency_id": payment.currency.upper(),
                        "unit_price": float(payment.amount)
                    }
                ],
                "external_reference": str(nueva_op.id),
                "back_urls": {
                    "success": "http://localhost:3000/success",
                    "failure": "http://localhost:3000/cancel",
                    "pending": "http://localhost:3000/pending"
                }
            }
            preference_response = sdk.preference().create(preference_data)
            print(f"[MP DEBUG] Status: {preference_response['status']}")
            print(f"[MP DEBUG] Response completo: {preference_response['response']}")
            preference = preference_response["response"]
            if "init_point" not in preference:
                raise HTTPException(
                    status_code=500,
                    detail=f"MercadoPago no devolvió init_point. Respuesta: {preference}"
                )
            checkout_url = preference["init_point"]
            nueva_op.provider_reference_id = preference["id"]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error con MercadoPago: {str(e)}")

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

# --- WEBHOOKS OFICIALES ---

@router.post("/webhook/paypal")
async def paypal_webhook(request: Request, db: Session = Depends(get_db)):
    """Webhook para recibir confirmaciones reales de PayPal."""
    payload = await request.json()
    
    # Evento cuando un pago se aprueba y captura formalmente
    if payload.get("event_type") == "PAYMENT.CAPTURE.COMPLETED":
        # resource id suele ser el capture ID, pero a veces necesitas mapearlo a la orden (Order ID)
        # o puedes guardar el custom_id enviado en purchase_units
        try:
            # Ejemplo simplificado: buscar por el provider_reference_id (Order ID guardado en BD)
            resource = payload["resource"]
            # En PayPal, una orden tiene capturas. Podrias haber guardado el order_id o buscar usando la info anidada
            # Para probar, asumiremos match mediante la info q llegue:
            print("Webhook PayPal Completado:", resource)
        except Exception:
            pass

    return {"status": "success"}

@router.post("/webhook/mercadopago")
async def mercadopago_webhook(request: Request, db: Session = Depends(get_db)):
    """Webhook para recibir confirmaciones reales de Mercado Pago."""
    data = await request.json()
    if data.get("action") in ["payment.created", "payment.updated"]:
        mp_payment_id = data["data"]["id"]
        
        payment = db.query(Payment).filter(Payment.provider_reference_id == str(mp_payment_id)).first()
        if payment and payment.status == PaymentStatus.PENDING:
            payment.status = PaymentStatus.COMPLETED
            db.commit()
            
    return {"status": "success"}
