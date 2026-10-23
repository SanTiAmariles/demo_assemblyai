# Demo de transcripción con AssemblyAI

Este demo transcribe un archivo de audio con AssemblyAI y muestra el texto, los hablantes detectados y las entidades reconocidas.

## Requisitos

- Python 3.11 o superior
- Una API key de AssemblyAI
- Un archivo de audio compatible, por ejemplo `audio.mp3`

## Instalación y ejecución en Windows (PowerShell)

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
python -m pip install --upgrade assemblyai
$env:ASSEMBLYAI_API_KEY = "TU_API_KEY_DE_ASSEMBLYAI"
python demo_assemblyai.py audio.mp3
```

Reemplaza `TU_API_KEY_DE_ASSEMBLYAI` por tu API key. La variable configurada con `$env:` solo estará disponible en esa ventana de PowerShell. No publiques ni compartas tu API key.

Coloca `audio.mp3` en la misma carpeta que `demo_assemblyai.py`, o reemplaza `audio.mp3` en el comando por la ruta al archivo:

```powershell
python demo_assemblyai.py "C:\ruta\al\audio.mp3"
```

## Notas

- El análisis de sentimiento está desactivado porque no está disponible para esta transcripción en español.
- El script solicita la API key mediante la variable de entorno `ASSEMBLYAI_API_KEY`; no la escribas directamente en el código.
