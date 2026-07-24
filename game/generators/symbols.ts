import type { CollectedSymbol, Rarity, SymbolFamily, BonusType } from "@/types/game";

const FAMILIES: SymbolFamily[] = ["path", "memory", "connection", "decision", "warning", "change", "mystery"];
const FAMILY_LABELS: Record<SymbolFamily, string> = {
  path: "Путь",
  memory: "Память",
  connection: "Связь",
  decision: "Решение",
  warning: "Предупреждение",
  change: "Изменение",
  mystery: "Тайна",
};
const NAMES_A = ["Тихий", "Скрытый", "Старый", "Тонкий", "Глубокий", "Ночной", "Мягкий"];
const NAMES_B = ["контур", "круг", "узел", "луч", "след", "знак", "разрыв"];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seed: string) {
  let state = hash(seed) || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T>(arr: T[]) => arr[Math.floor(next() * arr.length)]!,
  };
}

export function generateSimpleSymbol(seed: string, source: string): CollectedSymbol {
  const rng = createSeededRng(seed);
  const family = rng.pick(FAMILIES);
  const roll = rng.next();
  const rarity: Rarity = roll > 0.92 ? "archival" : roll > 0.75 ? "rare" : roll > 0.45 ? "uncommon" : "common";
  const bonuses: BonusType[] = ["click_mult", "passive_mult", "xp_mult", "card_chance", "symbol_chance"];
  const passiveBonus = rng.pick(bonuses);
  const bonusValue = 0.02 + rng.next() * 0.06 + (rarity === "rare" ? 0.03 : 0) + (rarity === "archival" ? 0.05 : 0);

  return {
    id: `sym-${seed}`,
    seed,
    family,
    name: `${rng.pick(NAMES_A)} ${rng.pick(NAMES_B)}`,
    rarity,
    passiveBonus,
    bonusValue: Math.round(bonusValue * 1000) / 1000,
    collectedAt: new Date().toISOString(),
    source,
  };
}

export { FAMILY_LABELS };

export interface SymbolGeometry {
  outer: "circle" | "diamond";
  rings: number;
  dots: Array<{ x: number; y: number; r: number }>;
  strokes: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  hasV: boolean;
  hasH: boolean;
}

export function getSymbolGeometry(seed: string): SymbolGeometry {
  const rng = createSeededRng(seed);
  const dots = Array.from({ length: rng.int(2, 6) }, () => ({
    x: 50 + Math.cos(rng.next() * Math.PI * 2) * rng.int(8, 28),
    y: 50 + Math.sin(rng.next() * Math.PI * 2) * rng.int(8, 28),
    r: 1 + rng.next() * 1.5,
  }));
  const strokes = Array.from({ length: rng.int(1, 4) }, () => {
    const a = rng.next() * Math.PI * 2;
    return {
      x1: 50 + Math.cos(a) * 12,
      y1: 50 + Math.sin(a) * 12,
      x2: 50 + Math.cos(a) * 30,
      y2: 50 + Math.sin(a) * 30,
    };
  });
  return {
    outer: rng.next() > 0.5 ? "circle" : "diamond",
    rings: rng.int(1, 3),
    dots,
    strokes,
    hasV: true,
    hasH: rng.next() > 0.35,
  };
}
