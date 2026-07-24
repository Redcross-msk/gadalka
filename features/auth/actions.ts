"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { ZodiacSign } from "@prisma/client";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { getZodiacFromDate } from "@/data/natal";
import type { ZodiacSign as AppZodiac } from "@/types";

const zodiacEnum = z.nativeEnum(ZodiacSign);

const registerSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое").max(80),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов").max(128),
  birthDate: z.string().min(1, "Укажите дату рождения"),
  birthTime: z.string().min(1, "Укажите время рождения"),
  birthPlace: z.string().min(2, "Укажите город рождения").max(120),
  zodiacSign: zodiacEnum,
  interests: z.array(z.string()).min(1, "Выберите хотя бы один интерес"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const appToDbZodiac: Record<AppZodiac, ZodiacSign> = {
  aries: "ARIES",
  taurus: "TAURUS",
  gemini: "GEMINI",
  cancer: "CANCER",
  leo: "LEO",
  virgo: "VIRGO",
  libra: "LIBRA",
  scorpio: "SCORPIO",
  sagittarius: "SAGITTARIUS",
  capricorn: "CAPRICORN",
  aquarius: "AQUARIUS",
  pisces: "PISCES",
};

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  zodiacSign: string;
  interests: string[];
}): Promise<AuthActionResult> {
  const derived = getZodiacFromDate(input.birthDate);
  const zodiac =
    (derived ? appToDbZodiac[derived] : null) ??
    (Object.values(ZodiacSign).includes(input.zodiacSign as ZodiacSign)
      ? (input.zodiacSign as ZodiacSign)
      : null);

  const parsed = registerSchema.safeParse({
    ...input,
    zodiacSign: zodiac ?? input.zodiacSign,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Ошибка валидации" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Этот email уже зарегистрирован" };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            displayName: parsed.data.name.trim(),
            onboardingComplete: true,
            zodiacSign: parsed.data.zodiacSign,
            birthDate: new Date(parsed.data.birthDate),
            birthTime: parsed.data.birthTime.trim(),
            birthPlace: parsed.data.birthPlace.trim(),
            interests: parsed.data.interests,
          },
        },
        subscription: {
          create: { plan: "FREE", status: "ACTIVE" },
        },
        gameSave: {
          create: { level: 1, energy: 0, state: {} },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "auth.register",
        entity: "User",
        entityId: user.id,
        meta: { zodiac: parsed.data.zodiacSign, interests: parsed.data.interests },
      },
    });
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Аккаунт создан, но вход не удался — попробуйте войти" };
    }
    throw e;
  }

  return { ok: true };
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Введите email и пароль" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Неверный email или пароль" };
    }
    throw e;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
