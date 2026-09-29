"""Admin page protection: a single secret token (ADMIN_TOKEN), sent as a Bearer header."""

import os
import secrets
from typing import Optional

from fastapi import Header, HTTPException


async def require_admin(authorization: Optional[str] = Header(default=None)) -> None:
    expected = os.environ.get("ADMIN_TOKEN", "")
    if len(expected) < 16:
        raise HTTPException(503, "Admin disabled: set ADMIN_TOKEN (16+ characters)")
    given = authorization[7:].strip() if authorization and authorization.lower().startswith("bearer ") else ""
    if not secrets.compare_digest(given.encode(), expected.encode()):
        raise HTTPException(401, "Invalid admin token")
