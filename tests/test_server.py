import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import server  # noqa: E402


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(server, "db", AsyncMongoMockClient()["test_db"])
    with TestClient(server.app) as test_client:
        yield test_client


def test_root(client):
    response = client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list_status_checks(client):
    created = client.post("/api/status", json={"client_name": "pilgrim"})
    assert created.status_code == 200
    body = created.json()
    assert body["client_name"] == "pilgrim"
    assert body["id"]

    listed = client.get("/api/status")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [body["id"]]


def test_rejects_empty_client_name(client):
    response = client.post("/api/status", json={"client_name": ""})
    assert response.status_code == 422
