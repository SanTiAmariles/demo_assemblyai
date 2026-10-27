import sys
from pathlib import Path
from types import SimpleNamespace

import assemblyai as aai
import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

AUDIO_PATH = ROOT / "audio.mp3"


def make_transcript(status=aai.TranscriptStatus.completed, error=None):
    return SimpleNamespace(
        id="tx_123",
        status=status,
        error=error,
        text="Hola, soy Ana de Bogotá. Mucho gusto, soy Luis.",
        audio_duration=12,
        utterances=[
            SimpleNamespace(speaker="A", text="Hola, soy Ana de Bogotá.", start=0, end=2500),
            SimpleNamespace(speaker="B", text="Mucho gusto, soy Luis.", start=2600, end=4800),
        ],
        entities=[
            SimpleNamespace(entity_type=aai.EntityType.person_name, text="Ana"),
            SimpleNamespace(entity_type=aai.EntityType.location, text="Bogotá"),
        ],
    )


@pytest.fixture
def fake_transcriber(monkeypatch):
    """Sustituye aai.Transcriber por uno que no llama a la red."""
    calls = {}

    class FakeTranscriber:
        result = make_transcript()

        def __init__(self, config=None):
            calls["config"] = config

        def transcribe(self, data):
            calls["data"] = data
            if isinstance(FakeTranscriber.result, Exception):
                raise FakeTranscriber.result
            return FakeTranscriber.result

    monkeypatch.setattr(aai, "Transcriber", FakeTranscriber)
    FakeTranscriber.calls = calls
    return FakeTranscriber


@pytest.fixture
def api_key(monkeypatch):
    monkeypatch.setenv("ASSEMBLYAI_API_KEY", "test-key")
