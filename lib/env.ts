import "server-only";

import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const server = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (v) => v.startsWith("postgresql://") || v.startsWith("postgres://"),
      "Ожидается PostgreSQL URL"
    ),
  AUTH_SECRET: isProd
    ? z.string().min(32, "В production задайте AUTH_SECRET ≥ 32 символов")
    : z.string().min(16).optional().default("gadalka-dev-secret-change-me-32"),
  AUTH_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().optional().default("public/uploads"),
});

const client = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Гадалка"),
});

const merged = server.merge(client);
export type Env = z.infer<typeof merged>;

function createEnv(): Env {
  const parsed = merged.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!parsed.success) {
    console.error("Invalid env:", parsed.error.flatten().fieldErrors);
    throw new Error("Некорректные переменные окружения — см. .env.example");
  }
  return parsed.data;
}

export const env = createEnv();
