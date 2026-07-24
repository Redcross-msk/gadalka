#!/usr/bin/env bash
# Обновление на сервере: git pull + пересборка app
set -euo pipefail
cd "$(dirname "$0")/.."
git pull
docker compose build --no-cache app
docker compose up -d app
docker compose logs --tail=80 app
