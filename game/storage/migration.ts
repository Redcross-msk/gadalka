import type { GameState, AchievementState, DailyTaskState } from "@/types/game";
import { ACHIEVEMENTS, DAILY_TASK_POOL } from "@/game/data/achievements";
import { createSeededRng } from "@/game/generators/symbols";

export const SAVE_VERSION = 2;
export const SAVE_KEY = "gadalka-cabinet-save-v2";

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function createDefaultAchievements(): AchievementState[] {
  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    current: 0,
    completed: false,
    claimed: false,
  }));
}

export function pickDailyTasks(date: string, premium: boolean): DailyTaskState[] {
  const rng = createSeededRng(`daily-${date}`);
  const pool = [...DAILY_TASK_POOL];
  const count = premium ? 4 : 3;
  const picked: DailyTaskState[] = [];
  while (picked.length < count && pool.length) {
    const i = rng.int(0, pool.length - 1);
    const task = pool.splice(i, 1)[0]!;
    picked.push({ id: task.id, current: 0, completed: false, claimed: false });
  }
  return picked;
}

export function createDefaultState(): GameState {
  const now = Date.now();
  const date = todayKey();
  return {
    saveVersion: SAVE_VERSION,
    energy: 0,
    totalEnergyEarned: 0,
    totalClicks: 0,
    experience: 0,
    level: 1,
    archiveFragments: 0,
    archiveSeals: 0,
    clickCombo: 0,
    maxClickCombo: 0,
    lastClickAt: 0,
    objectLevels: { sign_book: 1 },
    unlockedObjects: ["sign_book"],
    collectedCards: [],
    collectedSymbols: [],
    completedRequests: 0,
    achievements: createDefaultAchievements(),
    dailyTasks: pickDailyTasks(date, false),
    dailyDate: date,
    loginStreak: 1,
    lastLoginDate: date,
    activeRequests: [],
    activeBonuses: [],
    currentEvent: null,
    lastEventAt: 0,
    lastSavedAt: now,
    lastPlayedAt: now,
    prestigeLevel: 0,
    currentRoom: "cabinet",
    profileSymbolSeed: null,
    displayName: "Хранитель",
    settings: {
      masterVolume: 0.6,
      clickSounds: true,
      animations: true,
      reducedMotion: false,
      compactMode: false,
      confirmLargePurchases: false,
      muted: false,
    },
    offline: { secondsAway: 0, amount: 0, pending: false },
    pendingReveal: null,
    sessionClicks: 0,
    metrics: {
      dayEnergy: 0,
      dayUpgrades: 0,
      dayRequests: 0,
      dayCards: 0,
      daySymbols: 0,
      dayCombo: 0,
      dayOffline: 0,
      dayEvents: 0,
      dayCardLevels: 0,
      totalUpgrades: 0,
    },
    cosmeticTheme: null,
    isPremiumDemo: false,
    tarotCenterLevel: 0,
  };
}

export function migrateSave(raw: unknown): GameState {
  const defaults = createDefaultState();
  if (!raw || typeof raw !== "object") return defaults;
  const data = raw as Partial<GameState>;
  const version = data.saveVersion ?? 0;
  if (version < 2) {
    return {
      ...defaults,
      ...data,
      saveVersion: SAVE_VERSION,
      objectLevels: { ...defaults.objectLevels, ...data.objectLevels },
      unlockedObjects: data.unlockedObjects?.length ? data.unlockedObjects : defaults.unlockedObjects,
      achievements: data.achievements?.length ? data.achievements : defaults.achievements,
      dailyTasks: data.dailyTasks?.length ? data.dailyTasks : defaults.dailyTasks,
      settings: { ...defaults.settings, ...data.settings },
      metrics: { ...defaults.metrics, ...data.metrics },
      offline: { ...defaults.offline, ...data.offline },
    };
  }
  return {
    ...defaults,
    ...data,
    objectLevels: { ...defaults.objectLevels, ...data.objectLevels },
    settings: { ...defaults.settings, ...data.settings },
    metrics: { ...defaults.metrics, ...data.metrics },
    offline: { ...defaults.offline, ...data.offline },
    saveVersion: SAVE_VERSION,
  };
}
