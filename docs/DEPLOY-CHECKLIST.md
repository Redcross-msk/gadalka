# Чеклист: GitHub → REG.Cloud (кратко)

Полная инструкция: [DEPLOY-REG.md](./DEPLOY-REG.md)

## 1. GitHub
- [ ] https://github.com/new → репо `gadalka` (Private) → Create
- [ ] На ПК: `git remote add origin https://github.com/ВАШ_ЛОГИН/gadalka.git`
- [ ] `git push -u origin main`
- [ ] Сообщить агенту URL репо

## 2. VPS REG.Cloud
- [ ] cloud.reg.ru → Ubuntu 22.04/24.04 → ≥2 CPU / 4 GB
- [ ] Открыть порты 22, 80, 443
- [ ] Записать IP и root-пароль
- [ ] Сообщить агенту: `IP=…`

## 3. DNS
- [ ] Домен → A `@` = IP, A `www` = IP
- [ ] `nslookup` совпадает с IP
- [ ] Сообщить агенту: `домен=…`

## 4. Сервер (агент выдаст блок под ваши IP/домен)
- [ ] `ssh root@IP`
- [ ] Docker + `git clone`
- [ ] Правка `Caddyfile` + `.env`
- [ ] `docker compose build && docker compose up -d`
- [ ] `docker compose exec app npx tsx prisma/seed.ts`
- [ ] Проверка https://домен и /admin
