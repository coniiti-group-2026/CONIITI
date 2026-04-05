import shutil
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, Request, UploadFile

from file_schemas import ContentCardCreate, DocumentCreate
from file_storage import (
    FilesStorageConfig,
    JsonRecordStore,
    LocalBinaryStorage,
    build_storage_config,
)


class FilesApplicationService:
    def __init__(
        self,
        config: FilesStorageConfig,
        record_store: JsonRecordStore,
        binary_storage: LocalBinaryStorage,
        *,
        store_lock=None,
    ):
        self._config = config
        self._record_store = record_store
        self._binary_storage = binary_storage
        self._store_lock = store_lock or threading.Lock()

    def _utcnow_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _build_public_download_url(self, request: Request, filename: str) -> str:
        forwarded_prefix = request.headers.get("x-forwarded-prefix", "").split(",", 1)[0].strip().rstrip("/")
        if not forwarded_prefix:
            forwarded_prefix = "/api/files"
        return f"{forwarded_prefix}/download/{filename}"

    def _load_assets(self) -> list[dict]:
        return self._record_store.load_records(self._config.assets_store)

    def _save_assets(self, records: list[dict]) -> None:
        self._record_store.save_records(self._config.assets_store, records)

    def _load_documents(self) -> list[dict]:
        return self._record_store.load_records(self._config.documents_store)

    def _save_documents(self, records: list[dict]) -> None:
        self._record_store.save_records(self._config.documents_store, records)

    def _load_content_cards(self) -> list[dict]:
        return self._record_store.load_records(self._config.content_cards_store)

    def _save_content_cards(self, records: list[dict]) -> None:
        self._record_store.save_records(self._config.content_cards_store, records)

    def _normalize_content_card(self, payload: ContentCardCreate) -> dict:
        if payload.section not in self._config.content_sections:
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

    def _normalize_document(self, payload: DocumentCreate) -> dict:
        if payload.category not in self._config.document_categories:
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

    def _find_asset_by_id(self, asset_id: str, assets: list[dict]) -> dict | None:
        return next((asset for asset in assets if asset["id"] == asset_id), None)

    def _asset_is_referenced(self, asset: dict, documents: list[dict], cards: list[dict]) -> bool:
        asset_url = asset.get("url")

        for document in documents:
            if document.get("asset_id") == asset["id"] or document.get("file_url") == asset_url:
                return True

        for card in cards:
            if card.get("image_url") == asset_url or card.get("link_url") == asset_url:
                return True

        return False

    def health_summary(self) -> dict[str, str | int]:
        assets = self._load_assets()
        documents = self._load_documents()
        cards = self._load_content_cards()
        return {
            "status": "ok",
            "service": "files-service",
            "upload_dir": str(self._config.upload_dir),
            "assets": len(assets),
            "documents": len(documents),
            "content_cards": len(cards),
        }

    async def upload_file(self, request: Request, file: UploadFile) -> dict:
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = self._binary_storage.resolve_path(unique_filename)

        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Error guardando archivo.") from exc

        asset = {
            "id": str(uuid.uuid4()),
            "filename": unique_filename,
            "original_name": file.filename,
            "url": self._build_public_download_url(request, unique_filename),
            "content_type": file.content_type,
            "size_bytes": file_path.stat().st_size,
            "created_at": self._utcnow_iso(),
        }

        with self._store_lock:
            assets = self._load_assets()
            assets.insert(0, asset)
            self._save_assets(assets)

        return asset

    def list_assets(self, limit: int) -> list[dict]:
        assets = self._load_assets()
        return assets[:limit]

    def delete_asset(self, asset_id: str) -> None:
        with self._store_lock:
            assets = self._load_assets()
            documents = self._load_documents()
            cards = self._load_content_cards()

            asset = self._find_asset_by_id(asset_id, assets)
            if not asset:
                raise HTTPException(status_code=404, detail="Activo no encontrado.")

            if self._asset_is_referenced(asset, documents, cards):
                raise HTTPException(
                    status_code=409,
                    detail="El archivo esta siendo utilizado por documentos o contenido CMS.",
                )

            self._binary_storage.delete(asset["filename"])
            assets = [item for item in assets if item["id"] != asset_id]
            self._save_assets(assets)

    def get_download_path(self, filename: str) -> Path:
        file_path = self._binary_storage.resolve_path(filename)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado.")
        return file_path

    def list_documents(
        self,
        *,
        category: str | None,
        ponente_nombre: str | None,
        session_id: str | None,
    ) -> list[dict]:
        documents = self._load_documents()

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

    def create_document(self, payload: DocumentCreate) -> dict:
        document = {
            "id": str(uuid.uuid4()),
            **self._normalize_document(payload),
            "created_at": self._utcnow_iso(),
        }

        with self._store_lock:
            documents = self._load_documents()
            if document["asset_id"]:
                assets = self._load_assets()
                if not self._find_asset_by_id(document["asset_id"], assets):
                    raise HTTPException(status_code=404, detail="El archivo subido no existe.")
            documents.insert(0, document)
            self._save_documents(documents)

        return document

    def delete_document(self, document_id: str) -> None:
        with self._store_lock:
            documents = self._load_documents()
            assets = self._load_assets()
            cards = self._load_content_cards()

            document = next((item for item in documents if item["id"] == document_id), None)
            if not document:
                raise HTTPException(status_code=404, detail="Documento no encontrado.")

            documents = [item for item in documents if item["id"] != document_id]
            self._save_documents(documents)

            asset_id = document.get("asset_id")
            if asset_id:
                asset = self._find_asset_by_id(asset_id, assets)
                if asset and not self._asset_is_referenced(asset, documents, cards):
                    self._binary_storage.delete(asset["filename"])
                    assets = [item for item in assets if item["id"] != asset_id]
                    self._save_assets(assets)

    def list_content_cards(self, section: str, active_only: bool) -> list[dict]:
        if section not in self._config.content_sections:
            raise HTTPException(status_code=404, detail="Seccion no encontrada.")

        cards = self._load_content_cards()
        cards = [card for card in cards if card.get("section") == section]
        if active_only:
            cards = [card for card in cards if card.get("is_active", True)]

        return sorted(cards, key=lambda card: (card.get("sort_order", 0), card.get("created_at", "")))

    def create_content_card(self, payload: ContentCardCreate) -> dict:
        timestamp = self._utcnow_iso()
        card = {
            "id": str(uuid.uuid4()),
            **self._normalize_content_card(payload),
            "created_at": timestamp,
            "updated_at": timestamp,
        }

        with self._store_lock:
            cards = self._load_content_cards()
            cards.insert(0, card)
            self._save_content_cards(cards)

        return card

    def update_content_card(self, card_id: str, payload: ContentCardCreate) -> dict:
        updates = self._normalize_content_card(payload)

        with self._store_lock:
            cards = self._load_content_cards()
            updated_card = None
            for index, card in enumerate(cards):
                if card["id"] != card_id:
                    continue

                updated_card = {
                    **card,
                    **updates,
                    "updated_at": self._utcnow_iso(),
                }
                cards[index] = updated_card
                break

            if not updated_card:
                raise HTTPException(status_code=404, detail="Tarjeta no encontrada.")

            self._save_content_cards(cards)

        return updated_card

    def delete_content_card(self, card_id: str) -> None:
        with self._store_lock:
            cards = self._load_content_cards()
            filtered = [card for card in cards if card["id"] != card_id]
            if len(filtered) == len(cards):
                raise HTTPException(status_code=404, detail="Tarjeta no encontrada.")
            self._save_content_cards(filtered)


def build_default_files_service() -> FilesApplicationService:
    config = build_storage_config()
    return FilesApplicationService(
        config=config,
        record_store=JsonRecordStore(),
        binary_storage=LocalBinaryStorage(config.upload_dir),
    )
