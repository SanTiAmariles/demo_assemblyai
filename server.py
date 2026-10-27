"""API HTTP para el frontend: recibe un audio y devuelve la transcripción.

Uso:
    uvicorn server:app --reload --port 8000
"""
import os
from pathlib import Path

from dotenv import dotenv_values
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool

from transcriber import TranscriptionError, configure_api_key, transcribe

MAX_UPLOAD_BYTES = 200 * 1024 * 1024
ALLOWED_PREFIXES = ("audio/", "video/")
ALLOWED_EXTENSIONS = (".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".webm", ".mp4", ".opus")
ENV_FILE = Path(__file__).with_name(".env")


def get_api_key() -> str | None:
    """Variable de entorno o, si no existe, el archivo .env (releído en cada petición)."""
    return os.environ.get("ASSEMBLYAI_API_KEY") or dotenv_values(ENV_FILE).get("ASSEMBLYAI_API_KEY") or None

app = FastAPI(title="Demo AssemblyAI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "api_key_configured": bool(get_api_key())}


@app.post("/api/transcribe")
async def transcribe_upload(file: UploadFile):
    name = (file.filename or "").lower()
    if not (name.endswith(ALLOWED_EXTENSIONS) or (file.content_type or "").startswith(ALLOWED_PREFIXES)):
        raise HTTPException(415, "Formato no soportado. Sube un archivo de audio (mp3, wav, m4a...).")

    data = await file.read()
    if not data:
        raise HTTPException(400, "El archivo está vacío.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "El archivo supera el límite de 200 MB.")

    try:
        configure_api_key(get_api_key())
        result = await run_in_threadpool(transcribe, data)
    except TranscriptionError as e:
        raise HTTPException(502, str(e))

    result["filename"] = file.filename
    return result
