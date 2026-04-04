from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import uuid

# Aseguramos que el directorio de uploads exista (Volumen en Docker)
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

# Health check accesible en /api/files/health (a través de Traefik)
@app.get("/api/files/health")
def health_check():
    return {"status": "ok", "service": "files"}

@app.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)):
    """Sube un archivo y lo guarda en el disco local/volumen."""
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Error guardando archivo")
        
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": f"/api/files/download/{unique_filename}"
    }

@app.get("/api/files/download/{filename}")
async def download_file(filename: str):
    """Descarga un archivo previamente subido."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(file_path)

