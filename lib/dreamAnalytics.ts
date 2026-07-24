import { dreamMoods } from "@/data/dreams";
import type { Dream, DreamMood } from "@/types";

const moodMeta: Record<
  DreamMood,
  { label: string; emoji: string; color: string; tone: "positive" | "negative" | "neutral"; atmosphere: "vivid" | "mysterious" | "heavy" }
> = {
  peaceful: { label: "Спокойный", emoji: "🌙", color: "#7ab8a8", tone: "positive", atmosphere: "vivid" },
  joyful: { label: "Радостный", emoji: "☀️", color: "#d8bc78", tone: "positive", atmosphere: "vivid" },
  mysterious: { label: "Загадочный", emoji: "✨", color: "#9a7ab8", tone: "neutral", atmosphere: "mysterious" },
  neutral: { label: "Нейтральный", emoji: "🍃", color: "#a09890", tone: "neutral", atmosphere: "mysterious" },
  anxious: { label: "Тревожный", emoji: "🌊", color: "#5a8ab0", tone: "negative", atmosphere: "heavy" },
  sad: { label: "Грустный", emoji: "🌧️", color: "#955868", tone: "negative", atmosphere: "heavy" },
};

export type DreamAnalytics = {
  total: number;
  moodBreakdown: {
    mood: DreamMood;
    count: number;
    pct: number;
    label: string;
    emoji: string;
    color: string;
  }[];
  tone: { positive: number; negative: number; neutral: number };
  atmosphere: { vivid: number; mysterious: number; heavy: number };
  recurringRate: number;
  topSymbols: { symbol: string; count: number }[];
  topThemes: { theme: string; count: number }[];
  topEmotions: { emotion: string; count: number }[];
  sleepProfile: {
    title: string;
    description: string;
    score: number;
    traits: string[];
  };
  monthlyActivity: { label: string; count: number }[];
};

function countBy<T extends string>(items: T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const item of items) {
    result[item] = (result[item] ?? 0) + 1;
  }
  return result;
}

function topEntries(map: Record<string, number>, limit = 5) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function buildSleepProfile(
  dreams: Dream[],
  tone: DreamAnalytics["tone"],
  atmosphere: DreamAnalytics["atmosphere"],
  recurringRate: number
): DreamAnalytics["sleepProfile"] {
  const total = dreams.length;
  const positiveShare = total ? (tone.positive / total) * 100 : 0;
  const heavyShare = total ? (atmosphere.heavy / total) * 100 : 0;
  const vividShare = total ? (atmosphere.vivid / total) * 100 : 0;
  const mysteriousShare = total ? (atmosphere.mysterious / total) * 100 : 0;

  const traits: string[] = [];
  if (recurringRate >= 25) traits.push("Повторяющиеся образы");
  if (vividShare >= 40) traits.push("Яркие сновидения");
  if (mysteriousShare >= 35) traits.push("Символический сон");
  if (heavyShare >= 30) traits.push("Эмоциональная глубина");
  if (positiveShare >= 50) traits.push("Восстановительный отдых");

  let title = "Наблюдатель снов";
  let description =
    "Ваши записи показывают сбалансированный сон: образы меняются, но подсознание говорит ровным голосом.";
  let score = 62;

  if (vividShare >= 45 && positiveShare >= 45) {
    title = "Светлый сновидец";
    description =
      "Сны чаще радостные и спокойные — сон восстанавливает силы и оставляет тёплое послевкусие.";
    score = 82;
  } else if (mysteriousShare >= 40) {
    title = "Исследователь глубины";
    description =
      "Преобладают загадочные и символические сны. Подсознание любит метафоры и скрытые послания.";
    score = 71;
  } else if (heavyShare >= 35) {
    title = "Чуткий сон";
    description =
      "Сны несут много эмоций — тревога и грусть встречаются чаще. Полезно вечером отпускать день.";
    score = 48;
  } else if (recurringRate >= 30) {
    title = "Повторяющийся сюжет";
    description =
      "Одни и те же мотивы возвращаются — подсознание настойчиво просит внимания к важной теме.";
    score = 58;
  }

  if (traits.length === 0) traits.push("Формируется профиль");

  return { title, description, score, traits };
}

export function computeDreamAnalytics(dreams: Dream[]): DreamAnalytics | null {
  if (dreams.length === 0) return null;

  const moodCounts = countBy(dreams.map((d) => d.mood));
  const total = dreams.length;

  const moodBreakdown = (Object.keys(moodMeta) as DreamMood[]).map((mood) => {
    const count = moodCounts[mood] ?? 0;
    return {
      mood,
      count,
      pct: Math.round((count / total) * 100),
      ...moodMeta[mood],
    };
  }).filter((m) => m.count > 0);

  const tone = { positive: 0, negative: 0, neutral: 0 };
  const atmosphere = { vivid: 0, mysterious: 0, heavy: 0 };

  for (const dream of dreams) {
    const meta = moodMeta[dream.mood];
    tone[meta.tone] += 1;
    atmosphere[meta.atmosphere] += 1;
  }

  const symbolMap: Record<string, number> = {};
  const themeMap: Record<string, number> = {};
  const emotionMap: Record<string, number> = {};

  for (const dream of dreams) {
    for (const symbol of dream.symbols) {
      symbolMap[symbol] = (symbolMap[symbol] ?? 0) + 1;
    }
    for (const theme of dream.analysis?.themes ?? []) {
      themeMap[theme] = (themeMap[theme] ?? 0) + 1;
    }
    for (const emotion of dream.analysis?.emotions ?? []) {
      emotionMap[emotion] = (emotionMap[emotion] ?? 0) + 1;
    }
  }

  const monthMap: Record<string, number> = {};
  for (const dream of dreams) {
    const date = new Date(dream.date);
    const label = date.toLocaleDateString("ru-RU", { month: "short" });
    monthMap[label] = (monthMap[label] ?? 0) + 1;
  }

  const monthlyActivity = Object.entries(monthMap)
    .slice(-6)
    .map(([label, count]) => ({ label, count }));

  const recurringRate = Math.round((dreams.filter((d) => d.recurring).length / total) * 100);

  return {
    total,
    moodBreakdown,
    tone,
    atmosphere,
    recurringRate,
    topSymbols: topEntries(symbolMap).map(({ key, count }) => ({ symbol: key, count })),
    topThemes: topEntries(themeMap).map(({ key, count }) => ({ theme: key, count })),
    topEmotions: topEntries(emotionMap).map(({ key, count }) => ({ emotion: key, count })),
    sleepProfile: buildSleepProfile(dreams, tone, atmosphere, recurringRate),
    monthlyActivity,
  };
}

export function getMoodLabel(mood: DreamMood) {
  return dreamMoods.find((m) => m.id === mood)?.name ?? moodMeta[mood].label;
}
