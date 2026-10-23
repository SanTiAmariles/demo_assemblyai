"""Demo AssemblyAI: transcribe un audio en español y muestra hablantes y entidades.

Uso:
    pip install -U assemblyai
    set ASSEMBLYAI_API_KEY=tu_clave        (Windows)   |   export ASSEMBLYAI_API_KEY=tu_clave  (Mac/Linux)
    python demo_assemblyai.py audio.mp3
"""
import os
import sys

import assemblyai as aai

api_key = os.environ.get("ASSEMBLYAI_API_KEY")
if not api_key:
    sys.exit("Falta la variable de entorno ASSEMBLYAI_API_KEY.")
if len(sys.argv) < 2:
    sys.exit("Uso: python demo_assemblyai.py <archivo_de_audio>")

aai.settings.api_key = api_key

config = aai.TranscriptionConfig(
    speech_models=["universal-3-pro", "universal-2"],  # el primero que soporte el idioma
    language_code="es",
    speaker_labels=True,       # quién habló
    sentiment_analysis=False,  # no está disponible para este idioma
    entity_detection=True,     # nombres, fechas, lugares...
)

print("Transcribiendo...")
transcript = aai.Transcriber(config=config).transcribe(sys.argv[1])

if transcript.status == aai.TranscriptStatus.error:
    sys.exit(f"Error: {transcript.error}")

print("\n=== TEXTO COMPLETO ===")
print(transcript.text)

print("\n=== POR HABLANTE ===")
for u in transcript.utterances or []:
    print(f"Hablante {u.speaker}: {u.text}")

print("\n=== TONO POR FRASE ===")
print("No disponible para transcripciones en español.")

print("\n=== ENTIDADES ===")
for e in transcript.entities or []:
    print(f"{e.entity_type.value}: {e.text}")