import assemblyai as aai
import pytest

import demo_assemblyai
from conftest import AUDIO_PATH, make_transcript


def test_usage_without_args(api_key):
    with pytest.raises(SystemExit, match="Uso:"):
        demo_assemblyai.main(["demo_assemblyai.py"])


def test_missing_api_key(monkeypatch):
    monkeypatch.delenv("ASSEMBLYAI_API_KEY", raising=False)
    with pytest.raises(SystemExit, match="ASSEMBLYAI_API_KEY"):
        demo_assemblyai.main(["demo_assemblyai.py", str(AUDIO_PATH)])


def test_prints_all_sections(api_key, fake_transcriber, capsys):
    assert demo_assemblyai.main(["demo_assemblyai.py", str(AUDIO_PATH)]) == 0
    out = capsys.readouterr().out
    for section in ("TEXTO COMPLETO", "POR HABLANTE", "TONO POR FRASE", "ENTIDADES"):
        assert f"=== {section} ===" in out
    assert "Hablante A: Hola, soy Ana de Bogotá." in out
    assert "Hablante B: Mucho gusto, soy Luis." in out
    assert "person_name: Ana" in out
    assert "location: Bogotá" in out


def test_transcript_error_exits(api_key, fake_transcriber):
    fake_transcriber.result = make_transcript(status=aai.TranscriptStatus.error, error="boom")
    with pytest.raises(SystemExit, match="Error: boom"):
        demo_assemblyai.main(["demo_assemblyai.py", str(AUDIO_PATH)])
