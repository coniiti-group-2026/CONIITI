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
            .header {{ background: linear-gradient(135deg, #091D36, #0D2B4E);
                       padding: 32px; text-align: center; border-bottom: 4px solid #D4A017; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 2px; }}
            .header p {{ color: #E8BA3A; margin: 6px 0 0; font-size: 13px; font-weight: bold; }}
            .body {{ padding: 36px 40px; color: #333; }}
            .body p {{ line-height: 1.6; font-size: 15px; }}
            .code-box {{ background: #f4f7fb; border: 2px dashed #D4A017;
                         border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
            .code {{ font-size: 40px; font-weight: bold; letter-spacing: 12px;
                     color: #0D2B4E; font-family: monospace; display: block; margin-bottom: 5px; }}
            .expiry {{ font-size: 13px; color: #666; margin-top: 8px; }}
            .footer {{ background: #091D36; padding: 20px 40px; text-align: center;
                       font-size: 12px; color: #aaa; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CONIITI</h1>
                <p>XI CONGRESO INTERNACIONAL DE INNOVACIÓN Y TENDENCIAS EN INGENIERÍA</p>
            </div>
            <div class="body">
                <p>Estimado/a <strong>{full_name}</strong>,</p>
                <p>Se ha generado un código de verificación para su proceso de <strong>{purpose_text}</strong> en la plataforma oficial del congreso.</p>
                <div class="code-box">
                    <span class="code">{code}</span>
                    <div class="expiry">⏱ Este código expira en <strong>10 minutos</strong>.</div>
                </div>
                <p>Si usted no solicitó este código, puede ignorar y eliminar este mensaje de forma segura.</p>
            </div>
            <div class="footer">
                Este es un correo generado automáticamente por el sistema de seguridad CONIITI.<br>Por favor, no responda a este mensaje.
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
        print("\n=== INTENTANDO ENVIAR SMTP ===")
        print(f"HOST: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        print(f"USER: {settings.SMTP_USER}")
        print(f"Hacia: {to_email}")
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        print("=== ENVÍO SMTP EXITOSO ===\n")
    except Exception as e:
        print("\n" + "=" * 55)
        print(f"  ⚠️   SMTP falló críticamente: {str(e)}")
        print(f"  📧  Código OTP para {to_email}: {code}")
        print("=" * 55 + "\n")
        raise ValueError(f"Error enviando correo SMTP: {str(e)}")
