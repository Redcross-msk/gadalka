import type { ZodiacSign } from "@/types";
import {
  getDailyHoroscope,
  horoscopeDisclaimer,
  type HoroscopeSections,
} from "@/data/dailyHoroscopes";

export const zodiacSigns: { id: ZodiacSign; name: string; dates: string }[] = [
  { id: "aries", name: "Овен", dates: "21.03–19.04" },
  { id: "taurus", name: "Телец", dates: "20.04–20.05" },
  { id: "gemini", name: "Близнецы", dates: "21.05–20.06" },
  { id: "cancer", name: "Рак", dates: "21.06–22.07" },
  { id: "leo", name: "Лев", dates: "23.07–22.08" },
  { id: "virgo", name: "Дева", dates: "23.08–22.09" },
  { id: "libra", name: "Весы", dates: "23.09–22.10" },
  { id: "scorpio", name: "Скорпион", dates: "23.10–21.11" },
  { id: "sagittarius", name: "Стрелец", dates: "22.11–21.12" },
  { id: "capricorn", name: "Козерог", dates: "22.12–19.01" },
  { id: "aquarius", name: "Водолей", dates: "20.01–18.02" },
  { id: "pisces", name: "Рыбы", dates: "19.02–20.03" },
];

export function getZodiacName(sign: ZodiacSign): string {
  return zodiacSigns.find((z) => z.id === sign)?.name ?? sign;
}

export type TodayHoroscope = {
  sign: ZodiacSign;
  signName: string;
  date: string;
  /** Общий текст (для совместимости) */
  text: string;
  sections: HoroscopeSections;
  disclaimer: string;
};

export function getTodayHoroscope(sign: ZodiacSign, date = new Date()): TodayHoroscope {
  const sections = getDailyHoroscope(sign, date);
  const today = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    sign,
    signName: getZodiacName(sign),
    date: today,
    text: sections.general,
    sections,
    disclaimer: horoscopeDisclaimer,
  };
}

export type { HoroscopeSections };
export { getDailyHoroscope, horoscopeDisclaimer };
