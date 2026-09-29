"""Messages published from the admin page and shown on the app's home screen
(crowd information, special opening hours, advice...). Each message has a text per language."""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field, model_validator

from admin_auth import require_admin
from database import db
from ratelimit import RateLimiter

public = APIRouter(prefix="/api")
admin = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])

limiter = RateLimiter(limit=600, window_seconds=3600)

LANGS = ("fr", "en", "ar")
MAX_LIVE = 5


class Localized(BaseModel):
    fr: str = Field(default="", max_length=600)
    en: str = Field(default="", max_length=600)
    ar: str = Field(default="", max_length=600)

    def pick(self, lang: str) -> str:
        """Text in the requested language, else the first one available."""
        for code in (lang, "en", "fr", "ar"):
            value = getattr(self, code, "").strip()
            if value:
                return value
        return ""


class MessageIn(BaseModel):
    title: Localized
    body: Localized
    kind: Literal["info", "tip", "warning"] = "info"
    active: bool = True
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

    @model_validator(mode="after")
    def check(self) -> "MessageIn":
        if not any(getattr(self.title, code).strip() for code in LANGS):
            raise ValueError("A title is required in at least one language")
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("The end date must be after the start date")
        return self


def _aware(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _to_doc(body: MessageIn) -> Dict:
    doc = body.model_dump()
    doc["starts_at"] = _aware(body.starts_at).isoformat() if body.starts_at else None
    doc["ends_at"] = _aware(body.ends_at).isoformat() if body.ends_at else None
    return doc


def is_live(doc: Dict, now: datetime) -> bool:
    if not doc.get("active"):
        return False
    iso = now.isoformat()
    if doc.get("starts_at") and doc["starts_at"] > iso:
        return False
    if doc.get("ends_at") and doc["ends_at"] <= iso:
        return False
    return True


# ------------------------ App ------------------------
@public.get("/messages")
async def live_messages(request: Request, response: Response, lang: str = Query(default="fr", max_length=2)):
    """Messages currently online, in the app language (falls back to another language)."""
    limiter.check(request, "messages")
    now = datetime.now(timezone.utc)
    docs = await db.messages.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    live = [d for d in docs if is_live(d, now)][:MAX_LIVE]
    response.headers["Cache-Control"] = "public, max-age=300"
    return [
        {
            "id": d["id"],
            "kind": d["kind"],
            "title": Localized(**d["title"]).pick(lang),
            "body": Localized(**d["body"]).pick(lang),
            "updated_at": d.get("updated_at"),
        }
        for d in live
    ]


# ------------------------ Admin ------------------------
@admin.get("/messages")
async def list_messages() -> List[Dict]:
    now = datetime.now(timezone.utc)
    docs = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    result, shown = [], 0
    for d in docs:
        live = is_live(d, now)
        # Same rule as the app: only the MAX_LIVE most recent live messages are shown.
        visible = live and shown < MAX_LIVE
        shown += 1 if visible else 0
        result.append({**d, "live": visible, "queued": live and not visible})
    return result


@admin.post("/messages", status_code=201)
async def create_message(body: MessageIn) -> Dict:
    now = datetime.now(timezone.utc).isoformat()
    doc = {"id": str(uuid.uuid4()), **_to_doc(body), "created_at": now, "updated_at": now}
    await db.messages.insert_one(dict(doc))
    return doc


@admin.put("/messages/{message_id}")
async def update_message(message_id: str, body: MessageIn) -> Dict:
    now = datetime.now(timezone.utc).isoformat()
    result = await db.messages.find_one_and_update(
        {"id": message_id},
        {"$set": {**_to_doc(body), "updated_at": now}},
        projection={"_id": 0},
        return_document=True,
    )
    if not result:
        raise HTTPException(404, "Message not found")
    return result


@admin.delete("/messages/{message_id}", status_code=204)
async def delete_message(message_id: str) -> Response:
    result = await db.messages.delete_one({"id": message_id})
    if not result.deleted_count:
        raise HTTPException(404, "Message not found")
    return Response(status_code=204)


async def setup() -> None:
    await db.messages.create_index("id", unique=True)
    await db.messages.create_index([("active", 1), ("created_at", -1)])
