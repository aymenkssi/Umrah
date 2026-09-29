"""Audio recordings of the du'as, uploaded from the admin page and downloaded by the app.

Files live on disk (MEDIA_DIR, a Docker volume in production); MongoDB keeps one document per du'a.
Each file name contains a content hash, so the app can cache it forever and fetch a new one
only when the admin replaces the recording.
"""

import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse

from admin_auth import require_admin
from database import db
from ratelimit import RateLimiter

public = APIRouter(prefix="/api")
admin = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])

limiter = RateLimiter(limit=600, window_seconds=3600)

MAX_BYTES = 5 * 1024 * 1024
KEY_RE = re.compile(r"^[a-z0-9_-]{1,80}$")
FILE_RE = re.compile(r"^([a-z0-9_-]{1,80})-([0-9a-f]{12})\.(mp3|m4a)$")
TYPES = {"mp3": "audio/mpeg", "m4a": "audio/mp4"}

CATALOG: List[Dict] = json.loads((Path(__file__).parent / "audio_catalog.json").read_text(encoding="utf-8"))
CATALOG_KEYS = {entry["key"] for entry in CATALOG}


def media_dir() -> Path:
    path = Path(os.environ.get("MEDIA_DIR", "/app/media/audio"))
    path.mkdir(parents=True, exist_ok=True)
    return path


def detect_format(head: bytes) -> Optional[str]:
    """Recognises MP3 (ID3 tag or MPEG frame) and M4A/AAC in an MP4 container, from the first bytes."""
    if head.startswith(b"ID3") or (len(head) > 1 and head[0] == 0xFF and (head[1] & 0xE0) == 0xE0):
        return "mp3"
    if head[4:8] == b"ftyp":
        return "m4a"
    return None


def public_url(doc: Dict) -> str:
    return f"/api/audio/files/{doc['file']}"


# ------------------------ App ------------------------
@public.get("/audio")
async def audio_manifest(request: Request, response: Response):
    """Recordings available: the app shows a play button only for these du'as."""
    limiter.check(request, "audio-manifest")
    docs = await db.audio.find({}, {"_id": 0}).to_list(500)
    response.headers["Cache-Control"] = "public, max-age=300"
    return {
        "items": {
            d["key"]: {"url": public_url(d), "version": d["version"], "size": d["size"]}
            for d in docs
            if d["key"] in CATALOG_KEYS
        }
    }


@public.get("/audio/files/{name}", include_in_schema=False)
async def audio_file(name: str):
    match = FILE_RE.match(name)
    if not match:
        raise HTTPException(404, "Not found")
    path = media_dir() / name
    if not path.is_file():
        raise HTTPException(404, "Not found")
    # The name changes with the content: safe to cache for a year.
    return FileResponse(
        path,
        media_type=TYPES[match.group(3)],
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# ------------------------ Admin ------------------------
@admin.get("/audio")
async def list_audio() -> List[Dict]:
    docs = {d["key"]: d for d in await db.audio.find({}, {"_id": 0}).to_list(500)}
    return [
        {
            **entry,
            "audio": (
                {
                    "url": public_url(docs[entry["key"]]),
                    "size": docs[entry["key"]]["size"],
                    "updated_at": docs[entry["key"]]["updated_at"],
                }
                if entry["key"] in docs
                else None
            ),
        }
        for entry in CATALOG
    ]


@admin.post("/audio/{key}")
async def upload_audio(key: str, file: UploadFile = File(...)) -> Dict:
    if key not in CATALOG_KEYS:
        raise HTTPException(404, "Unknown du'a")
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File too large (5 MB max)")
    fmt = detect_format(data[:16])
    if not fmt:
        raise HTTPException(415, "Only MP3 or M4A audio files are accepted")

    version = hashlib.sha256(data).hexdigest()[:12]
    name = f"{key}-{version}.{fmt}"
    folder = media_dir()
    tmp = folder / f".{name}.tmp"
    tmp.write_bytes(data)
    tmp.replace(folder / name)

    previous = await db.audio.find_one({"key": key}, {"_id": 0, "file": 1})
    doc = {
        "key": key,
        "file": name,
        "format": fmt,
        "size": len(data),
        "version": version,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.audio.replace_one({"key": key}, doc, upsert=True)
    if previous and previous["file"] != name:
        (folder / previous["file"]).unlink(missing_ok=True)
    return {**doc, "url": public_url(doc)}


@admin.delete("/audio/{key}", status_code=204)
async def delete_audio(key: str) -> Response:
    doc = await db.audio.find_one_and_delete({"key": key}, projection={"_id": 0})
    if not doc:
        raise HTTPException(404, "No recording for this du'a")
    (media_dir() / doc["file"]).unlink(missing_ok=True)
    return Response(status_code=204)


async def setup() -> None:
    await db.audio.create_index("key", unique=True)
