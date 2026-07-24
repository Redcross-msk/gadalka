export interface TarotCenterTier {
  level: number;
  name: string;
  description: string;
  cost: number;
  clickMult: number;
  passiveMult: number;
}

/** 5 Таро-центров — долгосрочная цель для кликов */
export const TAROT_CENTERS: TarotCenterTier[] = [
  {
    level: 1,
    name: "Таро-центр I",
    description: "Первый круг карт. Усиливает клики и автодоход.",
    cost: 1_000_000,
    clickMult: 1.5,
    passiveMult: 1.35,
  },
  {
    level: 2,
    name: "Таро-центр II",
    description: "Расширенный стол. Знаки отвечают быстрее.",
    cost: 5_000_000,
    clickMult: 2.2,
    passiveMult: 1.8,
  },
  {
    level: 3,
    name: "Таро-центр III",
    description: "Зал отражений. Глубже множители энергии.",
    cost: 25_000_000,
    clickMult: 3.5,
    passiveMult: 2.6,
  },
  {
    level: 4,
    name: "Таро-центр IV",
    description: "Архивный круг. Почти предел кабинета.",
    cost: 100_000_000,
    clickMult: 5.5,
    passiveMult: 4,
  },
  {
    level: 5,
    name: "Таро-центр V",
    description: "Высший Таро-центр. Максимальная сила кабинета.",
    cost: 500_000_000,
    clickMult: 9,
    passiveMult: 6.5,
  },
];

export const MAX_TAROT_CENTER = TAROT_CENTERS.length;

export function getTarotCenterTier(level: number): TarotCenterTier | undefined {
  return TAROT_CENTERS.find((t) => t.level === level);
}

export function getNextTarotCenter(currentLevel: number): TarotCenterTier | null {
  if (currentLevel >= MAX_TAROT_CENTER) return null;
  return TAROT_CENTERS[currentLevel] ?? null;
}

/** Суммарные множители от уже открытых центров (1..currentLevel) */
export function getTarotCenterBonuses(currentLevel: number): { clickMult: number; passiveMult: number } {
  let clickMult = 1;
  let passiveMult = 1;
  for (const tier of TAROT_CENTERS) {
    if (tier.level > currentLevel) break;
    clickMult *= tier.clickMult;
    passiveMult *= tier.passiveMult;
  }
  return { clickMult, passiveMult };
}
