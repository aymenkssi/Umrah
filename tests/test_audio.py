import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

import analytics
import audio
import build_audio_catalog
import messages
import server

ADMIN = {"Authorization": "Bearer test-admin-token-1234567890"}
MP3 = b"ID3\x04\x00\x00\x00\x00\x00\x00" + b"\x00" * 200
M4A = b"\x00\x00\x00\x18ftypM4A " + b"\x00" * 200


@pytest.fixture
def client(monkeypatch, tmp_path):
    mock_db = AsyncMongoMockClient()["test_db"]
    for module in (analytics, messages, audio):
        monkeypatch.setattr(module, "db", mock_db)
    monkeypatch.setenv("ADMIN_TOKEN", "test-admin-token-1234567890")
    monkeypatch.setenv("MEDIA_DIR", str(tmp_path))
    audio.limiter.reset()
    with TestClient(server.app) as test_client:
        yield test_client


def upload(client, key, data, name="dua.mp3"):
    return client.post(f"/api/admin/audio/{key}", files={"file": (name, data, "audio/mpeg")}, headers=ADMIN)


def test_catalog_is_up_to_date():
    # Regenerate with: python backend/build_audio_catalog.py
    assert audio.CATALOG == build_audio_catalog.build()
    keys = [e["key"] for e in audio.CATALOG]
    assert len(keys) == len(set(keys))
    assert all(audio.KEY_RE.match(k) for k in keys)


def test_admin_requires_token(client):
    assert client.get("/api/admin/audio").status_code == 401
    assert client.post("/api/admin/audio/step-talbiyah", files={"file": ("a.mp3", MP3)}).status_code == 401


def test_upload_serve_replace_delete(client, tmp_path):
    first = upload(client, "step-talbiyah", MP3)
    assert first.status_code == 200
    url = first.json()["url"]

    manifest = client.get("/api/audio").json()["items"]
    assert manifest["step-talbiyah"]["url"] == url
    served = client.get(url)
    assert served.status_code == 200
    assert served.content == MP3
    assert "immutable" in served.headers["cache-control"]

    # Replacing creates a new versioned file and removes the old one.
    second = upload(client, "step-talbiyah", M4A, "dua.m4a")
    assert second.json()["url"] != url
    assert second.json()["format"] == "m4a"
    assert client.get(url).status_code == 404
    assert len(list(tmp_path.iterdir())) == 1

    listing = {e["key"]: e for e in client.get("/api/admin/audio", headers=ADMIN).json()}
    assert listing["step-talbiyah"]["audio"]["size"] == len(M4A)
    assert listing["step-ihram"]["audio"] is None

    assert client.delete("/api/admin/audio/step-talbiyah", headers=ADMIN).status_code == 204
    assert client.get("/api/audio").json()["items"] == {}
    assert list(tmp_path.iterdir()) == []


def test_rejects_unknown_keys_bad_formats_and_big_files(client, monkeypatch):
    assert upload(client, "not-a-dua", MP3).status_code == 404
    assert upload(client, "step-talbiyah", b"<html>not audio</html>").status_code == 415
    monkeypatch.setattr(audio, "MAX_BYTES", 100)
    assert upload(client, "step-talbiyah", MP3).status_code == 413


def test_file_names_are_validated(client):
    assert client.get("/api/audio/files/..%2F..%2Fetc%2Fpasswd").status_code == 404
    assert client.get("/api/audio/files/step-talbiyah-000000000000.mp3").status_code == 404
