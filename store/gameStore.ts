"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameState,
  GameSettings,
  RequestTool,
  RandomEventType,
  TemporaryBonus,
} from "@/types/game";
import {
  createDefaultState,
  migrateSave,
  pickDailyTasks,
  todayKey,
  SAVE_VERSION,
} from "@/game/storage/migration";
import { getObjectDef } from "@/game/data/objects";
import { getRequestDef, VISITOR_REQUESTS } from "@/game/data/requests";
import { getCardDef } from "@/game/data/cards";
import { DAILY_TASK_POOL, ACHIEVEMENTS } from "@/game/data/achievements";
import {
  deriveIncomes,
  canUnlockObject,
  requestSlots,
  toolQuality,
  syncAchievements,
  syncDailyProgress,
  bumpDaily,
  grantXp,
  tryGrantCard,
  tryGrantSymbol,
  calculateBulkCost,
  calculateMaxAffordableLevels,
  copiesNeededForNextLevel,
  calculateRequestDuration,
  calculateRequestReward,
  calculateOfflineIncome,
  getCardBonusTotal,
  getActiveBonusMult,
} from "@/game/engine/economy";
import { idleAudio } from "@/game/audio/idleAudio";
import { getNextTarotCenter, MAX_TAROT_CENTER } from "@/game/data/tarotCenters";

interface GameStore extends GameState {
  _hasHydrated: boolean;
  setHydrated: (v: boolean) => void;

  getEnergyPerClick: () => number;
  getEnergyPerSecond: () => number;

  clickBook: () => number;
  tickSecond: () => void;
  unlockObject: (id: string) => boolean;
  buyUpgrade: (id: string, count: 1 | 5 | "max") => boolean;
  unlockTarotCenter: () => boolean;
  startRequest: (requestId: string, tool: RequestTool) => boolean;
  claimRequest: (instanceId: string) => void;
  claimDaily: (id: string) => void;
  claimAchievement: (id: string) => void;
  claimOffline: () => void;
  dismissReveal: () => void;
  upgradeCard: (cardId: string) => boolean;
  handleEventAction: (action?: string) => void;
  spawnEventIfNeeded: () => void;
  openPrestige: () => { ok: boolean; reason?: string };
  confirmPrestige: () => void;
  setProfileSymbol: (seed: string) => void;
  updateSettings: (s: Partial<GameSettings>) => void;
  resetProgress: () => void;
  applyDemoCode: (code: string) => { ok: boolean; message: string };
  refreshLoginAndOffline: () => void;
  getAvailableRequests: () => typeof VISITOR_REQUESTS;
}

const COMBO_WINDOW = 1200;

function pruneBonuses(bonuses: TemporaryBonus[]): TemporaryBonus[] {
  const now = Date.now();
  return bonuses.filter((b) => b.endsAt > now);
}

export const useIdleGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),
      _hasHydrated: false,
      setHydrated: (v) => set({ _hasHydrated: v }),

      getEnergyPerClick: () => deriveIncomes(get()).energyPerClick,
      getEnergyPerSecond: () => deriveIncomes(get()).energyPerSecond,

      clickBook: () => {
        const state = get();
        idleAudio.unlock();
        if (state.settings.clickSounds) idleAudio.play("click");

        const now = Date.now();
        let combo = state.clickCombo;
        if (now - state.lastClickAt <= COMBO_WINDOW) combo += 1;
        else combo = 1;

        const withCombo = { ...state, clickCombo: combo, lastClickAt: now };
        const { energyPerClick } = deriveIncomes(withCombo);
        const gained = energyPerClick;
        const xpBatch = (state.totalClicks + 1) % 25 === 0 ? 3 : 0;
        const leveled = grantXp(state, xpBatch);

        let next: GameState = {
          ...state,
          ...leveled,
          energy: state.energy + gained,
          totalEnergyEarned: state.totalEnergyEarned + gained,
          totalClicks: state.totalClicks + 1,
          sessionClicks: state.sessionClicks + 1,
          clickCombo: combo,
          maxClickCombo: Math.max(state.maxClickCombo, combo),
          lastClickAt: now,
          metrics: {
            ...bumpDaily(state, "dayEnergy", gained),
            dayCombo: Math.max(state.metrics.dayCombo ?? 0, combo),
          },
        };
        next.achievements = syncAchievements(next);
        next.dailyTasks = syncDailyProgress(next);
        set(next);
        return gained;
      },

      tickSecond: () => {
        const state = get();
        const bonuses = pruneBonuses(state.activeBonuses);
        const { energyPerSecond } = deriveIncomes({ ...state, activeBonuses: bonuses });
        let energy = state.energy;
        let totalEnergyEarned = state.totalEnergyEarned;
        let metrics = state.metrics;
        if (energyPerSecond > 0) {
          energy += energyPerSecond;
          totalEnergyEarned += energyPerSecond;
          metrics = bumpDaily({ ...state, metrics }, "dayEnergy", energyPerSecond);
        }

        let combo = state.clickCombo;
        if (Date.now() - state.lastClickAt > COMBO_WINDOW && combo > 0) {
          combo = Math.max(0, combo - 2);
        }

        let next: GameState = {
          ...state,
          energy,
          totalEnergyEarned,
          metrics,
          clickCombo: combo,
          activeBonuses: bonuses,
          lastPlayedAt: Date.now(),
          lastSavedAt: Date.now(),
        };

        if (next.currentEvent && next.currentEvent.expiresAt < Date.now()) {
          next.currentEvent = null;
        }

        next.achievements = syncAchievements(next);
        next.dailyTasks = syncDailyProgress(next);
        set(next);
        get().spawnEventIfNeeded();
      },

      unlockObject: (id) => {
        const state = get();
        if (!canUnlockObject(state, id)) return false;
        const def = getObjectDef(id);
        if (!def) return false;
        idleAudio.play("buy");
        let next: GameState = {
          ...state,
          energy: state.energy - def.unlockCost,
          unlockedObjects: [...state.unlockedObjects, id],
          objectLevels: { ...state.objectLevels, [id]: 1 },
          metrics: bumpDaily(state, "dayUpgrades"),
        };
        next = { ...next, ...grantXp(next, 8), metrics: { ...next.metrics, totalUpgrades: (next.metrics.totalUpgrades ?? 0) + 1 } };
        next.achievements = syncAchievements(next);
        next.dailyTasks = syncDailyProgress(next);
        set(next);
        return true;
      },

      unlockTarotCenter: () => {
        const state = get();
        const level = state.tarotCenterLevel ?? 0;
        if (level >= MAX_TAROT_CENTER) return false;
        const nextTier = getNextTarotCenter(level);
        if (!nextTier || state.energy < nextTier.cost) return false;
        idleAudio.play("reward");
        let next: GameState = {
          ...state,
          energy: state.energy - nextTier.cost,
          tarotCenterLevel: level + 1,
          pendingReveal: {
            type: "reward",
            title: nextTier.name,
            description: `${nextTier.description} Клик ×${nextTier.clickMult}, авто ×${nextTier.passiveMult}.`,
          },
        };
        next = { ...next, ...grantXp(next, 50 + level * 25) };
        next.achievements = syncAchievements(next);
        set(next);
        return true;
      },

      buyUpgrade: (id, count) => {
        const state = get();
        const def = getObjectDef(id);
        if (!def || !state.unlockedObjects.includes(id)) return false;
        if (def.premiumOnly && !state.isPremiumDemo) return false;
        const level = state.objectLevels[id] ?? 0;
        if (level >= def.maxLevel) return false;

        let buyCount = 1;
        if (count === 5) buyCount = Math.min(5, def.maxLevel - level);
        if (count === "max") {
          buyCount = calculateMaxAffordableLevels(state.energy, def.baseCost, def.costGrowth, level, def.maxLevel);
        }
        if (buyCount <= 0) return false;

        const cost = calculateBulkCost(def.baseCost, def.costGrowth, level, buyCount, def.maxLevel);
        if (state.energy < cost) return false;

        if (state.settings.confirmLargePurchases && cost > state.energy * 0.5 && count === "max") {
          if (typeof window !== "undefined" && !window.confirm(`Потратить ${Math.floor(cost)} энергии?`)) {
            return false;
          }
        }

        idleAudio.play("buy");
        let next: GameState = {
          ...state,
          energy: state.energy - cost,
          objectLevels: { ...state.objectLevels, [id]: level + buyCount },
          metrics: {
            ...bumpDaily(state, "dayUpgrades", buyCount),
            totalUpgrades: (state.metrics.totalUpgrades ?? 0) + buyCount,
          },
        };
        next = { ...next, ...grantXp(next, buyCount * 2) };
        next.achievements = syncAchievements(next);
        next.dailyTasks = syncDailyProgress(next);
        set(next);
        return true;
      },

      startRequest: (requestId, tool) => {
        const state = get();
        const def = getRequestDef(requestId);
        if (!def) return false;
        if (state.activeRequests.filter((r) => !r.claimed).length >= requestSlots(state)) return false;
        if (state.activeRequests.some((r) => r.requestId === requestId && !r.claimed)) return false;

        const { clockLevel } = deriveIncomes(state);
        const timerBonus = getActiveBonusMult(state.activeBonuses, "timer_reduce") > 1
          ? 0.2
          : getCardBonusTotal(state.collectedCards, "timer_reduce");
        const duration = calculateRequestDuration(def.durationSec, clockLevel, timerBonus);
        const now = Date.now();
        idleAudio.play("request");

        set({
          activeRequests: [
            ...state.activeRequests,
            {
              instanceId: `${requestId}-${now}`,
              requestId,
              selectedTool: tool,
              startedAt: now,
              completesAt: now + duration * 1000,
              claimed: false,
            },
          ],
        });
        return true;
      },

      claimRequest: (instanceId) => {
        const state = get();
        const active = state.activeRequests.find((r) => r.instanceId === instanceId);
        if (!active || active.claimed || Date.now() < active.completesAt) return;
        const def = getRequestDef(active.requestId);
        if (!def) return;

        const quality = toolQuality(active.requestId, active.selectedTool);
        const dreamBonus =
          def.category === "dream" && state.unlockedObjects.includes("dream_book")
            ? (state.objectLevels.dream_book ?? 0) * 0.05 + getCardBonusTotal(state.collectedCards, "dream_reward")
            : getCardBonusTotal(state.collectedCards, "dream_reward") * (def.category === "dream" ? 1 : 0);
        const cardBonus = getCardBonusTotal(state.collectedCards, "request_reward");
        const reward = calculateRequestReward(def.baseReward, quality, dreamBonus, cardBonus);
        const fragments =
          state.unlockedObjects.includes("cabinet")
            ? 1 + Math.floor(getCardBonusTotal(state.collectedCards, "archive_fragments") * 3)
            : 0;

        idleAudio.play("reward");
        let next: GameState = {
          ...state,
          energy: state.energy + reward,
          totalEnergyEarned: state.totalEnergyEarned + reward,
          archiveFragments: state.archiveFragments + fragments,
          completedRequests: state.completedRequests + 1,
          activeRequests: state.activeRequests.map((r) =>
            r.instanceId === instanceId ? { ...r, claimed: true } : r
          ),
          metrics: bumpDaily(state, "dayRequests"),
          pendingReveal: {
            type: "reward",
            title: "Обращение завершено",
            description: `${def.name}: +${Math.floor(reward)} энергии`,
            energy: reward,
            xp: def.xpReward,
          },
        };
        next = { ...next, ...grantXp(next, def.xpReward) };

        const cardChance =
          (quality === "best" ? 0.45 : quality === "ok" ? 0.25 : 0.1) *
          (1 + getCardBonusTotal(state.collectedCards, "card_chance") + getActiveBonusMult(state.activeBonuses, "card_chance") - 1);
        const cardResult = tryGrantCard(next, Math.min(0.75, def.bonusChance * (quality === "best" ? 1.2 : 1) + cardChance * 0.2));
        next = cardResult.state;
        if (!cardResult.granted) {
          const symChance =
            0.2 +
            getCardBonusTotal(state.collectedCards, "symbol_chance") +
            (state.unlockedObjects.includes("mirror") ? (state.objectLevels.mirror ?? 0) * 0.01 : 0);
          next = tryGrantSymbol(next, Math.min(0.55, symChance), `request-${def.id}`);
        }

        next.achievements = syncAchievements(next);
        next.dailyTasks = syncDailyProgress(next);
        set(next);
      },

      claimDaily: (id) => {
        const state = get();
        const task = state.dailyTasks.find((t) => t.id === id);
        const def = DAILY_TASK_POOL.find((d) => d.id === id);
        if (!task || !def || !task.completed || task.claimed) return;
        idleAudio.play("reward");
        let next: GameState = {
          ...state,
          energy: state.energy + def.rewardEnergy,
          totalEnergyEarned: state.totalEnergyEarned + def.rewardEnergy,
          dailyTasks: state.dailyTasks.map((t) => (t.id === id ? { ...t, claimed: true } : t)),
        };
        next = { ...next, ...grantXp(next, def.rewardXp) };
        set(next);
      },

      claimAchievement: (id) => {
        const state = get();
        const ach = state.achievements.find((a) => a.id === id);
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!ach || !def || !ach.completed || ach.claimed) return;
        idleAudio.play("reward");
        let next: GameState = {
          ...state,
          energy: state.energy + (def.rewardEnergy ?? 0),
          totalEnergyEarned: state.totalEnergyEarned + (def.rewardEnergy ?? 0),
          archiveFragments: state.archiveFragments + (def.rewardFragments ?? 0),
          achievements: state.achievements.map((a) => (a.id === id ? { ...a, claimed: true } : a)),
        };
        next = { ...next, ...grantXp(next, def.rewardXp ?? 0) };
        set(next);
      },

      claimOffline: () => {
        const state = get();
        if (!state.offline.pending) return;
        idleAudio.play("reward");
        const amount = state.offline.amount;
        let next: GameState = {
          ...state,
          energy: state.energy + amount,
          totalEnergyEarned: state.totalEnergyEarned + amount,
          offline: { secondsAway: 0, amount: 0, pending: false },
          metrics: bumpDaily(state, "dayOffline"),
        };
        next.dailyTasks = syncDailyProgress(next);
        set(next);
      },

      dismissReveal: () => set({ pendingReveal: null }),

      upgradeCard: (cardId) => {
        const state = get();
        const card = state.collectedCards.find((c) => c.id === cardId);
        if (!card || card.level >= 5) return false;
        const need = copiesNeededForNextLevel(card.level);
        if (card.copies < need) return false;
        idleAudio.play("card");
        let next: GameState = {
          ...state,
          collectedCards: state.collectedCards.map((c) =>
            c.id === cardId ? { ...c, level: c.level + 1, copies: c.copies - need } : c
          ),
          metrics: bumpDaily(state, "dayCardLevels"),
        };
        next = { ...next, ...grantXp(next, 15) };
        next.achievements = syncAchievements(next);
        next.dailyTasks = syncDailyProgress(next);
        set(next);
        return true;
      },

      handleEventAction: (action) => {
        const state = get();
        const event = state.currentEvent;
        if (!event) return;
        const now = Date.now();

        if (event.type === "candle_out") {
          const progress = event.progress + 1;
          if (progress >= 3) {
            const bonus: TemporaryBonus = {
              id: `bonus-${now}`,
              type: "passive_mult",
              multiplier: 2,
              label: "×2 автодоход",
              startedAt: now,
              endsAt: now + 60000,
            };
            set({
              currentEvent: null,
              activeBonuses: [...pruneBonuses(state.activeBonuses), bonus],
              metrics: bumpDaily(state, "dayEvents"),
            });
            idleAudio.play("reward");
          } else {
            set({ currentEvent: { ...event, progress } });
          }
          return;
        }

        if (event.type === "mirror_sign") {
          let next = tryGrantSymbol(
            { ...state, currentEvent: null, metrics: bumpDaily(state, "dayEvents") },
            0.85,
            "event-mirror"
          );
          next.dailyTasks = syncDailyProgress(next);
          set(next);
          idleAudio.play("symbol");
          return;
        }

        if (event.type === "open_book") {
          const pick = action === "xp" ? "xp" : action === "bonus" ? "bonus" : "energy";
          let next: GameState = { ...state, currentEvent: null, metrics: bumpDaily(state, "dayEvents") };
          if (pick === "energy") {
            next.energy += 120;
            next.totalEnergyEarned += 120;
          } else if (pick === "xp") {
            next = { ...next, ...grantXp(next, 25) };
          } else {
            next.activeBonuses = [
              ...pruneBonuses(next.activeBonuses),
              {
                id: `bonus-${now}`,
                type: "click_mult",
                multiplier: 2,
                label: "×2 клики",
                startedAt: now,
                endsAt: now + 30000,
              },
            ];
          }
          next.dailyTasks = syncDailyProgress(next);
          set(next);
          idleAudio.play("reward");
          return;
        }

        if (event.type === "stopped_clock") {
          set({
            currentEvent: null,
            activeRequests: state.activeRequests.map((r) =>
              r.claimed ? r : { ...r, completesAt: Math.max(now, r.completesAt - 20000) }
            ),
            metrics: bumpDaily(state, "dayEvents"),
          });
          idleAudio.play("reward");
          return;
        }

        if (event.type === "urgent_visitor") {
          const req = VISITOR_REQUESTS[Math.floor(Math.random() * VISITOR_REQUESTS.length)]!;
          get().startRequest(req.id, req.bestTool);
          let next = { ...get(), currentEvent: null as null, metrics: bumpDaily(get(), "dayEvents") };
          next = { ...next, ...grantXp(next, 20) };
          set(next);
          return;
        }

        if (event.type === "window_light") {
          const types: TemporaryBonus["type"][] = ["click_mult", "passive_mult", "xp_mult"];
          const type = types[Math.floor(Math.random() * types.length)]!;
          set({
            currentEvent: null,
            activeBonuses: [
              ...pruneBonuses(state.activeBonuses),
              {
                id: `bonus-${now}`,
                type,
                multiplier: 2,
                label: type === "click_mult" ? "×2 клики" : type === "passive_mult" ? "×2 авто" : "×2 опыт",
                startedAt: now,
                endsAt: now + 45000,
              },
            ],
            metrics: bumpDaily(state, "dayEvents"),
          });
          idleAudio.play("reward");
        }
      },

      spawnEventIfNeeded: () => {
        const state = get();
        if (state.currentEvent) return;
        const now = Date.now();
        const gap = 60000 + Math.random() * 60000;
        if (now - state.lastEventAt < gap) return;
        if (!state.unlockedObjects.includes("candle")) return;
        if (Math.random() > 0.08) return;

        const mirrorBoost = state.unlockedObjects.includes("mirror") ? 0.15 : 0;
        const windowBoost = state.unlockedObjects.includes("window") ? 0.1 : 0;
        if (Math.random() > 0.35 + mirrorBoost + windowBoost) return;

        const types: RandomEventType[] = ["candle_out", "open_book", "stopped_clock", "window_light"];
        if (state.unlockedObjects.includes("mirror")) types.push("mirror_sign");
        if (state.unlockedObjects.includes("door")) types.push("urgent_visitor");
        const type = types[Math.floor(Math.random() * types.length)]!;

        set({
          lastEventAt: now,
          currentEvent: {
            id: `ev-${now}`,
            type,
            startedAt: now,
            expiresAt: now + 20000,
            progress: 0,
          },
        });
      },

      openPrestige: () => {
        const state = get();
        const needEnergy = 8000 + state.prestigeLevel * 5000;
        if (state.totalEnergyEarned < needEnergy) {
          return { ok: false, reason: `Нужно заработать всего ${needEnergy} энергии` };
        }
        if (state.unlockedObjects.length < 5) {
          return { ok: false, reason: "Откройте минимум 5 предметов кабинета" };
        }
        if (state.level < 4) {
          return { ok: false, reason: "Нужен уровень 4 или выше" };
        }
        return { ok: true };
      },

      confirmPrestige: () => {
        const check = get().openPrestige();
        if (!check.ok) return;
        const state = get();
        idleAudio.play("reward");
        set({
          energy: 0,
          objectLevels: { sign_book: 1 },
          unlockedObjects: ["sign_book"],
          activeBonuses: [],
          activeRequests: [],
          currentEvent: null,
          clickCombo: 0,
          prestigeLevel: state.prestigeLevel + 1,
          archiveSeals: state.archiveSeals + 1,
          tarotCenterLevel: state.tarotCenterLevel,
          currentRoom: state.prestigeLevel + 1 >= 1 ? "archive" : "cabinet",
          pendingReveal: {
            type: "reward",
            title: "Новая глава архива",
            description: "Получена Печать архива. Постоянный множитель дохода увеличен.",
          },
        });
      },

      setProfileSymbol: (seed) => set({ profileSymbolSeed: seed }),

      updateSettings: (partial) => {
        const settings = { ...get().settings, ...partial };
        idleAudio.configure({
          volume: settings.masterVolume,
          muted: settings.muted,
          enabled: settings.clickSounds,
        });
        set({ settings });
      },

      resetProgress: () => {
        set({ ...createDefaultState(), _hasHydrated: true });
      },

      applyDemoCode: (code) => {
        const normalized = code.trim().toUpperCase();
        const state = get();
        if (normalized === "GADALKA-GAME-CARD-2026") {
          if (state.collectedCards.some((c) => c.id === "key")) {
            return { ok: false, message: "Карта «Ключ» уже есть" };
          }
          const result = tryGrantCard(
            {
              ...state,
              collectedCards: state.collectedCards,
            },
            1
          );
          // Force key card
          const next: GameState = {
            ...state,
            collectedCards: [
              ...state.collectedCards.filter((c) => c.id !== "key"),
              { id: "key", level: 1, copies: 0, collectedAt: new Date().toISOString() },
            ],
            pendingReveal: {
              type: "card",
              cardId: "key",
              title: "Ключ",
              description: getCardDef("key")?.description,
            },
          };
          set(next);
          idleAudio.play("card");
          return { ok: true, message: "Открыта карта «Ключ»" };
        }
        if (normalized === "GADALKA-GAME-SYMBOL-2026") {
          const next = tryGrantSymbol(state, 1, "demo-code");
          set(next);
          idleAudio.play("symbol");
          return { ok: true, message: "Получен редкий знак" };
        }
        if (normalized === "GADALKA-GAME-ROOM-2026") {
          set({ cosmeticTheme: "brass-archive" });
          return { ok: true, message: "Открыто оформление кабинета" };
        }
        return { ok: false, message: "Код не найден" };
      },

      refreshLoginAndOffline: () => {
        const state = get();
        const now = Date.now();
        const date = todayKey();
        const { energyPerSecond } = deriveIncomes(state);
        const awaySec = Math.max(0, (now - (state.lastPlayedAt || now)) / 1000);
        const efficiency = state.isPremiumDemo ? 0.8 : 0.5;
        const maxHours = state.isPremiumDemo ? 12 : 8;
        const offline = calculateOfflineIncome(energyPerSecond, awaySec, efficiency, maxHours);

        let loginStreak = state.loginStreak;
        let lastLoginDate = state.lastLoginDate;
        let dailyTasks = state.dailyTasks;
        let dailyDate = state.dailyDate;
        let metrics = state.metrics;
        let sessionClicks = state.sessionClicks;

        if (lastLoginDate !== date) {
          const yesterday = todayKey(new Date(Date.now() - 86400000));
          loginStreak = lastLoginDate === yesterday ? loginStreak + 1 : 1;
          lastLoginDate = date;
          dailyDate = date;
          dailyTasks = pickDailyTasks(date, state.isPremiumDemo);
          sessionClicks = 0;
          metrics = {
            ...metrics,
            dayEnergy: 0,
            dayUpgrades: 0,
            dayRequests: 0,
            dayCards: 0,
            daySymbols: 0,
            dayCombo: 0,
            dayOffline: 0,
            dayEvents: 0,
            dayCardLevels: 0,
          };
        }

        set({
          loginStreak,
          lastLoginDate,
          dailyDate,
          dailyTasks,
          sessionClicks,
          metrics,
          lastPlayedAt: now,
          offline:
            offline.amount > 0 && awaySec > 15
              ? { secondsAway: offline.seconds, amount: offline.amount, pending: true }
              : state.offline.pending
                ? state.offline
                : { secondsAway: 0, amount: 0, pending: false },
        });
      },

      getAvailableRequests: () => {
        const state = get();
        const activeIds = new Set(state.activeRequests.filter((r) => !r.claimed).map((r) => r.requestId));
        const unlockedTools = new Set<string>(["sign_book"]);
        if (state.unlockedObjects.includes("deck")) unlockedTools.add("deck");
        if (state.unlockedObjects.includes("mirror")) unlockedTools.add("mirror");
        if (state.unlockedObjects.includes("dream_book")) unlockedTools.add("dream_book");
        if (state.unlockedObjects.includes("cabinet")) unlockedTools.add("archive");

        return VISITOR_REQUESTS.filter((r) => {
          if (activeIds.has(r.id)) return false;
          if (state.level < 2 && r.durationSec > 60) return false;
          return unlockedTools.has(r.bestTool) || r.okTools.some((t) => unlockedTools.has(t));
        }).slice(0, 6);
      },
    }),
    {
      name: "gadalka-cabinet-save-v2",
      version: SAVE_VERSION,
      migrate: (persisted) => migrateSave(persisted),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state) {
          idleAudio.configure({
            volume: state.settings.masterVolume,
            muted: state.settings.muted,
            enabled: state.settings.clickSounds,
          });
          state.refreshLoginAndOffline();
        }
      },
      partialize: (state) => {
        const { _hasHydrated, setHydrated, getEnergyPerClick, getEnergyPerSecond, clickBook, tickSecond, unlockObject, buyUpgrade, unlockTarotCenter, startRequest, claimRequest, claimDaily, claimAchievement, claimOffline, dismissReveal, upgradeCard, handleEventAction, spawnEventIfNeeded, openPrestige, confirmPrestige, setProfileSymbol, updateSettings, resetProgress, applyDemoCode, refreshLoginAndOffline, getAvailableRequests, ...rest } = state;
        void _hasHydrated;
        void setHydrated;
        void getEnergyPerClick;
        void getEnergyPerSecond;
        void clickBook;
        void tickSecond;
        void unlockObject;
        void buyUpgrade;
        void unlockTarotCenter;
        void startRequest;
        void claimRequest;
        void claimDaily;
        void claimAchievement;
        void claimOffline;
        void dismissReveal;
        void upgradeCard;
        void handleEventAction;
        void spawnEventIfNeeded;
        void openPrestige;
        void confirmPrestige;
        void setProfileSymbol;
        void updateSettings;
        void resetProgress;
        void applyDemoCode;
        void refreshLoginAndOffline;
        void getAvailableRequests;
        return rest as GameState;
      },
    }
  )
);

export function useIdleHydrated() {
  return useIdleGameStore((s) => s._hasHydrated);
}
