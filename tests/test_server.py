import assemblyai as aai
import pytest
from fastapi.testclient import TestClient

from conftest import AUDIO_PATH, make_transcript
import server
from server import app

client = TestClient(app)


def upload(name="audio.mp3", data=None, content_type="audio/mpeg"):
    data = AUDIO_PATH.read_bytes() if data is None else data
    return client.post("/api/transcribe", files={"file": (name, data, content_type)})


def test_health_reports_key(api_key):
    assert client.get("/api/health").json() == {"status": "ok", "api_key_configured": True}


def test_transcribe_success(api_key, fake_transcriber):
    res = upload()
    assert res.status_code == 200
    body = res.json()
    assert body["filename"] == "audio.mp3"
    assert len(body["utterances"]) == 2
    assert fake_transcriber.calls["data"] == AUDIO_PATH.read_bytes()


def test_rejects_non_audio(api_key, fake_transcriber):
    res = upload(name="notas.txt", data=b"hola", content_type="text/plain")
    assert res.status_code == 415


def test_rejects_empty_file(api_key, fake_transcriber):
    assert upload(data=b"").status_code == 400


def test_missing_api_key(monkeypatch, tmp_path, fake_transcriber):
    monkeypatch.delenv("ASSEMBLYAI_API_KEY", raising=False)
    monkeypatch.setattr(server, "ENV_FILE", tmp_path / ".env")
    res = upload()
    assert res.status_code == 502
    assert "ASSEMBLYAI_API_KEY" in res.json()["detail"]


def test_api_key_from_env_file(monkeypatch, tmp_path, fake_transcriber):
    monkeypatch.delenv("ASSEMBLYAI_API_KEY", raising=False)
    env = tmp_path / ".env"
    env.write_text("ASSEMBLYAI_API_KEY=clave-del-archivo\n")
    monkeypatch.setattr(server, "ENV_FILE", env)
    assert client.get("/api/health").json()["api_key_configured"] is True
    assert upload().status_code == 200
    assert aai.settings.api_key == "clave-del-archivo"


def test_assemblyai_error_is_502(api_key, fake_transcriber):
    fake_transcriber.result = make_transcript(status=aai.TranscriptStatus.error, error="formato no válido")
    res = upload()
    assert res.status_code == 502
    assert res.json()["detail"] == "formato no válido"


@pytest.mark.parametrize("name", ["voz.WAV", "nota.m4a", "clip.ogg"])
def test_accepts_extensions_even_without_mime(api_key, fake_transcriber, name):
    assert upload(name=name, content_type="application/octet-stream").status_code == 200
