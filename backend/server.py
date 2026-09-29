"""Umrah Companion backend: anonymous usage statistics, admin page and public website
(privacy policy and app-ads.txt) on a single domain, e.g. https://pelerinage.creationapp.academy."""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse
from starlette.middleware.cors import CORSMiddleware

import analytics
import audio
import messages
from database import client

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

HERE = Path(__file__).parent
SITE = HERE / "site"


async def daily_maintenance() -> None:
    while True:
        try:
            await analytics.purge_expired()
        except Exception:
            logging.getLogger("umrah").exception("Retention purge failed")
        await asyncio.sleep(24 * 3600)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        await analytics.setup()
        await messages.setup()
        await audio.setup()
    except Exception:
        logging.getLogger("umrah").exception("Could not create MongoDB indexes")
    maintenance = asyncio.create_task(daily_maintenance())
    yield
    maintenance.cancel()
    client.close()


app = FastAPI(title="Umrah Companion API", lifespan=lifespan, docs_url=None, redoc_url=None)

api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"message": "Umrah Companion API online"}


@api.get("/health")
async def health():
    """Liveness probe that does not depend on the database."""
    return {"status": "ok"}


app.include_router(api)
app.include_router(analytics.public)
app.include_router(analytics.admin)
app.include_router(messages.public)
app.include_router(messages.admin)
app.include_router(audio.public)
app.include_router(audio.admin)

# ------------------------ Website ------------------------
NO_FRAME = {"X-Frame-Options": "DENY", "X-Content-Type-Options": "nosniff"}


def page(name: str) -> HTMLResponse:
    return HTMLResponse((SITE / name).read_text(encoding="utf-8"), headers=NO_FRAME)


@app.get("/", include_in_schema=False)
async def home():
    return page("index.html")


@app.get("/privacy", include_in_schema=False)
async def privacy():
    return page("privacy.html")


@app.get("/app-ads.txt", include_in_schema=False)
async def app_ads():
    return PlainTextResponse((SITE / "app-ads.txt").read_text(encoding="utf-8"))


@app.get("/style.css", include_in_schema=False)
async def style():
    return FileResponse(
        SITE / "style.css", media_type="text/css", headers={"Cache-Control": "public, max-age=3600"}
    )


@app.get("/admin", include_in_schema=False)
async def admin_page():
    return HTMLResponse(
        (HERE / "admin.html").read_text(encoding="utf-8"),
        headers={**NO_FRAME, "Cache-Control": "no-store", "X-Robots-Tag": "noindex"},
    )


# The mobile app does not need CORS; this only matters for browser clients.
cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
if cors_origins:
    app.add_middleware(CORSMiddleware, allow_origins=cors_origins, allow_methods=["*"], allow_headers=["*"])
