# ============================================================
# Punto de Entrada — CONIITI API
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, oauth, users, sessions, cms, notifications, payments, analytics

# ==============================================================
# Sección: Creación de la aplicación
# ==============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "API REST para la gestión del XI Congreso Internacional de Innovación "
        "y Tendencias en Ingeniería — CONIITI 2026. "
        "Incluye autenticación JWT con cookies HttpOnly, OAuth (Microsoft y Google), "
        "verificación en dos pasos (OTP por correo) y gestión de sesiones del congreso."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",

    # 🔥 🔥 🔥 ESTA ES LA LÍNEA IMPORTANTE
    root_path="/api"
)

# ==============================================================
# Sección: Middlewares
# ==============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================
# Sección: Registro de routers
# ==============================================================

app.include_router(auth.router)
app.include_router(oauth.router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(cms.router)
app.include_router(notifications.router)
app.include_router(payments.router)
app.include_router(analytics.router)

# ==============================================================
# Sección: Endpoints de sistema
# ==============================================================

@app.get("/", tags=["Sistema"], summary="Estado del API")
def health_check():
    return {
        "status": "ok",
        "api": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }