# ============================================================
# Servicio de Correo Electrónico — CONIITI API
# Responsabilidad única (SRP): componer y enviar correos HTML
# para la verificación OTP y notificaciones del sistema.
# Utiliza aiosmtplib para envíos asincrónicos sin bloquear.
# ============================================================

import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


# ==============================================================
# Sección: Plantillas HTML de correo
# ==============================================================

def _build_otp_html(code: str, purpose: str, full_name: str) -> str:
    """Construye el cuerpo HTML del correo de verificación OTP."""
    purpose_texts = {
        "register":       "registro en la plataforma",
        "login":          "inicio de sesión",
        "password_reset": "restablecimiento de contraseña",
    }
    purpose_text = purpose_texts.get(purpose, "verificación")
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
            .container {{ max-width: 520px; margin: 40px auto; background: #fff;
                          border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #1a237e, #283593);
                       padding: 32px; text-align: center; }}
            .header h1 {{ color: #fff; margin: 0; font-size: 26px; letter-spacing: 2px; }}
            .header p {{ color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }}
            .body {{ padding: 36px 40px; color: #333; }}
            .body p {{ line-height: 1.6; }}
            .code-box {{ background: #f0f4ff; border: 2px dashed #3949ab;
                         border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
            .code {{ font-size: 40px; font-weight: bold; letter-spacing: 10px;
                     color: #1a237e; font-family: monospace; }}
            .expiry {{ font-size: 13px; color: #888; margin-top: 8px; }}
            .footer {{ background: #f8f8f8; padding: 20px 40px; text-align: center;
                       font-size: 12px; color: #aaa; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CONIITI 2026</h1>
                <p>XI Congreso Internacional de Innovación y Tendencias en Ingeniería</p>
            </div>
            <div class="body">
                <p>Hola, <strong>{full_name}</strong>.</p>
                <p>Se generó un código de verificación para su {purpose_text} en la plataforma CONIITI:</p>
                <div class="code-box">
                    <div class="code">{code}</div>
                    <div class="expiry">⏱ Este código expira en <strong>10 minutos</strong>.</div>
                </div>
                <p>Si no solicitó este código, puede ignorar este mensaje de forma segura.</p>
            </div>
            <div class="footer">
                Este correo fue generado automáticamente. No responda a este mensaje.
            </div>
        </div>
    </body>
    </html>
    """


# ==============================================================
# Sección: Envío de correo
# ==============================================================

async def send_otp_email(to_email: str, full_name: str, code: str, purpose: str) -> None:
    """
    Envía un correo electrónico con el código OTP al destinatario indicado.
    Utiliza conexión SMTP con STARTTLS para asegurar la transmisión.

    En modo 'development', si el SMTP no está configurado, imprime el código
    en los logs del servidor en lugar de lanzar un error 500.
    """
    subject_map = {
        "register": "Código de verificación — Registro CONIITI",
        "login": "Código de verificación — Inicio de sesión CONIITI",
    }
    subject = subject_map.get(purpose, "Código de verificación — CONIITI")

    # Si el SMTP no está configurado, usamos el modo de desarrollo
    smtp_configured = bool(settings.SMTP_USER and settings.SMTP_PASSWORD
                           and settings.SMTP_USER != "tu_correo@gmail.com"
                           and settings.SMTP_PASSWORD != "TU_CONTRASEÑA_DE_APLICACION")

    if not smtp_configured:
        if settings.ENVIRONMENT == "development":
            print("\n" + "=" * 55)
            print("  📧  MODO DESARROLLO — SMTP no configurado")
            print(f"  Para: {to_email}  ({purpose})")
            print(f"  Código OTP: {code}")
            print("=" * 55 + "\n")
            return
        else:
            raise RuntimeError("SMTP no configurado en modo producción.")

    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = subject

    html_body = _build_otp_html(code, purpose, full_name)
    message.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
    except Exception as e:
        if settings.ENVIRONMENT == "development":
            print("\n" + "=" * 55)
            print(f"  ⚠️   SMTP falló: {e}")
            print(f"  📧  Código OTP para {to_email}: {code}")
            print("=" * 55 + "\n")
        else:
            raise
