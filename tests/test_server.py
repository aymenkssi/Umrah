import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

import analytics
import server

ADMIN = {"Authorization": "Bearer test-admin-token-1234567890"}


@pytest.fixture
def db(monkeypatch):
    mock_db = AsyncMongoMockClient()["test_db"]
    monkeypatch.setattr(analytics, "db", mock_db)
    monkeypatch.setenv("ADMIN_TOKEN", "test-admin-token-1234567890")
    monkeypatch.setattr(analytics, "_geo", None)
    monkeypatch.setattr(analytics, "_geo_loaded", True)
    analytics.limiter.reset()
    return mock_db


@pytest.fixture
def client(db):
    with TestClient(server.app) as test_client:
        yield test_client


def new_id() -> str:
    return str(uuid.uuid4())


def session(client, install_id_, **overrides):
    body = {
        "install_id": install_id_,
        "platform": "android",
        "app_version": "1.1.0",
        "lang": "fr",
        "region": "FR",
    }
    body.update(overrides)
    return client.post("/api/sessions", json=body)


# ------------------------ Website ------------------------
def test_health_and_root(client):
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/api/").json() == {"message": "Umrah Companion API online"}


def test_public_pages(client):
    assert "Umrah &amp; Hajj Companion" in client.get("/").text
    privacy = client.get("/privacy")
    assert privacy.status_code == 200
    assert "AdMob" in privacy.text and 'lang="ar"' in privacy.text
    ads = client.get("/app-ads.txt")
    assert ads.headers["content-type"].startswith("text/plain")
    assert "pub-7488746561313974" in ads.text
    admin_page = client.get("/admin")
    assert admin_page.headers["cache-control"] == "no-store"
    assert admin_page.headers["x-frame-options"] == "DENY"


# ------------------------ App endpoints ------------------------
def test_session_creates_and_updates_install(client, db):
    install_id = new_id()
    assert session(client, install_id).status_code == 200
    assert session(client, install_id, app_version="1.2.0", lang="ar").status_code == 200
    stats = client.get("/api/admin/stats", headers=ADMIN).json()
    assert stats["installs"]["total"] == 1
    assert stats["installs"]["active_today"] == 1
    assert stats["installs"]["new_today"] == 1
    assert stats["installs"]["sessions_period"] == 2
    assert stats["countries"] == [{"country": "FR", "installs": 1, "active_30d": 1}]
    assert stats["versions"] == [{"value": "1.2.0", "installs": 1}]
    assert stats["languages"] == [{"value": "ar", "installs": 1}]


def test_ip_country_is_never_downgraded_to_device_region(client, db, monkeypatch):
    install_id = new_id()
    monkeypatch.setattr(analytics, "country_from_ip", lambda ip: "SA")
    session(client, install_id, region="FR")
    monkeypatch.setattr(analytics, "country_from_ip", lambda ip: None)
    session(client, install_id, region="FR")
    stats = client.get("/api/admin/stats", headers=ADMIN).json()
    assert stats["countries"][0]["country"] == "SA"


@pytest.mark.parametrize(
    "overrides",
    [
        {"install_id": "not-a-uuid"},
        {"platform": "windows"},
        {"lang": "de"},
        {"region": "france"},
        {"app_version": "x" * 50},
    ],
)
def test_session_rejects_invalid_payload(client, overrides):
    assert session(client, new_id(), **overrides).status_code == 422


def test_events_count_known_screens_only(client):
    install_id = new_id()
    session(client, install_id)
    response = client.post(
        "/api/events", json={"install_id": install_id, "screens": ["guide", "guide", "qibla", "hacker"]}
    )
    assert response.json() == {"ok": True, "recorded": 3}
    stats = client.get("/api/admin/stats", headers=ADMIN).json()
    assert stats["screens"] == [{"screen": "guide", "views": 2}, {"screen": "qibla", "views": 1}]


def test_events_require_a_known_install(client):
    response = client.post("/api/events", json={"install_id": new_id(), "screens": ["home"]})
    assert response.status_code == 404


def test_forget_install_erases_its_data(client):
    install_id = new_id()
    session(client, install_id)
    assert client.delete(f"/api/installs/{install_id}").status_code == 200
    stats = client.get("/api/admin/stats", headers=ADMIN).json()
    assert stats["installs"]["total"] == 0
    assert stats["installs"]["active_today"] == 0


def test_rate_limit(client, monkeypatch):
    monkeypatch.setattr(analytics.limiter, "limit", 2)
    install_id = new_id()
    assert session(client, install_id).status_code == 200
    assert session(client, install_id).status_code == 200
    assert session(client, install_id).status_code == 429


# ------------------------ Admin ------------------------
def test_admin_requires_valid_token(client):
    assert client.get("/api/admin/stats").status_code == 401
    assert client.get("/api/admin/stats", headers={"Authorization": "Bearer wrong"}).status_code == 401


def test_admin_disabled_without_token(client, monkeypatch):
    monkeypatch.setenv("ADMIN_TOKEN", "")
    assert client.get("/api/admin/stats", headers=ADMIN).status_code == 503


def test_daily_series_covers_requested_period(client):
    stats = client.get("/api/admin/stats?days=7", headers=ADMIN).json()
    assert len(stats["daily"]) == 7
    assert stats["daily"][-1]["day"] == datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ------------------------ Retention ------------------------
async def test_purge_removes_inactive_installs(db):
    old = (datetime.now(timezone.utc) - timedelta(days=800)).isoformat()
    recent = datetime.now(timezone.utc).isoformat()
    await db.installs.insert_many([{"id": "old", "last_seen_at": old}, {"id": "new", "last_seen_at": recent}])
    await db.activity.insert_many(
        [{"install_id": "old", "day": "2020-01-01"}, {"install_id": "new", "day": "2099-01-01"}]
    )
    assert await analytics.purge_expired() == 1
    assert [i["id"] async for i in db.installs.find()] == ["new"]
    assert [a["install_id"] async for a in db.activity.find()] == ["new"]
