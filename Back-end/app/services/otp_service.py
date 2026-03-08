# ============================================================
# Servicio OTP — CONIITI API
# Responsabilidad única (SRP): generar y validar códigos OTP
# de 6 dígitos para la verificación en dos pasos del usuario.
# ============================================================

import random
import string
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session as DBSession
from fastapi import HTTPException, status

from app.models.otp import OTPCode, OTPPurpose
from app.models.user import User


OTP_EXPIRATION_MINUTES = 10


def generate_otp(user: User, purpose: OTPPurpose, db: DBSession) -> str:
    """
    Genera un código OTP de 6 dígitos y lo almacena en la base de datos.
    Invalida cualquier código anterior del mismo usuario y propósito.
    Retorna el código en texto plano para ser enviado al correo.
    """
    # Invalida los códigos anteriores del mismo tipo para evitar duplicados activos
    existing_codes = (
        db.query(OTPCode)
        .filter(
            OTPCode.user_id == user.id,
            OTPCode.purpose == purpose,
            OTPCode.used.is_(False),
        )
        .all()
    )
    for code in existing_codes:
        code.used = True

    # Genera el nuevo código de 6 dígitos
    code_value = "".join(random.choices(string.digits, k=6))
    expiration = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRATION_MINUTES)

    otp_record = OTPCode(
        user_id=user.id,
        code=code_value,
        purpose=purpose,
        expires_at=expiration,
    )
    db.add(otp_record)
    db.commit()

    return code_value


def verify_otp(user: User, code: str, purpose: OTPPurpose, db: DBSession) -> None:
    """
    Valida el código OTP proporcionado por el usuario.
    Lanza HTTPException 400 si el código es inválido, expirado o ya fue usado.
    Marca el código como usado tras una validación exitosa.
    """
    otp_record = (
        db.query(OTPCode)
        .filter(
            OTPCode.user_id == user.id,
            OTPCode.code == code,
            OTPCode.purpose == purpose,
            OTPCode.used.is_(False),
        )
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o ya utilizado.",
        )

    if otp_record.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código ha expirado. Solicite uno nuevo.",
        )

    # Marca el código como usado para que no pueda reutilizarse
    otp_record.used = True
    db.commit()
