import assemblyai as aai
import pytest

import transcriber
from conftest import AUDIO_PATH, make_transcript


def test_config_spanish_with_speakers_and_entities():
    raw = transcriber.build_config().raw
    assert raw.language_code == "es"
    assert raw.speaker_labels is True
    assert raw.entity_detection is True
    assert raw.sentiment_analysis is False
    assert raw.speech_models == ["universal-3-pro", "universal-2"]


def test_configure_api_key_missing(monkeypatch):
    monkeypatch.delenv("ASSEMBLYAI_API_KEY", raising=False)
    with pytest.raises(transcriber.TranscriptionError, match="ASSEMBLYAI_API_KEY"):
        transcriber.configure_api_key()


def test_configure_api_key_from_env(api_key):
    transcriber.configure_api_key()
    assert aai.settings.api_key == "test-key"


def test_transcribe_missing_file(fake_transcriber):
    with pytest.raises(transcriber.TranscriptionError, match="No se encontró"):
        transcriber.transcribe("no_existe.mp3")
    assert "data" not in fake_transcriber.calls


def test_transcribe_file_returns_serializable_dict(fake_transcriber):
    result = transcriber.transcribe(AUDIO_PATH)
    assert fake_transcriber.calls["data"] == str(AUDIO_PATH)
    assert result["text"].startswith("Hola")
    assert result["utterances"][0] == {"speaker": "A", "text": "Hola, soy Ana de Bogotá.", "start": 0, "end": 2500}
    assert {"type": "location", "text": "Bogotá"} in result["entities"]


def test_transcribe_bytes_and_url_pass_through(fake_transcriber):
    transcriber.transcribe(b"\x00\x01")
    assert fake_transcriber.calls["data"] == b"\x00\x01"
    transcriber.transcribe("https://example.com/a.mp3")
    assert fake_transcriber.calls["data"] == "https://example.com/a.mp3"


def test_transcribe_error_status(fake_transcriber):
    fake_transcriber.result = make_transcript(status=aai.TranscriptStatus.error, error="audio inválido")
    with pytest.raises(transcriber.TranscriptionError, match="audio inválido"):
        transcriber.transcribe(AUDIO_PATH)


def test_transcribe_upload_failure(fake_transcriber):
    fake_transcriber.result = aai.types.TranscriptError("Failed to upload audio file: Invalid API key", 401)
    with pytest.raises(transcriber.TranscriptionError, match="Invalid API key"):
        transcriber.transcribe(AUDIO_PATH)


def test_to_dict_handles_missing_utterances_and_entities():
    t = make_transcript()
    t.utterances = None
    t.entities = None
    t.text = None
    result = transcriber.to_dict(t)
    assert result["utterances"] == [] and result["entities"] == [] and result["text"] == ""
