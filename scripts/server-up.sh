#!/usr/bin/env bash
# Запускать НА СЕРВЕРЕ из /opt/gadalka после git clone и настройки .env + Caddyfile.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Building…"
docker compose build
echo "→ Starting…"
docker compose up -d
echo "→ Status:"
docker compose ps
echo "→ App logs (Ctrl+C to exit):"
docker compose logs -f app
