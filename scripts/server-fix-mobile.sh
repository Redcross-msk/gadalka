#!/bin/bash
# Запускать ТОЛЬКО на VPS после: ssh root@194.67.111.193
set -euo pipefail
cd /opt/gadalka
git pull
sed -i 's|^AUTH_URL=.*|AUTH_URL=https://www.xn--80aaakgo7a.xn--p1ai|' .env
grep AUTH_URL .env
docker compose build --no-cache app
docker compose up -d
docker compose up -d --force-recreate caddy
sleep 8
docker compose ps
curl -sI https://www.xn--80aaakgo7a.xn--p1ai/ | head -5
echo "OK — открой на телефоне именно: https://www.загадал.рф"
