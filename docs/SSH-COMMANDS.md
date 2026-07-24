# Готовый блок SSH (подставьте значения)

Скопируйте целиком в SSH-сессию после замены:
- `IP_СЕРВЕРА`
- `ВАШ_ЛОГИН` / `gadalka` (репо)
- `YOUR_DOMAIN.ru`
- пароли из локальной генерации (не из чата)

```bash
# === 1. Подключение (с ПК) ===
# ssh root@IP_СЕРВЕРА

# === 2. Система + Docker ===
apt update && apt upgrade -y
apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# === 3. Код ===
cd /opt
git clone https://github.com/ВАШ_ЛОГИН/gadalka.git gadalka
cd gadalka

# === 4. Caddy: домен ===
sed -i 's/YOUR_DOMAIN\.ru/YOUR_DOMAIN.ru/g' Caddyfile
# ↑ замените второй YOUR_DOMAIN.ru на реальный домен, например:
# sed -i 's/YOUR_DOMAIN\.ru/gadalka.ru/g' Caddyfile
cat Caddyfile

# === 5. Секреты ===
# Сгенерируйте POSTGRES_PASSWORD и AUTH_SECRET на ПК, затем:
cat > .env <<'EOF'
POSTGRES_PASSWORD=ЗАМЕНИТЕ
AUTH_SECRET=ЗАМЕНИТЕ_МИНИМУМ_32_СИМВОЛА
AUTH_URL=https://YOUR_DOMAIN.ru
NEXT_PUBLIC_APP_NAME=Гадалка
EOF

# === 6. Запуск ===
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 app

# === 7. Seed (один раз) ===
docker compose exec app npx tsx prisma/seed.ts

# === 8. Проверка ===
curl -I https://YOUR_DOMAIN.ru
```

После первого успешного деплоя обновления:

```bash
cd /opt/gadalka
bash scripts/server-update.sh
```
