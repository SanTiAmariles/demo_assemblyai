"""Prueba real contra AssemblyAI con audio.mp3. Se omite si no hay API key.

    $env:ASSEMBLYAI_API_KEY = "..."; python -m pytest -m integration
"""
import os

import pytest

import transcriber
from conftest import AUDIO_PATH

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not os.environ.get("ASSEMBLYAI_API_KEY"), reason="ASSEMBLYAI_API_KEY no configurada"),
]


def test_transcribe_demo_audio():
    transcriber.configure_api_key()
    result = transcriber.transcribe(AUDIO_PATH)
    assert result["text"].strip()
    assert result["utterances"], "se esperaba al menos un hablante"
    assert all(u["speaker"] for u in result["utterances"])
