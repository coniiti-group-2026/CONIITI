# ============================================================
# Esquemas de Autenticación — CONIITI API
# Define los contratos de entrada/salida para los endpoints
# relacionados con login, registro y verificación OTP.
# Utiliza Pydantic para validación automática.
# ============================================================

from pydantic import BaseModel, EmailStr, Field
from app.models.otp import OTPPurpose
from typing import Union


class RegisterRequest(BaseModel):
    """Datos requeridos para registrar un nuevo usuario."""
    full_name: str = Field(..., min_length=2, max_length=255, examples=["Juan Pérez"])
    email: EmailStr = Field(..., examples=["juan@ejemplo.com"])
    institution: str | None = Field(None, max_length=255, examples=["Universidad XYZ"])
    role: str = Field("external", examples=["external", "student"])
    password: str = Field(..., min_length=8, examples=["MiContraseña123"])
    accept_data_policy: bool = Field(
        ..., description="El usuario debe aceptar la política de datos para registrarse."
    )


class LoginRequest(BaseModel):
    """Datos requeridos para iniciar sesión con email y contraseña local."""
    email: EmailStr = Field(..., examples=["juan@ejemplo.com"])
    password: str = Field(..., examples=["MiContraseña123"])


class OTPVerifyRequest(BaseModel):
    """Datos para verificar un código OTP de 6 dígitos."""
    email: EmailStr = Field(..., examples=["juan@ejemplo.com"])
    code: str = Field(..., min_length=6, max_length=6, examples=["123456"])
    purpose: OTPPurpose = Field(..., examples=["register", "login"])


class TokenResponse(BaseModel):
    """
    Respuesta al autenticarse exitosamente.
    Los tokens se envían como cookies HttpOnly, no en el cuerpo.
    Este esquema solo confirma que el login fue exitoso.
    """
    message: str = "Autenticación exitosa."
    requires_otp: bool = False


class MessageResponse(BaseModel):
    """Respuesta genérica de éxito con un mensaje descriptivo."""
    message: str
    requires_otp: bool = True


class ForgotPasswordRequest(BaseModel):
    """Datos para solicitar el restablecimiento de contraseña."""
    email: EmailStr = Field(..., examples=["juan@ejemplo.com"])


class ResetPasswordRequest(BaseModel):
    """Datos para restablecer la contraseña con el código OTP recibido."""
    email: EmailStr = Field(..., examples=["juan@ejemplo.com"])
    code: str = Field(..., min_length=6, max_length=6, examples=["123456"])
    new_password: str = Field(..., min_length=8, examples=["NuevaContraseña123"])
