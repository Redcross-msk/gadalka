import type { ZodiacSign as DbZodiac } from "@prisma/client";
import type { NatalChart, User, ZodiacSign } from "@/types";

const dbToAppZodiac: Record<DbZodiac, ZodiacSign> = {
  ARIES: "aries",
  TAURUS: "taurus",
  GEMINI: "gemini",
  CANCER: "cancer",
  LEO: "leo",
  VIRGO: "virgo",
  LIBRA: "libra",
  SCORPIO: "scorpio",
  SAGITTARIUS: "sagittarius",
  CAPRICORN: "capricorn",
  AQUARIUS: "aquarius",
  PISCES: "pisces",
};

export const appToDbZodiac: Record<ZodiacSign, DbZodiac> = {
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

export function mapDbZodiac(sign: DbZodiac | null | undefined): ZodiacSign | undefined {
  if (!sign) return undefined;
  return dbToAppZodiac[sign];
}

type ProfileLike = {
  displayName: string;
  interests: string[];
  zodiacSign: DbZodiac | null;
  birthDate: Date | null;
  birthTime: string | null;
  birthPlace: string | null;
  onboardingComplete: boolean;
  theme: "DARK" | "WARM" | "MYSTIC";
  avatarMedia?: { url: string; path: string | null } | null;
};

type MeLike = {
  id: string;
  email: string;
  profile: ProfileLike | null;
  subscription?: { plan: string; status: string; endsAt: Date | null } | null;
  gameSave?: { level: number } | null;
};

export function mapMeToAppUser(me: MeLike): User {
  const p = me.profile;
  const birthDate = p?.birthDate
    ? p.birthDate.toISOString().slice(0, 10)
    : undefined;

  const natalChart: NatalChart | undefined = birthDate
    ? {
        birthDate,
        birthTime: p?.birthTime ?? undefined,
        birthPlace: p?.birthPlace ?? undefined,
      }
    : undefined;

  const theme =
    p?.theme === "WARM" ? "warm" : p?.theme === "MYSTIC" ? "mystic" : "dark";

  return {
    id: me.id,
    name: p?.displayName ?? me.email,
    email: me.email,
    level: me.gameSave?.level ?? 1,
    interests: p?.interests ?? [],
    direction: "platform",
    theme,
    onboardingComplete: p?.onboardingComplete ?? false,
    zodiacSign: mapDbZodiac(p?.zodiacSign),
    natalChart,
  };
}

export function isPremiumSubscription(
  sub: { plan: string; status: string; endsAt: Date | null } | null | undefined
): boolean {
  if (!sub || sub.plan === "FREE" || sub.status !== "ACTIVE") return false;
  if (sub.endsAt && sub.endsAt <= new Date()) return false;
  return true;
}
