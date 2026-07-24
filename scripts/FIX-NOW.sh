#!/bin/bash
# ТОЛЬКО на сервере после: ssh root@194.67.111.193
set -euxo pipefail
cd /opt/gadalka
git fetch origin
git reset --hard origin/main
grep -q '^AUTH_URL=' .env && sed -i 's|^AUTH_URL=.*|AUTH_URL=https://www.xn--80aaakgo7a.xn--p1ai|' .env || echo 'AUTH_URL=https://www.xn--80aaakgo7a.xn--p1ai' >> .env
echo "=== AUTH_URL ===" && grep AUTH_URL .env
echo "=== COMMIT ===" && git log -1 --oneline
docker compose build --no-cache app
docker compose up -d --force-recreate app caddy
sleep 10
docker compose ps
curl -sI http://127.0.0.1:3000/platform | head -5 || true
echo "DONE — открой https://www.загадал.рф (с www), жёсткое обновление Ctrl+F5"
