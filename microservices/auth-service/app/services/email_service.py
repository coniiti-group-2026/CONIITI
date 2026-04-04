import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException, status

from app.config import settings


def _build_password_reset_html(full_name: str, reset_url: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
            .container {{ max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #091D36, #0D2B4E); padding: 32px; text-align: center; border-bottom: 4px solid #D4A017; color: white; }}
            .body {{ padding: 36px 40px; color: #333; }}
            .button {{ display: inline-block; margin: 24px 0; padding: 14px 22px; background: #0D2B4E; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: bold; }}
            .note {{ color: #666; font-size: 13px; line-height: 1.5; }}
            .footer {{ background: #091D36; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CONIITI</h1>
                <p>Restablecimiento de contrasena</p>
            </div>
            <div class="body">
                <p>Hola <strong>{full_name}</strong>,</p>
                <p>Recibimos una solicitud para cambiar la contrasena de tu cuenta.</p>
                <p>
                    <a class="button" href="{reset_url}">Restablecer contrasena</a>
                </p>
                <p class="note">
                    Este enlace expira en {settings.RESET_PASSWORD_TOKEN_EXPIRE_MINUTES} minutos.
                    Si no solicitaste este cambio, puedes ignorar este correo.
                </p>
                <p class="note">{reset_url}</p>
            </div>
            <div class="footer">
                Mensaje generado automaticamente por auth-service.
            </div>
        </div>
    </body>
    </html>
    """


def send_password_reset_email(to_email: str, full_name: str, reset_url: str) -> None:
    smtp_configured = bool(settings.SMTP_USER and settings.SMTP_PASSWORD)
    if not smtp_configured:
        if settings.ENVIRONMENT == "development":
            print("\n" + "=" * 55)
            print("  PASSWORD RESET LINK (modo desarrollo)")
            print(f"  Para: {to_email}")
            print(f"  URL: {reset_url}")
            print("=" * 55 + "\n")
            return
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El correo de recuperacion no esta configurado.",
        )

    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = "Restablece tu contrasena de CONIITI"
    message.attach(MIMEText(_build_password_reset_html(full_name, reset_url), "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], message.as_string())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible enviar el correo de recuperacion.",
        ) from exc
