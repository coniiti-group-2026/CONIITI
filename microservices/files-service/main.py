import json
import os
import shutil
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
DATA_DIR = Path(os.getenv("FILES_DATA_DIR", str(UPLOAD_DIR / "_metadata")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

ASSETS_STORE = DATA_DIR / "assets.json"
DOCUMENTS_STORE = DATA_DIR / "documents.json"
CONTENT_CARDS_STORE = DATA_DIR / "content_cards.json"
STORE_LOCK = threading.Lock()

CONTENT_SECTIONS = {"memorias", "galerias", "comite", "conferencistas", "autores"}
DOCUMENT_CATEGORIES = {"sistema", "ponente"}

app = FastAPI(title="Files Service", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AssetRead(BaseModel):
    id: str
    filename: str
    original_name: str
    url: str
    content_type: str | None = None
    size_bytes: int = 0
    created_at: str


class DocumentCreate(BaseModel):
    titulo: str
    descripcion: str | None = None
    category: Literal["sistema", "ponente"]
    ponente_nombre: str | None = None
    session_id: str | None = None
    file_url: str
    asset_id: str | None = None
    original_name: str | None = None
    sort_order: int = 0


class DocumentRead(DocumentCreate):
    id: str
    created_at: str


class ContentCardCreate(BaseModel):
    section: str
    title: str
    subtitle: str | None = None
    year: int | None = None
    description: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class ContentCardRead(ContentCardCreate):
    id: str
    created_at: str
    updated_at: str


def build_public_download_url(request: Request, filename: str) -> str:
    forwarded_prefix = request.headers.get("x-forwarded-prefix", "").split(",", 1)[0].strip().rstrip("/")
    if not forwarded_prefix:
        forwarded_prefix = "/api/files"
    return f"{forwarded_prefix}/download/{filename}"


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_records(path: Path) -> list[dict]:
    if not path.exists():
        return []

    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError:
        return []

    return data if isinstance(data, list) else []


def _save_records(path: Path, records: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(records, handle, ensure_ascii=True, indent=2)


def _normalize_content_card(payload: ContentCardCreate) -> dict:
    if payload.section not in CONTENT_SECTIONS:
        raise HTTPException(status_code=422, detail="Seccion de contenido no soportada.")

    return {
        "section": payload.section,
        "title": payload.title.strip(),
        "subtitle": payload.subtitle.strip() if payload.subtitle else None,
        "year": payload.year,
        "description": payload.description.strip() if payload.description else None,
        "image_url": payload.image_url.strip() if payload.image_url else None,
        "link_url": payload.link_url.strip() if payload.link_url else None,
        "is_active": payload.is_active,
        "sort_order": payload.sort_order,
    }


def _normalize_document(payload: DocumentCreate) -> dict:
    if payload.category not in DOCUMENT_CATEGORIES:
        raise HTTPException(status_code=422, detail="Categoria de documento no soportada.")

    file_url = payload.file_url.strip()
    if not file_url:
        raise HTTPException(status_code=422, detail="file_url es obligatorio.")

    return {
        "titulo": payload.titulo.strip(),
        "descripcion": payload.descripcion.strip() if payload.descripcion else None,
        "category": payload.category,
        "ponente_nombre": payload.ponente_nombre.strip() if payload.ponente_nombre else None,
        "session_id": payload.session_id.strip() if payload.session_id else None,
        "file_url": file_url,
        "asset_id": payload.asset_id,
        "original_name": payload.original_name.strip() if payload.original_name else None,
        "sort_order": payload.sort_order,
    }


def _asset_path(filename: str) -> Path:
    safe_name = os.path.basename(filename)
    return UPLOAD_DIR / safe_name


def _find_asset_by_id(asset_id: str, assets: list[dict]) -> dict | None:
    return next((asset for asset in assets if asset["id"] == asset_id), None)


def _asset_is_referenced(asset: dict, documents: list[dict], cards: list[dict]) -> bool:
    asset_url = asset.get("url")

    for document in documents:
        if document.get("asset_id") == asset["id"] or document.get("file_url") == asset_url:
            return True

    for card in cards:
        if card.get("image_url") == asset_url or card.get("link_url") == asset_url:
            return True

    return False


def _delete_binary_file(filename: str) -> None:
    target = _asset_path(filename)
    if target.exists():
        target.unlink()


@app.get("/health")
def health_check():
    assets = _load_records(ASSETS_STORE)
    documents = _load_records(DOCUMENTS_STORE)
    cards = _load_records(CONTENT_CARDS_STORE)
    return {
        "status": "ok",
        "service": "files-service",
        "upload_dir": str(UPLOAD_DIR),
        "assets": len(assets),
        "documents": len(documents),
        "content_cards": len(cards),
    }


@app.get("/")
def root():
    return {"message": "files-service running"}


@app.post("/upload", response_model=AssetRead)
async def upload_file(request: Request, file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = _asset_path(unique_filename)

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Error guardando archivo.") from exc

    asset = {
        "id": str(uuid.uuid4()),
        "filename": unique_filename,
        "original_name": file.filename,
        "url": build_public_download_url(request, unique_filename),
        "content_type": file.content_type,
        "size_bytes": file_path.stat().st_size,
        "created_at": utcnow_iso(),
    }

    with STORE_LOCK:
        assets = _load_records(ASSETS_STORE)
        assets.insert(0, asset)
        _save_records(ASSETS_STORE, assets)

    return asset


@app.get("/assets", response_model=list[AssetRead])
def list_assets(limit: int = Query(default=50, ge=1, le=200)):
    assets = _load_records(ASSETS_STORE)
    return assets[:limit]


@app.delete("/assets/{asset_id}", status_code=204)
def delete_asset(asset_id: str):
    with STORE_LOCK:
        assets = _load_records(ASSETS_STORE)
        documents = _load_records(DOCUMENTS_STORE)
        cards = _load_records(CONTENT_CARDS_STORE)

        asset = _find_asset_by_id(asset_id, assets)
        if not asset:
            raise HTTPException(status_code=404, detail="Activo no encontrado.")

        if _asset_is_referenced(asset, documents, cards):
            raise HTTPException(
                status_code=409,
                detail="El archivo esta siendo utilizado por documentos o contenido CMS.",
            )

        _delete_binary_file(asset["filename"])
        assets = [item for item in assets if item["id"] != asset_id]
        _save_records(ASSETS_STORE, assets)


@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = _asset_path(filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado.")
    return FileResponse(file_path)


@app.get("/documents", response_model=list[DocumentRead])
def list_documents(
    category: str | None = Query(default=None),
    ponente_nombre: str | None = Query(default=None),
    session_id: str | None = Query(default=None),
):
    documents = _load_records(DOCUMENTS_STORE)

    if category:
        documents = [doc for doc in documents if doc.get("category") == category]
    if ponente_nombre:
        needle = ponente_nombre.strip().lower()
        documents = [
            doc for doc in documents if (doc.get("ponente_nombre") or "").strip().lower() == needle
        ]
    if session_id:
        documents = [doc for doc in documents if doc.get("session_id") == session_id]

    return sorted(documents, key=lambda doc: (doc.get("sort_order", 0), doc.get("created_at", "")))


@app.post("/documents", response_model=DocumentRead, status_code=201)
def create_document(payload: DocumentCreate):
    document = {
        "id": str(uuid.uuid4()),
        **_normalize_document(payload),
        "created_at": utcnow_iso(),
    }

    with STORE_LOCK:
        documents = _load_records(DOCUMENTS_STORE)
        if document["asset_id"]:
            assets = _load_records(ASSETS_STORE)
            if not _find_asset_by_id(document["asset_id"], assets):
                raise HTTPException(status_code=404, detail="El archivo subido no existe.")
        documents.insert(0, document)
        _save_records(DOCUMENTS_STORE, documents)

    return document


@app.delete("/documents/{document_id}", status_code=204)
def delete_document(document_id: str):
    with STORE_LOCK:
        documents = _load_records(DOCUMENTS_STORE)
        assets = _load_records(ASSETS_STORE)
        cards = _load_records(CONTENT_CARDS_STORE)

        document = next((item for item in documents if item["id"] == document_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Documento no encontrado.")

        documents = [item for item in documents if item["id"] != document_id]
        _save_records(DOCUMENTS_STORE, documents)

        asset_id = document.get("asset_id")
        if asset_id:
            asset = _find_asset_by_id(asset_id, assets)
            if asset and not _asset_is_referenced(asset, documents, cards):
                _delete_binary_file(asset["filename"])
                assets = [item for item in assets if item["id"] != asset_id]
                _save_records(ASSETS_STORE, assets)


@app.get("/content/cards/{section}", response_model=list[ContentCardRead])
def list_content_cards(section: str, active_only: bool = Query(default=True)):
    if section not in CONTENT_SECTIONS:
        raise HTTPException(status_code=404, detail="Seccion no encontrada.")

    cards = _load_records(CONTENT_CARDS_STORE)
    cards = [card for card in cards if card.get("section") == section]
    if active_only:
        cards = [card for card in cards if card.get("is_active", True)]

    return sorted(cards, key=lambda card: (card.get("sort_order", 0), card.get("created_at", "")))


@app.post("/content/cards", response_model=ContentCardRead, status_code=201)
def create_content_card(payload: ContentCardCreate):
    timestamp = utcnow_iso()
    card = {
        "id": str(uuid.uuid4()),
        **_normalize_content_card(payload),
        "created_at": timestamp,
        "updated_at": timestamp,
    }

    with STORE_LOCK:
        cards = _load_records(CONTENT_CARDS_STORE)
        cards.insert(0, card)
        _save_records(CONTENT_CARDS_STORE, cards)

    return card


@app.put("/content/cards/{card_id}", response_model=ContentCardRead)
def update_content_card(card_id: str, payload: ContentCardCreate):
    updates = _normalize_content_card(payload)

    with STORE_LOCK:
        cards = _load_records(CONTENT_CARDS_STORE)
        updated_card = None
        for index, card in enumerate(cards):
            if card["id"] != card_id:
                continue

            updated_card = {
                **card,
                **updates,
                "updated_at": utcnow_iso(),
            }
            cards[index] = updated_card
            break

        if not updated_card:
            raise HTTPException(status_code=404, detail="Tarjeta no encontrada.")

        _save_records(CONTENT_CARDS_STORE, cards)

    return updated_card


@app.delete("/content/cards/{card_id}", status_code=204)
def delete_content_card(card_id: str):
    with STORE_LOCK:
        cards = _load_records(CONTENT_CARDS_STORE)
        filtered = [card for card in cards if card["id"] != card_id]
        if len(filtered) == len(cards):
            raise HTTPException(status_code=404, detail="Tarjeta no encontrada.")
        _save_records(CONTENT_CARDS_STORE, filtered)
