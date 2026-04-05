import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException, status

from app.config import settings


def _is_smtp_configured() -> bool:
    invalid_values = {
        "",
        "tu_correo@gmail.com",
        "TU_CONTRASEÑA_DE_APLICACION",
        "TU_CONTRASENA_DE_APLICACION",
    }
    return (
        settings.SMTP_USER not in invalid_values
        and settings.SMTP_PASSWORD not in invalid_values
    )


def _handle_development_mail_fallback(kind: str, recipient: str, details: list[str], exc: Exception | None = None) -> bool:
    if settings.ENVIRONMENT != "development":
        return False

    print("\n" + "=" * 55)
    print(f"  {kind} (modo desarrollo)")
    print(f"  Para: {recipient}")
    for detail in details:
        print(f"  {detail}")
    if exc is not None:
        print(f"  SMTP error: {exc}")
    print("=" * 55 + "\n")
    return True


def _development_otp_fallback_payload(code: str, purpose: str, reason: str) -> dict[str, str | bool]:
    return {
        "delivered": False,
        "delivery_mode": "development_fallback",
        "debug_otp": code,
        "reason": reason,
        "purpose": purpose,
    }


def _build_otp_html(full_name: str, code: str, purpose: str) -> str:
    purpose_texts = {
        "register": "registro en la plataforma",
        "login": "inicio de sesion",
    }
    purpose_text = purpose_texts.get(purpose, "verificacion de seguridad")
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
            .code-box {{ background: #f4f7fb; border: 2px dashed #D4A017; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
            .code {{ font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #0D2B4E; font-family: monospace; display: block; }}
            .note {{ color: #666; font-size: 13px; line-height: 1.5; }}
            .footer {{ background: #091D36; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CONIITI</h1>
                <p>Verificacion de seguridad</p>
            </div>
            <div class="body">
                <p>Hola <strong>{full_name}</strong>,</p>
                <p>Se genero un codigo de verificacion para completar tu proceso de <strong>{purpose_text}</strong>.</p>
                <div class="code-box">
                    <span class="code">{code}</span>
                </div>
                <p class="note">
                    Este codigo expira en {settings.OTP_EXPIRATION_MINUTES} minutos.
                    Si no solicitaste este acceso, puedes ignorar este correo.
                </p>
            </div>
            <div class="footer">
                Mensaje generado automaticamente por auth-service.
            </div>
        </div>
    </body>
    </html>
    """


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
    smtp_configured = _is_smtp_configured()
    if not smtp_configured:
        if _handle_development_mail_fallback(
            "PASSWORD RESET LINK",
            to_email,
            [f"URL: {reset_url}"],
        ):
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
        if _handle_development_mail_fallback(
            "PASSWORD RESET LINK",
            to_email,
            [f"URL: {reset_url}"],
            exc=exc,
        ):
            return
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible enviar el correo de recuperacion.",
        ) from exc


def send_otp_email(to_email: str, full_name: str, code: str, purpose: str) -> dict[str, str | bool | None]:
    smtp_configured = _is_smtp_configured()
    if not smtp_configured:
        if _handle_development_mail_fallback(
            "OTP EMAIL",
            to_email,
            [f"Proceso: {purpose}", f"Codigo: {code}"],
        ):
            return _development_otp_fallback_payload(
                code,
                purpose,
                "SMTP no configurado. Se habilito el codigo de respaldo de desarrollo.",
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El correo OTP no esta configurado.",
        )

    subject_map = {
        "register": "Codigo de verificacion - Registro CONIITI",
        "login": "Codigo de verificacion - Acceso CONIITI",
    }

    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = subject_map.get(purpose, "Codigo de verificacion - CONIITI")
    message.attach(MIMEText(_build_otp_html(full_name, code, purpose), "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], message.as_string())
        return {
            "delivered": True,
            "delivery_mode": "email",
            "debug_otp": None,
            "reason": "Correo OTP enviado correctamente.",
            "purpose": purpose,
        }
    except Exception as exc:
        if _handle_development_mail_fallback(
            "OTP EMAIL",
            to_email,
            [f"Proceso: {purpose}", f"Codigo: {code}"],
            exc=exc,
        ):
            return _development_otp_fallback_payload(
                code,
                purpose,
                "El proveedor SMTP rechazo el envio. Se habilito el codigo de respaldo de desarrollo.",
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible enviar el codigo de verificacion.",
        ) from exc
