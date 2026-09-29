from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

import analytics
import messages
import server

ADMIN = {"Authorization": "Bearer test-admin-token-1234567890"}


@pytest.fixture
def client(monkeypatch):
    mock_db = AsyncMongoMockClient()["test_db"]
    monkeypatch.setattr(analytics, "db", mock_db)
    monkeypatch.setattr(messages, "db", mock_db)
    monkeypatch.setenv("ADMIN_TOKEN", "test-admin-token-1234567890")
    messages.limiter.reset()
    with TestClient(server.app) as test_client:
        yield test_client


def message(**overrides):
    body = {
        "title": {"fr": "Affluence", "en": "Crowds", "ar": ""},
        "body": {"fr": "Venez tôt", "en": "Come early", "ar": ""},
        "kind": "warning",
    }
    body.update(overrides)
    return body


def test_admin_crud_requires_token(client):
    assert client.get("/api/admin/messages").status_code == 401
    assert client.post("/api/admin/messages", json=message()).status_code == 401


def test_create_update_delete(client):
    created = client.post("/api/admin/messages", json=message(), headers=ADMIN)
    assert created.status_code == 201
    msg_id = created.json()["id"]

    updated = client.put(f"/api/admin/messages/{msg_id}", json=message(kind="tip"), headers=ADMIN)
    assert updated.json()["kind"] == "tip"

    listed = client.get("/api/admin/messages", headers=ADMIN).json()
    assert [m["id"] for m in listed] == [msg_id]
    assert listed[0]["live"] is True

    assert client.delete(f"/api/admin/messages/{msg_id}", headers=ADMIN).status_code == 204
    assert client.delete(f"/api/admin/messages/{msg_id}", headers=ADMIN).status_code == 404


def test_public_messages_are_localized_with_fallback(client):
    client.post("/api/admin/messages", json=message(), headers=ADMIN)
    fr = client.get("/api/messages?lang=fr").json()
    assert fr[0]["title"] == "Affluence"
    # No Arabic text: falls back to English.
    ar = client.get("/api/messages?lang=ar").json()
    assert ar[0]["title"] == "Crowds"


def test_only_live_messages_are_public(client):
    now = datetime.now(timezone.utc)
    client.post("/api/admin/messages", json=message(active=False), headers=ADMIN)
    client.post(
        "/api/admin/messages",
        json=message(starts_at=(now + timedelta(days=1)).isoformat()),
        headers=ADMIN,
    )
    client.post(
        "/api/admin/messages",
        json=message(
            ends_at=(now - timedelta(days=1)).isoformat(), starts_at=(now - timedelta(days=2)).isoformat()
        ),
        headers=ADMIN,
    )
    live = client.post("/api/admin/messages", json=message(title={"fr": "En ligne"}), headers=ADMIN).json()
    public = client.get("/api/messages?lang=fr").json()
    assert [m["id"] for m in public] == [live["id"]]


def test_validation(client):
    assert (
        client.post("/api/admin/messages", json=message(title={"fr": " "}), headers=ADMIN).status_code == 422
    )
    now = datetime.now(timezone.utc)
    bad_dates = message(starts_at=now.isoformat(), ends_at=(now - timedelta(hours=1)).isoformat())
    assert client.post("/api/admin/messages", json=bad_dates, headers=ADMIN).status_code == 422
    assert client.post("/api/admin/messages", json=message(kind="ad"), headers=ADMIN).status_code == 422


def test_admin_flags_messages_beyond_the_limit(client):
    for i in range(messages.MAX_LIVE + 1):
        client.post("/api/admin/messages", json=message(title={"fr": f"M{i}"}), headers=ADMIN)
    listed = client.get("/api/admin/messages", headers=ADMIN).json()
    assert sum(m["live"] for m in listed) == messages.MAX_LIVE
    assert [m["title"]["fr"] for m in listed if m["queued"]] == ["M0"]
    assert len(client.get("/api/messages").json()) == messages.MAX_LIVE
