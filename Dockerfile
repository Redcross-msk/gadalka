# Production image (как МОСКАСТИНГ). Локально удобнее: Postgres из compose + `npm run dev`.
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public может отсутствовать в контексте — создаём до build
RUN mkdir -p public/uploads/placeholders
ENV NEXT_TELEMETRY_DISABLED=1
# Next build импортирует env.ts — нужны валидные плейсхолдеры на этапе сборки
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV AUTH_SECRET="build-time-secret-must-be-32chars-minimum!!"
ENV AUTH_URL="http://localhost:3000"
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN mkdir -p /app/public/uploads
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
