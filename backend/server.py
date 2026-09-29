import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection (Motor connects lazily, on the first query)
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'umrah_companion')]

# Comma-separated list of allowed origins, e.g. "https://example.com,https://app.example.com"
cors_origins = [o.strip() for o in os.environ.get('CORS_ORIGINS', '*').split(',') if o.strip()]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    client.close()


# Create the main app without a prefix
app = FastAPI(title="Umrah Companion API", lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str = Field(min_length=1, max_length=100)


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.get("/health")
async def health():
    """Liveness probe that does not depend on the database."""
    return {"status": "ok"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    # Browsers reject credentials with a wildcard origin, so only allow them for explicit origins.
    allow_credentials=cors_origins != ['*'],
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
