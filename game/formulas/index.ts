/** Readable game numbers: 1 250 · 18,4 тыс. · 2,1 млн */
export function formatGameNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return Math.floor(n).toLocaleString("ru-RU");
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} тыс.`;
  }
  if (n < 1_000_000_000) {
    const v = n / 1_000_000;
    return `${v.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млн`;
  }
  const v = n / 1_000_000_000;
  return `${v.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млрд`;
}

export function calculateUpgradeCost(baseCost: number, costGrowth: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(costGrowth, currentLevel));
}

export function calculateMaxAffordableLevels(
  energy: number,
  baseCost: number,
  costGrowth: number,
  currentLevel: number,
  maxLevel: number,
  limit = 100
): number {
  let spent = 0;
  let levels = 0;
  let lvl = currentLevel;
  while (lvl < maxLevel && levels < limit) {
    const cost = calculateUpgradeCost(baseCost, costGrowth, lvl);
    if (spent + cost > energy) break;
    spent += cost;
    levels += 1;
    lvl += 1;
  }
  return levels;
}

export function calculateBulkCost(
  baseCost: number,
  costGrowth: number,
  currentLevel: number,
  count: number,
  maxLevel: number
): number {
  const actual = Math.min(count, maxLevel - currentLevel);
  let total = 0;
  for (let i = 0; i < actual; i++) {
    total += calculateUpgradeCost(baseCost, costGrowth, currentLevel + i);
  }
  return total;
}

export function calculateExperienceForLevel(level: number): number {
  return Math.floor(80 + level * 45 + Math.pow(level, 1.45) * 12);
}

export const RANK_LABELS = [
  "Посетитель",
  "Наблюдатель",
  "Исследователь",
  "Толкователь",
  "Хранитель",
  "Хранитель архива",
] as const;

export function getRankLabel(level: number): string {
  if (level <= 2) return RANK_LABELS[0];
  if (level <= 5) return RANK_LABELS[1];
  if (level <= 10) return RANK_LABELS[2];
  if (level <= 18) return RANK_LABELS[3];
  if (level <= 28) return RANK_LABELS[4];
  return RANK_LABELS[5];
}

export function comboMultiplier(combo: number): number {
  if (combo >= 1000) return 5;
  if (combo >= 500) return 4;
  if (combo >= 250) return 3;
  if (combo >= 100) return 2.5;
  if (combo >= 50) return 2;
  if (combo >= 25) return 1.5;
  if (combo >= 10) return 1.2;
  return 1;
}

export function calculateClickIncome(params: {
  baseClick: number;
  bookLevel: number;
  deckLevel: number;
  cardMult: number;
  symbolMult: number;
  tempMult: number;
  prestigeMult: number;
  combo: number;
}): number {
  // Книга: каждый уровень заметно усиливает клик
  const bookPower = 1 + (params.bookLevel - 1) * 0.7;
  // Колода: дополнительный множитель к клику
  const deckPower = 1 + params.deckLevel * 0.15;
  return Math.max(
    1,
    Math.floor(
      params.baseClick *
        bookPower *
        deckPower *
        params.cardMult *
        params.symbolMult *
        params.tempMult *
        params.prestigeMult *
        comboMultiplier(params.combo)
    )
  );
}

export function calculatePassiveIncome(params: {
  candleLevel: number;
  otherPassive: number;
  clockSpeed: number;
  cardMult: number;
  symbolMult: number;
  tempMult: number;
  prestigeMult: number;
}): number {
  const candle = params.candleLevel > 0 ? 1 + (params.candleLevel - 1) * 0.85 : 0;
  const raw = (candle + params.otherPassive) * (1 + params.clockSpeed) * params.cardMult * params.symbolMult * params.tempMult * params.prestigeMult;
  return Math.max(0, Math.floor(raw * 100) / 100);
}

export function calculateRequestReward(
  base: number,
  toolQuality: "best" | "ok" | "weak",
  dreamBookBonus: number,
  cardBonus: number
): number {
  const q = toolQuality === "best" ? 1 : toolQuality === "ok" ? 0.7 : 0.4;
  return Math.floor(base * q * (1 + dreamBookBonus) * (1 + cardBonus));
}

export function calculateRequestDuration(
  baseSec: number,
  clockLevel: number,
  timerBonus: number
): number {
  const reduce = Math.min(0.45, clockLevel * 0.02 + timerBonus);
  return Math.max(8, Math.floor(baseSec * (1 - reduce)));
}

export function calculateOfflineIncome(
  energyPerSecond: number,
  secondsAway: number,
  efficiency = 0.5,
  maxHours = 8
): { seconds: number; amount: number } {
  const capped = Math.min(secondsAway, maxHours * 3600);
  return {
    seconds: Math.floor(capped),
    amount: Math.floor(energyPerSecond * capped * efficiency),
  };
}

export function calculatePrestigeReward(prestigeLevel: number): number {
  return 1 + prestigeLevel * 0.12;
}

export function copiesNeededForNextLevel(level: number): number {
  if (level >= 5) return 0;
  const map = [0, 2, 3, 5, 8];
  return map[level] ?? 8;
}

export function cardLevelMultiplier(level: number): number {
  return 1 + (level - 1) * 0.25;
}
