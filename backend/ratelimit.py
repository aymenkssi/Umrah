"""Small in-memory rate limiter per client address (one API process, so no shared store needed)."""

import time
from collections import defaultdict, deque
from typing import Deque, Dict, Tuple

from fastapi import HTTPException, Request


def client_ip(request: Request) -> str:
    """Address of the caller. Behind Traefik, the proxy appends the real client address
    as the last X-Forwarded-For entry (entries before it can be forged by the client)."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "?"


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self.hits: Dict[Tuple[str, str], Deque[float]] = defaultdict(deque)

    def check(self, request: Request, bucket: str) -> None:
        now = time.monotonic()
        hits = self.hits[(bucket, client_ip(request))]
        while hits and now - hits[0] > self.window:
            hits.popleft()
        if len(hits) >= self.limit:
            raise HTTPException(429, "Too many requests")
        hits.append(now)
        if len(self.hits) > 50_000:  # forget idle addresses so memory stays bounded
            self.hits = defaultdict(
                deque, {k: v for k, v in self.hits.items() if v and now - v[-1] <= self.window}
            )

    def reset(self) -> None:
        self.hits.clear()
