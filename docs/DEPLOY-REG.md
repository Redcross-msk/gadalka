# Деплой «Гадалка» на GitHub + REG.Cloud

Схема как у МОСКАСТИНГа: код в GitHub → VPS Ubuntu → Docker Compose (Postgres + Next.js + Caddy + HTTPS).

Замените везде:
- `YOUR_DOMAIN.ru` — ваш домен
- `ВАШ_ЛОГИН` — GitHub username / org (например `Redcross-msk`)
- `IP_СЕРВЕРА` — публичный IP VPS

---

## Часть A. GitHub (с вашего ПК)

### A1. Создать репозиторий

1. Откройте https://github.com/new
2. **Owner** — ваш аккаунт / org
3. **Repository name:** `gadalka`
4. **Private** (рекомендуется)
5. **Не** ставьте галочки Add README / .gitignore / license
6. Нажмите **Create repository**

### A2. Запушить код

В PowerShell, папка проекта `Платформа`:

```powershell
cd "C:\Users\firman\Desktop\Платформа"

# если ещё нет git:
git init
git add .
git commit -m "Initial commit: platform ready for deploy"
git branch -M main

git remote add origin https://github.com/ВАШ_ЛОГИН/gadalka.git
git push -u origin main
```

Если GitHub просит пароль — нужен **Personal Access Token**:
1. GitHub → ваш аватар → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)** → scope `repo` → Generate
3. Скопируйте токен и вставьте вместо пароля при `git push`

После успеха напишите агенту: `готово + URL репо` (например `https://github.com/Redcross-msk/gadalka`).

---

## Часть B. VPS в REG.Cloud

### B1. Создать сервер

1. Войдите в https://cloud.reg.ru (или кабинет REG.RU → раздел облака / VPS)
2. **Создать** / **Заказать сервер**
3. ОС: **Ubuntu 22.04** или **24.04**
4. Ресурсы: минимум **2 vCPU / 4 GB RAM** (1 GB часто мало для Next build)
5. Диск: от **20–40 GB**
6. Регион: РФ
7. Сохраните **IP** и **root-пароль** (или добавьте SSH-ключ)
8. Дождитесь статуса «Работает»

### B2. Файрвол / безопасность

Разрешите входящие:
- **TCP 22** (SSH)
- **TCP 80** (HTTP → Let's Encrypt)
- **TCP 443** (HTTPS)

В панели REG: «Сеть / Firewall / Security groups» — Add rule → эти порты → Save.

---

## Часть C. DNS домена (REG.RU)

1. https://www.reg.ru → **Домены** → ваш домен
2. **DNS-серверы и управление зоной** / **Ресурсные записи**
3. Добавьте / измените:
   - Тип **A**, имя `@` (или пустое), значение = `IP_СЕРВЕРА`, TTL 3600
   - Тип **A**, имя `www`, значение = `IP_СЕРВЕРА`
4. Удалите конфликтующие старые A/AAAA на `@` и `www`, если мешают
5. Подождите 5–60 минут

Проверка с ПК:

```powershell
nslookup YOUR_DOMAIN.ru
ping YOUR_DOMAIN.ru
```

IP в ответе должен совпасть с VPS.

Напишите агенту: `IP=… домен=…`

---

## Часть D. Установка на сервере (SSH)

### D1. Подключение

PowerShell:

```powershell
ssh root@IP_СЕРВЕРА
```

При первом подключении: `yes` → введите root-пароль.

### D2. Docker

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
docker compose version
```

### D3. Клон репозитория

```bash
cd /opt
git clone https://github.com/ВАШ_ЛОГИН/gadalka.git gadalka
cd gadalka
```

Если репо **Private** — используйте HTTPS + token или SSH-ключ GitHub на сервере.

### D4. Домен в Caddy

```bash
nano Caddyfile
```

Замените оба `YOUR_DOMAIN.ru` на ваш домен. Сохраните: `Ctrl+O`, Enter, `Ctrl+X`.

### D5. Секреты (файл `.env` для compose)

На **своём ПК** сгенерируйте две строки (не публикуйте в чат):

```powershell
# AUTH_SECRET (≥32):
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})

# POSTGRES_PASSWORD:
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

На сервере:

```bash
nano .env
```

Вставьте (подставьте свои значения и домен):

```env
POSTGRES_PASSWORD=ВСТАВЬТЕ_ПАРОЛЬ_БД
AUTH_SECRET=ВСТАВЬТЕ_СЕКРЕТ_32_ПЛЮС
AUTH_URL=https://YOUR_DOMAIN.ru
NEXT_PUBLIC_APP_NAME=Гадалка
```

Сохраните. Файл `.env` уже в `.gitignore` — в git не попадёт.

### D6. Сборка и запуск

```bash
cd /opt/gadalka
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f app
```

В логах должно быть: миграции Prisma и `Ready` / Listening. Выход из логов: `Ctrl+C`.

### D7. Seed (админ и товары) — один раз

```bash
docker compose exec app npx tsx prisma/seed.ts
```

После этого:
- Сайт: `https://YOUR_DOMAIN.ru`
- Админ: `https://YOUR_DOMAIN.ru/admin`
- Логин: `admin@gadalka.local` / `password123` — **сразу смените пароль** в проде

---

## Часть E. Проверка

1. Открыть сайт по HTTPS (замочек)
2. Регистрация с полной анкетой → вход на `/platform`
3. `/admin` → товар с фото → фото видно в `/shop`
4. Перезагрузка страницы — данные на месте

---

## Часть F. Обновление после правок кода

**На ПК:**

```powershell
cd "C:\Users\firman\Desktop\Платформа"
git add .
git commit -m "описание изменений"
git push
```

**На сервере:**

```bash
cd /opt/gadalka
git pull
docker compose build --no-cache app
docker compose up -d app
docker compose logs -f app
```

Загруженные фото лежат в Docker volume `gadalka_uploads` — при пересборке `app` не пропадают.

---

## Часть G. Полезные команды на сервере

```bash
docker compose ps
docker compose logs -f caddy
docker compose restart app
docker compose down          # остановить всё
docker compose up -d         # снова поднять
```

Бэкап БД:

```bash
docker compose exec -T postgres pg_dump -U gadalka gadalka > /root/gadalka-$(date +%F).sql
```

---

## Локальная разработка (не прод)

Только Postgres:

```powershell
docker compose -f docker-compose.dev.yml up -d
npm run dev
```

Полный стек локально (без своего домена Caddy не выдаст LE-сертификат) — обычно не нужен.
