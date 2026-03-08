# ============================================================
# Servicio OAuth — CONIITI API
# Responsabilidad única (SRP): gestiona el flujo de autenticación
# externa con Microsoft (Azure AD) y Google.
# Independiente del router para facilitar pruebas unitarias.
# ============================================================

import httpx
from urllib.parse import urlencode

from app.core.config import settings


# ==============================================================
# Sección: Microsoft OAuth (Azure AD)
# ==============================================================

MICROSOFT_AUTH_URL = (
    f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize"
)
MICROSOFT_TOKEN_URL = (
    f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token"
)
MICROSOFT_GRAPH_ME_URL = "https://graph.microsoft.com/v1.0/me"


def get_microsoft_authorization_url(state: str) -> str:
    """
    Construye la URL de redirección hacia el proveedor de identidad de Microsoft.
    El parámetro 'state' previene ataques CSRF durante el flujo OAuth.
    """
    params = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "scope": "openid email profile User.Read",
        "response_mode": "query",
        "state": state,
    }
    return f"{MICROSOFT_AUTH_URL}?{urlencode(params)}"


async def exchange_microsoft_code(code: str) -> dict:
    """
    Intercambia el código de autorización de Microsoft por un access token.
    Retorna el payload del token incluido el email del usuario.
    """
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            MICROSOFT_TOKEN_URL,
            data={
                "client_id": settings.MICROSOFT_CLIENT_ID,
                "client_secret": settings.MICROSOFT_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        token_data = token_response.json()

        # Obtiene el perfil del usuario desde Microsoft Graph
        user_response = await client.get(
            MICROSOFT_GRAPH_ME_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        user_response.raise_for_status()
        user_data = user_response.json()

    return {
        "email": user_data.get("mail") or user_data.get("userPrincipalName", ""),
        "full_name": user_data.get("displayName", ""),
    }


# ==============================================================
# Sección: Google OAuth
# ==============================================================

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"


def get_google_authorization_url(state: str) -> str:
    """
    Construye la URL de redirección hacia el proveedor de identidad de Google.
    El parámetro 'state' previene ataques CSRF durante el flujo OAuth.
    """
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "online",
        "state": state,
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def exchange_google_code(code: str) -> dict:
    """
    Intercambia el código de autorización de Google por un access token.
    Retorna el email y nombre del usuario autenticado.
    """
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        token_data = token_response.json()

        # Obtiene el perfil del usuario desde la API de Google
        user_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        user_response.raise_for_status()
        user_data = user_response.json()

    return {
        "email": user_data.get("email", ""),
        "full_name": user_data.get("name", ""),
    }
