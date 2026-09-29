FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py database.py admin_auth.py ratelimit.py analytics.py messages.py audio.py audio_catalog.json admin.html ./
COPY site ./site

RUN useradd --create-home --uid 10001 app && mkdir -p /app/media/audio && chown -R app /app/media
USER app

EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--proxy-headers", "--forwarded-allow-ips", "*"]
