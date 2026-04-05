from fastapi import FastAPI, File, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from file_schemas import (
    AssetRead,
    ContentCardCreate,
    ContentCardRead,
    DocumentCreate,
    DocumentRead,
)
from file_service import build_default_files_service


files_service = build_default_files_service()

app = FastAPI(title="Files Service", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return files_service.health_summary()


@app.get("/")
def root():
    return {"message": "files-service running"}


@app.post("/upload", response_model=AssetRead)
async def upload_file(request: Request, file: UploadFile = File(...)):
    return await files_service.upload_file(request, file)


@app.get("/assets", response_model=list[AssetRead])
def list_assets(limit: int = Query(default=50, ge=1, le=200)):
    return files_service.list_assets(limit)


@app.delete("/assets/{asset_id}", status_code=204)
def delete_asset(asset_id: str):
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
def create_document(payload: DocumentCreate):
    return files_service.create_document(payload)


@app.delete("/documents/{document_id}", status_code=204)
def delete_document(document_id: str):
    files_service.delete_document(document_id)


@app.get("/content/cards/{section}", response_model=list[ContentCardRead])
def list_content_cards(section: str, active_only: bool = Query(default=True)):
    return files_service.list_content_cards(section, active_only)


@app.post("/content/cards", response_model=ContentCardRead, status_code=201)
def create_content_card(payload: ContentCardCreate):
    return files_service.create_content_card(payload)


@app.put("/content/cards/{card_id}", response_model=ContentCardRead)
def update_content_card(card_id: str, payload: ContentCardCreate):
    return files_service.update_content_card(card_id, payload)


@app.delete("/content/cards/{card_id}", status_code=204)
def delete_content_card(card_id: str):
    files_service.delete_content_card(card_id)
