#!/usr/bin/env bash
# Daily MongoDB backup, keeps 14 days. Cron example (as root, in the deploy folder):
#   15 4 * * * cd /opt/apps/umrah-companion/deploy && ./backup.sh >> backups/backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a
mkdir -p backups
stamp=$(date +%Y-%m-%d_%H%M)
docker compose exec -T mongo mongodump --quiet --archive="/backups/umrah-$stamp.gz" --gzip \
  --username "$MONGO_USER" --password "$MONGO_PASSWORD" --authenticationDatabase admin --db umrah_companion
# Du'a recordings (small): archived alongside the database.
docker compose exec -T api tar -czf - -C /app/media . > "backups/umrah-media-$stamp.tar.gz"
find backups -name 'umrah-*.gz' -mtime +14 -delete
echo "$(date -Is) backup umrah-$stamp.gz OK"
