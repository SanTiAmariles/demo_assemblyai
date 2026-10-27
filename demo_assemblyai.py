"""Demo AssemblyAI: transcribe un audio en español y muestra hablantes y entidades.

Uso:
    pip install -r requirements.txt
    $env:ASSEMBLYAI_API_KEY = "tu_clave"   (PowerShell)   |   export ASSEMBLYAI_API_KEY=tu_clave  (Mac/Linux)
    python demo_assemblyai.py audio.mp3
"""
import sys

from transcriber import TranscriptionError, configure_api_key, transcribe


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        sys.exit("Uso: python demo_assemblyai.py <archivo_de_audio>")

    try:
        configure_api_key()
        print("Transcribiendo...")
        result = transcribe(argv[1])
    except TranscriptionError as e:
        sys.exit(f"Error: {e}")

    print("\n=== TEXTO COMPLETO ===")
    print(result["text"])

    print("\n=== POR HABLANTE ===")
    for u in result["utterances"]:
        print(f"Hablante {u['speaker']}: {u['text']}")

    print("\n=== TONO POR FRASE ===")
    print("No disponible para transcripciones en español.")

    print("\n=== ENTIDADES ===")
    for e in result["entities"]:
        print(f"{e['type']}: {e['text']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
