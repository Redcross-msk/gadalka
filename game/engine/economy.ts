import type {
  GameState,
  BonusType,
  RequestTool,
  CollectedCard,
  TemporaryBonus,
} from "@/types/game";
import { GAME_OBJECTS, getObjectDef } from "@/game/data/objects";
import { getCardDef } from "@/game/data/cards";
import { getRequestDef } from "@/game/data/requests";
import {
  calculateClickIncome,
  calculatePassiveIncome,
  calculateBulkCost,
  calculateMaxAffordableLevels,
  calculateExperienceForLevel,
  calculateRequestReward,
  calculateRequestDuration,
  calculateOfflineIncome,
  calculatePrestigeReward,
  cardLevelMultiplier,
  copiesNeededForNextLevel,
} from "@/game/formulas";
import { ACHIEVEMENTS, DAILY_TASK_POOL } from "@/game/data/achievements";
import { generateSimpleSymbol } from "@/game/generators/symbols";
import { GAME_CARDS } from "@/game/data/cards";
import { getTarotCenterBonuses } from "@/game/data/tarotCenters";

export function getActiveBonusMult(bonuses: TemporaryBonus[], type: BonusType): number {
  const now = Date.now();
  return bonuses
    .filter((b) => b.endsAt > now && b.type === type)
    .reduce((m, b) => m * b.multiplier, 1);
}

export function getCardBonusTotal(cards: CollectedCard[], bonus: string): number {
  let total = 0;
  for (const c of cards) {
    const def = getCardDef(c.id);
    if (!def || def.passiveBonus !== bonus) continue;
    total += def.bonusValue * cardLevelMultiplier(c.level);
  }
  return total;
}

export function getSymbolBonusTotal(state: GameState, bonus: BonusType): number {
  return state.collectedSymbols
    .filter((s) => s.passiveBonus === bonus)
    .reduce((sum, s) => sum + s.bonusValue, 0);
}

export function deriveIncomes(state: GameState) {
  const bookLevel = state.objectLevels.sign_book ?? 1;
  const candleLevel = state.unlockedObjects.includes("candle") ? state.objectLevels.candle ?? 0 : 0;
  const deckLevel = state.unlockedObjects.includes("deck") ? state.objectLevels.deck ?? 0 : 0;
  const clockLevel = state.unlockedObjects.includes("clock") ? state.objectLevels.clock ?? 0 : 0;
  const mirrorLevel = state.unlockedObjects.includes("mirror") ? state.objectLevels.mirror ?? 0 : 0;
  const windowLevel = state.unlockedObjects.includes("window") ? state.objectLevels.window ?? 0 : 0;

  let otherPassive = 0;
  if (deckLevel > 0) otherPassive += deckLevel * 0.15;
  if (mirrorLevel > 0) otherPassive += mirrorLevel * 0.08;
  if (windowLevel > 0) otherPassive += windowLevel * 0.1;

  let premiumClick = 1;
  let premiumPassive = 1;
  let premiumAll = 1;
  if (state.unlockedObjects.includes("premium_flame")) {
    premiumClick *= 1.5 + ((state.objectLevels.premium_flame ?? 1) - 1) * 0.08;
  }
  if (state.unlockedObjects.includes("premium_seal")) {
    premiumPassive *= 1.4 + ((state.objectLevels.premium_seal ?? 1) - 1) * 0.06;
  }
  if (state.unlockedObjects.includes("premium_veil")) {
    premiumAll *= 1.2 + ((state.objectLevels.premium_veil ?? 1) - 1) * 0.05;
  }

  const cardClick = 1 + getCardBonusTotal(state.collectedCards, "click_mult");
  const cardPassive = 1 + getCardBonusTotal(state.collectedCards, "passive_mult");
  const symClick = 1 + getSymbolBonusTotal(state, "click_mult");
  const symPassive = 1 + getSymbolBonusTotal(state, "passive_mult");
  const tempClick = getActiveBonusMult(state.activeBonuses, "click_mult");
  const tempPassive = getActiveBonusMult(state.activeBonuses, "passive_mult");
  const prestige = calculatePrestigeReward(state.prestigeLevel);
  const roomMult = state.currentRoom === "archive" ? 1.25 : 1;
  const tarot = getTarotCenterBonuses(state.tarotCenterLevel ?? 0);

  const energyPerClick = calculateClickIncome({
    baseClick: 1,
    bookLevel,
    deckLevel,
    cardMult: cardClick * premiumClick * tarot.clickMult,
    symbolMult: symClick,
    tempMult: tempClick * roomMult * premiumAll,
    prestigeMult: prestige,
    combo: state.clickCombo,
  });

  const energyPerSecond = calculatePassiveIncome({
    candleLevel,
    otherPassive,
    clockSpeed: clockLevel * 0.03,
    cardMult: cardPassive * premiumPassive * tarot.passiveMult,
    symbolMult: symPassive,
    tempMult: tempPassive * roomMult * premiumAll,
    prestigeMult: prestige,
  });

  return { energyPerClick, energyPerSecond, bookLevel, candleLevel, clockLevel, deckLevel };
}

export function canUnlockObject(state: GameState, objectId: string): boolean {
  const def = getObjectDef(objectId);
  if (!def || state.unlockedObjects.includes(objectId)) return false;
  if (def.premiumOnly && !state.isPremiumDemo) return false;
  const req = def.unlockRequirement;
  if (req.minLevel && state.level < req.minLevel) return false;
  if (req.totalEnergy && state.totalEnergyEarned < req.totalEnergy) return false;
  if (req.objectId) {
    if (!state.unlockedObjects.includes(req.objectId)) return false;
    if ((state.objectLevels[req.objectId] ?? 0) < (req.objectLevel ?? 1)) return false;
  }
  if (def.premiumOnly) return true;
  return state.energy >= def.unlockCost;
}

export function requestSlots(state: GameState): number {
  const cabinetLevel = state.unlockedObjects.includes("cabinet") ? state.objectLevels.cabinet ?? 0 : 0;
  let slots = 1;
  if (cabinetLevel >= 1) slots = 2;
  if (cabinetLevel >= 10 || state.isPremiumDemo) slots = Math.min(3, slots + (state.isPremiumDemo ? 1 : 0));
  if (cabinetLevel >= 10) slots = 3;
  return Math.min(3, slots);
}

export function toolQuality(
  requestId: string,
  tool: RequestTool
): "best" | "ok" | "weak" {
  const def = getRequestDef(requestId);
  if (!def) return "weak";
  if (def.bestTool === tool) return "best";
  if (def.okTools.includes(tool)) return "ok";
  return "weak";
}

export function syncAchievements(state: GameState): AchievementStatePatch[] {
  const metrics: Record<string, number> = {
    totalClicks: state.totalClicks,
    totalEnergyEarned: state.totalEnergyEarned,
    completedRequests: state.completedRequests,
    cardsCount: state.collectedCards.length,
    symbolsCount: state.collectedSymbols.length,
    maxClickCombo: state.maxClickCombo,
    loginStreak: state.loginStreak,
    prestigeLevel: state.prestigeLevel,
    level: state.level,
    unlockedCount: state.unlockedObjects.length,
    unlocked_candle: state.unlockedObjects.includes("candle") ? 1 : 0,
    cardMaxLevel: Math.max(0, ...state.collectedCards.map((c) => c.level), 0) >= 5 ? 1 : 0,
    totalUpgrades: state.metrics.totalUpgrades ?? 0,
  };

  return ACHIEVEMENTS.map((def) => {
    const current = metrics[def.metric] ?? 0;
    const prev = state.achievements.find((a) => a.id === def.id);
    const completed = current >= def.target;
    return {
      id: def.id,
      current: Math.min(current, def.target),
      completed,
      claimed: prev?.claimed ?? false,
    };
  });
}

type AchievementStatePatch = {
  id: string;
  current: number;
  completed: boolean;
  claimed: boolean;
};

export function bumpDaily(state: GameState, metric: string, amount = 1): GameState["metrics"] {
  const next = { ...state.metrics };
  next[metric] = (next[metric] ?? 0) + amount;
  return next;
}

export function syncDailyProgress(state: GameState): GameState["dailyTasks"] {
  return state.dailyTasks.map((t) => {
    const def = DAILY_TASK_POOL.find((d) => d.id === t.id);
    if (!def) return t;
    let current = t.current;
    if (def.metric === "sessionClicks") current = state.sessionClicks;
    else current = state.metrics[def.metric] ?? 0;
    const completed = current >= def.target;
    return { ...t, current: Math.min(current, def.target), completed };
  });
}

export function grantXp(state: GameState, amount: number): Pick<GameState, "experience" | "level"> {
  let experience = state.experience + amount;
  let level = state.level;
  let need = calculateExperienceForLevel(level);
  while (experience >= need && level < 50) {
    experience -= need;
    level += 1;
    need = calculateExperienceForLevel(level);
  }
  return { experience, level };
}

export function tryGrantCard(state: GameState, chance: number): { state: GameState; granted?: string } {
  if (Math.random() > chance) return { state };
  const owned = new Set(state.collectedCards.map((c) => c.id));
  const missing = GAME_CARDS.filter((c) => !owned.has(c.id));
  const pool = missing.length > 0 ? missing : GAME_CARDS;
  const pick = pool[Math.floor(Math.random() * pool.length)]!;
  const existing = state.collectedCards.find((c) => c.id === pick.id);
  let collectedCards: CollectedCard[];
  if (existing) {
    collectedCards = state.collectedCards.map((c) =>
      c.id === pick.id ? { ...c, copies: c.copies + 1 } : c
    );
  } else {
    collectedCards = [
      ...state.collectedCards,
      { id: pick.id, level: 1, copies: 0, collectedAt: new Date().toISOString() },
    ];
  }
  return {
    state: {
      ...state,
      collectedCards,
      metrics: bumpDaily(state, "dayCards"),
      pendingReveal: {
        type: "card",
        cardId: pick.id,
        title: pick.name,
        description: pick.description,
      },
    },
    granted: pick.id,
  };
}

export function tryGrantSymbol(state: GameState, chance: number, source: string): GameState {
  if (Math.random() > chance) return state;
  const seed = `${source}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const symbol = generateSimpleSymbol(seed, source);
  return {
    ...state,
    collectedSymbols: [...state.collectedSymbols, symbol],
    metrics: bumpDaily(state, "daySymbols"),
    pendingReveal: {
      type: "symbol",
      symbol,
      title: symbol.name,
      description: `Семейство: ${symbol.family}`,
    },
  };
}

export { calculateBulkCost, calculateMaxAffordableLevels, copiesNeededForNextLevel, calculateRequestDuration, calculateRequestReward, calculateOfflineIncome, calculatePrestigeReward, GAME_OBJECTS };
