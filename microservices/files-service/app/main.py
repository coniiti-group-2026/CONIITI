import json
import logging
import time
import uuid

from fastapi import Depends, FastAPI, File, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.schemas.file_schemas import (
    AssetRead,
    ContentCardCreate,
    ContentCardRead,
    DocumentCreate,
    DocumentRead,
)
from app.services.file_service import build_default_files_service
from app.utils.security import AuthenticatedUser, require_files_manager


files_service = build_default_files_service()

app = FastAPI(title="Files Service", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(message)s")
access_logger = logging.getLogger("coniiti.access")


@app.middleware("http")
async def structured_access_log(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        access_logger.exception(json.dumps({
            "service": "files-service",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": 500,
            "duration_ms": duration_ms,
            "error": str(exc),
        }))
        raise

    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    response.headers["x-request-id"] = request_id
    access_logger.info(json.dumps({
        "service": "files-service",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration_ms,
    }))
    return response


@app.get("/health")
def health_check():
    return files_service.health_summary()


@app.get("/")
def root():
    return {"message": "files-service running"}


@app.post("/upload", response_model=AssetRead)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    _: AuthenticatedUser = Depends(require_files_manager),
):
    return await files_service.upload_file(request, file)


@app.get("/assets", response_model=list[AssetRead])
def list_assets(limit: int = Query(default=50, ge=1, le=200)):
    return files_service.list_assets(limit)


@app.delete("/assets/{asset_id}", status_code=204)
def delete_asset(
    asset_id: str,
    _: AuthenticatedUser = Depends(require_files_manager),
):
    files_service.delete_asset(asset_id)


@app.get("/download/{filename}")
async def download_file(filename: str):
    return FileResponse(files_service.get_download_path(filename))


@app.get("/documents", response_model=list[DocumentRead])
def list_documents(
    category: str | None = Query(default=None),
    ponente_nombre: str | None = Query(default=None),
    session_id: str | None = Query(default=None),
):
    return files_service.list_documents(
        category=category,
        ponente_nombre=ponente_nombre,
        session_id=session_id,
    )


@app.post("/documents", response_model=DocumentRead, status_code=201)
def create_document(
    payload: DocumentCreate,
    _: AuthenticatedUser = Depends(require_files_manager),
):
    return files_service.create_document(payload)


@app.delete("/documents/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    _: AuthenticatedUser = Depends(require_files_manager),
):
    files_service.delete_document(document_id)


@app.get("/content/cards/{section}", response_model=list[ContentCardRead])
def list_content_cards(section: str, active_only: bool = Query(default=True)):
    return files_service.list_content_cards(section, active_only)


@app.post("/content/cards", response_model=ContentCardRead, status_code=201)
def create_content_card(
    payload: ContentCardCreate,
    _: AuthenticatedUser = Depends(require_files_manager),
):
    return files_service.create_content_card(payload)


@app.put("/content/cards/{card_id}", response_model=ContentCardRead)
def update_content_card(
    card_id: str,
    payload: ContentCardCreate,
    _: AuthenticatedUser = Depends(require_files_manager),
):
    return files_service.update_content_card(card_id, payload)


@app.delete("/content/cards/{card_id}", status_code=204)
def delete_content_card(
    card_id: str,
    _: AuthenticatedUser = Depends(require_files_manager),
):
    files_service.delete_content_card(card_id)
