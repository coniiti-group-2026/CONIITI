import os
import shutil
import uuid

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse


UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Files Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_public_download_url(request: Request, filename: str) -> str:
    forwarded_prefix = request.headers.get("x-forwarded-prefix", "").split(",", 1)[0].strip().rstrip("/")
    if not forwarded_prefix:
        forwarded_prefix = "/api/files"
    return f"{forwarded_prefix}/download/{filename}"


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "files-service", "upload_dir": UPLOAD_DIR}


@app.get("/")
def root():
    return {"message": "files-service running"}


@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Error guardando archivo") from exc

    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": build_public_download_url(request, unique_filename),
    }


@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(file_path)
