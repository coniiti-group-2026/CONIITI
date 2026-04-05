# ============================================================
# Punto de Entrada - CONIITI API
# El monolito ya no expone autenticacion propia: auth-service
# es la unica fuente de verdad para login, registro y /me.
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import admin_stats, analytics, cms, documents, payments, users

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Fachada y back-office del ecosistema CONIITI. "
        "Expone modulos internos y valida JWTs emitidos por auth-service."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    root_path="/api",
)

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

app.include_router(users.router)
app.include_router(cms.router)
app.include_router(documents.router)
app.include_router(admin_stats.router)
app.include_router(payments.router)
app.include_router(analytics.router)


@app.get("/", tags=["Sistema"], summary="Estado del API")
def health_check():
    return {
        "status": "ok",
        "api": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }
