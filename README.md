# Demo de transcripción con AssemblyAI

Este demo transcribe un archivo de audio con AssemblyAI y muestra el texto, los hablantes detectados y las entidades reconocidas. Se puede usar desde la terminal o desde una interfaz web (React + Vite) que permite subir audios y exportar el resultado a Word o PDF.

## Estructura

| Archivo | Qué hace |
| --- | --- |
| `transcriber.py` | Lógica compartida: configuración y llamada a AssemblyAI |
| `demo_assemblyai.py` | Versión de terminal (CLI) |
| `server.py` | API FastAPI que usa la interfaz web (`POST /api/transcribe`) |
| `frontend/` | Interfaz web en React + Vite |
| `tests/` | Pruebas de Python (pytest) |

## Requisitos

- Python 3.11 o superior
- Node.js 20 o superior (solo para la interfaz web)
- Una API key de AssemblyAI

## Configurar la API key

1. Crea una cuenta gratuita en https://www.assemblyai.com/ y copia tu clave desde el panel (https://www.assemblyai.com/dashboard).
2. Copia `.env.example` como `.env` y pega la clave: `ASSEMBLYAI_API_KEY=tu_clave`. El servidor web lee este archivo en cada petición, así que no hace falta reiniciarlo. `.env` está en `.gitignore`.

También puedes usar una variable de entorno (necesaria para la CLI y la prueba de integración):

```powershell
$env:ASSEMBLYAI_API_KEY = "TU_API_KEY_DE_ASSEMBLYAI"
```

La variable configurada con `$env:` solo está disponible en esa ventana de PowerShell. No la escribas en el código ni la compartas. La interfaz web nunca recibe la clave: solo la usa el servidor.

## Uso desde la terminal

```powershell
python -m pip install -r requirements.txt
python demo_assemblyai.py audio.mp3
```

## Uso con la interfaz web

Necesitas dos ventanas de PowerShell.

**1. Backend** (en la carpeta del proyecto, con la API key configurada):

```powershell
python -m pip install -r requirements.txt
$env:ASSEMBLYAI_API_KEY = "TU_API_KEY_DE_ASSEMBLYAI"
python -m uvicorn server:app --reload --port 8000
```

**2. Frontend:**

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173, arrastra un audio (o haz clic para elegirlo) y pulsa **Transcribir audio**. El resultado aparece debajo en tres pestañas (por hablante, texto completo y entidades) con botones para copiar y exportar a Word o PDF.

## Pruebas

```powershell
# Python: unitarias del transcriptor, la CLI y la API (sin llamar a AssemblyAI)
python -m pip install -r requirements-dev.txt
python -m pytest

# Prueba de integración real con audio.mp3 (consume créditos de AssemblyAI)
$env:ASSEMBLYAI_API_KEY = "TU_API_KEY_DE_ASSEMBLYAI"
python -m pytest -m integration

# Frontend: formato, exportación Word/PDF y flujo de la interfaz
cd frontend
npm test
```

La prueba de integración se omite automáticamente si `ASSEMBLYAI_API_KEY` no está configurada.

## Notas

- El análisis de sentimiento está desactivado porque no está disponible para esta transcripción en español.
- El servidor acepta archivos de hasta 200 MB en formatos de audio comunes (mp3, wav, m4a, ogg, flac, aac, webm, mp4, opus).
