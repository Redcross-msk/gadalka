# Запуск «Гадалка» на Windows (база + сервер)

Стек как в **МОСКАСТИНГ**: Next.js 15 + **PostgreSQL** + **Prisma** + **Auth.js (JWT)**.

**Прод (GitHub + REG.Cloud):** см. [DEPLOY-REG.md](./DEPLOY-REG.md).

## Что уже есть в проекте

- Полная схема БД: пользователи, профиль, подписка, сны + анализ, расклады, магазин/корзина/заказы, media/баннеры, сейв игры и достижения, audit log
- Вход / регистрация с хэшем пароля (bcrypt)
- На главной с 3 картами — **обязательный вход** (иначе карты недоступны)
- Middleware защищает `/platform`, `/game`, `/shop`, `/admin`
- Кнопка **«К колоде»** во всех трёх разделах
- Анализ сна считается из текста/символов/настроения и пишется в `DreamAnalysis`
- Прогресс idle-игры синхронизируется в `GameSave` (~каждые 20 сек)

## Быстрый старт (у вас уже стоит PostgreSQL)

### 1. База (один раз)

Вариант A — Docker только Postgres:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

Вариант B — локальный PostgreSQL. Если база `gadalka` ещё не создана — в **SQL Shell / psql** под пользователем `postgres`:

```sql
CREATE USER gadalka WITH PASSWORD 'gadalka';
CREATE DATABASE gadalka OWNER gadalka;
```

Файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://gadalka:gadalka@localhost:5432/gadalka?schema=public"
AUTH_SECRET="gadalka-dev-secret-change-me-32chars-min"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Гадалка"
```

### 2. Миграции и сид

```powershell
cd "C:\Users\firman\Desktop\Платформа"
npm install
npx prisma migrate dev
npm run db:seed
```

### 3. Сервер

```powershell
npm run dev
```

Откройте: http://localhost:3000

### Демо-логины (после seed)

| Email | Пароль | Роль |
|--------|--------|------|
| `demo@gadalka.local` | `password123` | пользователь |
| `admin@gadalka.local` | `password123` | админ |

### Проверка в разных браузерах

1. Chrome: войдите как `demo@…`, поиграйте, запишите сон  
2. Edge / Firefox (окно инкогнито): войдите тем же аккаунтом — прогресс/сны с сервера  
3. Или зарегистрируйте второй аккаунт — данные раздельные  

Полезно: `npm run db:studio` — визуальный просмотр таблиц Prisma Studio.

## Docker (опционально)

Если установлен Docker Desktop:

```powershell
docker compose up -d
```

Поднимет только Postgres на порту 5432 (см. `docker-compose.yml`).

## Куда класть картинки позже

Таблица `MediaAsset` + папка `public/uploads/`  
Виды: `AVATAR`, `PRODUCT`, `PRODUCT_GALLERY`, `BANNER`, `CONTENT`, …  
Баннеры — модель `Banner` (placement: home/shop/platform/game).
