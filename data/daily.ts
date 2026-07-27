import { tarotCards, getTarotCardBySlug } from "./tarotCards";
import { dailySymbols } from "./symbols";
import { getTodayHoroscope } from "./horoscopes";
import type { ZodiacSign } from "@/types";

/** Карта и тема дня привязаны к знаку / направлению гороскопа */
const zodiacDailyMap: Record<
  ZodiacSign,
  { cardSlug: string; theme: string; question: string }
> = {
  aries: { cardSlug: "mag", theme: "Ясность решений", question: "Какой импульс стоит услышать сегодня?" },
  taurus: { cardSlug: "imperatritsa", theme: "Спокойный рост", question: "Какой ресурс рядом вы ещё не заметили?" },
  gemini: { cardSlug: "vlyublyonnye", theme: "Выбор приоритета", question: "Какая идея заслуживает внимания сегодня?" },
  cancer: { cardSlug: "luna", theme: "Эмоциональные границы", question: "Где вам нужно больше бережности к себе?" },
  leo: { cardSlug: "solntse", theme: "Самовыражение", question: "Где вы готовы показать свой свет?" },
  virgo: { cardSlug: "otshchelnik", theme: "Порядок в деталях", question: "Что достаточно сделать хорошо, а не идеально?" },
  libra: { cardSlug: "spravedlivost", theme: "Честный баланс", question: "Где нужна честность сильнее, чем компромисс?" },
  scorpio: { cardSlug: "smert", theme: "Глубина и обновление", question: "Что готово трансформироваться?" },
  sagittarius: { cardSlug: "kolesnitsa", theme: "Движение и горизонт", question: "Какой короткий шаг обновит ваш взгляд?" },
  capricorn: { cardSlug: "imperator", theme: "Структура и результат", question: "Какой результат стоит закрепить сегодня?" },
  aquarius: { cardSlug: "zvezda", theme: "Новый взгляд", question: "Какая необычная идея может оказаться практичной?" },
  pisces: { cardSlug: "verkhovnaya-zhestitsa", theme: "Образы и интуиция", question: "Какой знак или сон просит внимания?" },
};

export function getDailyCard(zodiacSign?: ZodiacSign) {
  const today = new Date().toISOString().split("T")[0];

  if (zodiacSign && zodiacDailyMap[zodiacSign]) {
    const mapped = zodiacDailyMap[zodiacSign];
    const horoscope = getTodayHoroscope(zodiacSign);
    const card = getTarotCardBySlug(mapped.cardSlug) ?? tarotCards[0];
    return {
      cardSlug: card.slug,
      date: today,
      theme: mapped.theme,
      question: mapped.question,
      horoscopeHint: horoscope.text.slice(0, 120) + (horoscope.text.length > 120 ? "…" : ""),
      saved: false,
    };
  }

  const majors = tarotCards.filter((c) => c.arcana === "major");
  const dayIndex = new Date().getDate() % majors.length;
  const card = majors[dayIndex] ?? tarotCards[0];
  return {
    cardSlug: card.slug,
    date: today,
    theme: "Принятие перемен",
    question: "Что вы готовы отпустить сегодня?",
    horoscopeHint: "",
    saved: false,
  };
}

export function getDailySymbol() {
  const today = new Date().toISOString().split("T")[0];
  const dayIndex = new Date().getDate() % dailySymbols.length;
  return {
    symbolSlug: dailySymbols[dayIndex],
    date: today,
  };
}

export const FREE_SPREAD_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function getSpreadCooldownRemaining(lastFreeSpreadAt: string | null): number {
  if (!lastFreeSpreadAt) return 0;
  const elapsed = Date.now() - new Date(lastFreeSpreadAt).getTime();
  return Math.max(0, FREE_SPREAD_COOLDOWN_MS - elapsed);
}

export function formatCooldown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
