"""Lógica compartida de transcripción con AssemblyAI (usada por la CLI y el servidor)."""
import os

import assemblyai as aai


class TranscriptionError(Exception):
    """Error devuelto por AssemblyAI o por una configuración inválida."""


def build_config() -> aai.TranscriptionConfig:
    return aai.TranscriptionConfig(
        speech_models=["universal-3-pro", "universal-2"],  # el primero que soporte el idioma
        language_code="es",
        speaker_labels=True,       # quién habló
        sentiment_analysis=False,  # no está disponible para este idioma
        entity_detection=True,     # nombres, fechas, lugares...
    )


def configure_api_key(api_key: str | None = None) -> None:
    key = api_key or os.environ.get("ASSEMBLYAI_API_KEY")
    if not key:
        raise TranscriptionError("Falta la variable de entorno ASSEMBLYAI_API_KEY.")
    aai.settings.api_key = key


def transcribe(audio) -> dict:
    """Transcribe una ruta, URL o stream binario y devuelve un dict serializable."""
    if isinstance(audio, (str, os.PathLike)) and not str(audio).startswith(("http://", "https://")):
        if not os.path.isfile(audio):
            raise TranscriptionError(f"No se encontró el archivo: {audio}")
        audio = str(audio)

    try:
        transcript = aai.Transcriber(config=build_config()).transcribe(audio)
    except aai.types.TranscriptError as e:  # p. ej. fallo al subir o API key inválida
        raise TranscriptionError(str(e)) from e
    if transcript.status == aai.TranscriptStatus.error:
        raise TranscriptionError(transcript.error or "Error desconocido en AssemblyAI.")
    return to_dict(transcript)


def to_dict(transcript) -> dict:
    return {
        "id": transcript.id,
        "text": transcript.text or "",
        "audio_duration": transcript.audio_duration,
        "utterances": [
            {"speaker": u.speaker, "text": u.text, "start": u.start, "end": u.end}
            for u in transcript.utterances or []
        ],
        "entities": [
            {"type": e.entity_type.value, "text": e.text}
            for e in transcript.entities or []
        ],
    }
