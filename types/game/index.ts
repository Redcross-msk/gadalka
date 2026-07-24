export type IncomeType = "click" | "passive" | "hybrid" | "utility";

export type RequestCategory =
  | "dream"
  | "relationship"
  | "family"
  | "decision"
  | "found_item"
  | "repeating_sign"
  | "past_event"
  | "coincidence";

export type RequestTool = "deck" | "dream_book" | "mirror" | "archive" | "sign_book";

export type Rarity = "common" | "uncommon" | "rare" | "archival";

export type SymbolFamily =
  | "path"
  | "memory"
  | "connection"
  | "decision"
  | "warning"
  | "change"
  | "mystery";

export type RoomId = "cabinet" | "archive";

export type BonusType =
  | "click_mult"
  | "passive_mult"
  | "timer_reduce"
  | "card_chance"
  | "symbol_chance"
  | "xp_mult";

export type RandomEventType =
  | "candle_out"
  | "mirror_sign"
  | "open_book"
  | "stopped_clock"
  | "urgent_visitor"
  | "window_light";

export interface GameObjectDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  unlockCost: number;
  unlockRequirement: {
    minLevel?: number;
    objectId?: string;
    objectLevel?: number;
    totalEnergy?: number;
  };
  incomeType: IncomeType;
  baseValue: number;
  room: RoomId;
  milestones: number[];
  premiumOnly?: boolean;
  effectLabel?: string;
}

export interface VisitorRequestDef {
  id: string;
  name: string;
  category: RequestCategory;
  situation: string;
  bestTool: RequestTool;
  okTools: RequestTool[];
  durationSec: number;
  baseReward: number;
  xpReward: number;
  bonusChance: number;
}

export interface GameCardDef {
  id: string;
  number: number;
  name: string;
  description: string;
  rarity: Rarity;
  passiveBonus: BonusType | "request_reward" | "visitor_rate" | "archive_fragments" | "dream_reward";
  bonusValue: number;
  relatedCategories: RequestCategory[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  metric: string;
  rewardEnergy?: number;
  rewardXp?: number;
  rewardFragments?: number;
}

export interface DailyTaskDef {
  id: string;
  title: string;
  description: string;
  metric: string;
  target: number;
  rewardEnergy: number;
  rewardXp: number;
}

export interface CollectedCard {
  id: string;
  level: number;
  copies: number;
  collectedAt: string;
}

export interface CollectedSymbol {
  id: string;
  seed: string;
  family: SymbolFamily;
  name: string;
  rarity: Rarity;
  passiveBonus: BonusType;
  bonusValue: number;
  collectedAt: string;
  source: string;
}

export interface ActiveRequest {
  instanceId: string;
  requestId: string;
  selectedTool: RequestTool;
  startedAt: number;
  completesAt: number;
  claimed: boolean;
}

export interface DailyTaskState {
  id: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface AchievementState {
  id: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface TemporaryBonus {
  id: string;
  type: BonusType;
  multiplier: number;
  label: string;
  startedAt: number;
  endsAt: number;
}

export interface RandomEvent {
  id: string;
  type: RandomEventType;
  startedAt: number;
  expiresAt: number;
  progress: number;
  data?: Record<string, number | string>;
}

export interface GameSettings {
  masterVolume: number;
  clickSounds: boolean;
  animations: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  confirmLargePurchases: boolean;
  muted: boolean;
}

export interface OfflineProgress {
  secondsAway: number;
  amount: number;
  pending: boolean;
}

export interface PendingReveal {
  type: "card" | "symbol" | "reward";
  cardId?: string;
  symbol?: CollectedSymbol;
  title?: string;
  description?: string;
  energy?: number;
  xp?: number;
}

export interface GameState {
  saveVersion: number;
  energy: number;
  totalEnergyEarned: number;
  totalClicks: number;
  experience: number;
  level: number;
  archiveFragments: number;
  archiveSeals: number;
  clickCombo: number;
  maxClickCombo: number;
  lastClickAt: number;
  objectLevels: Record<string, number>;
  unlockedObjects: string[];
  collectedCards: CollectedCard[];
  collectedSymbols: CollectedSymbol[];
  completedRequests: number;
  achievements: AchievementState[];
  dailyTasks: DailyTaskState[];
  dailyDate: string | null;
  loginStreak: number;
  lastLoginDate: string | null;
  activeRequests: ActiveRequest[];
  activeBonuses: TemporaryBonus[];
  currentEvent: RandomEvent | null;
  lastEventAt: number;
  lastSavedAt: number;
  lastPlayedAt: number;
  prestigeLevel: number;
  currentRoom: RoomId;
  profileSymbolSeed: string | null;
  displayName: string;
  settings: GameSettings;
  offline: OfflineProgress;
  pendingReveal: PendingReveal | null;
  sessionClicks: number;
  metrics: Record<string, number>;
  cosmeticTheme: string | null;
  isPremiumDemo: boolean;
  /** Уровень открытого Таро-центра: 0–5 */
  tarotCenterLevel: number;
}
