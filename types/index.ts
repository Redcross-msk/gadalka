export interface TarotSymbol {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

export interface TarotCard {
  id: string;
  slug: string;
  number: number;
  name: string;
  shortMeaning: string;
  fullMeaning: string;
  lightSide: string;
  shadowSide: string;
  relationshipsMeaning: string;
  workMeaning: string;
  decisionMeaning: string;
  symbols: TarotSymbol[];
  image: string;
  premium: boolean;
  tags: string[];
  relatedCards: string[];
  relatedSpreads: string[];
  relatedEpisode?: string;
}

export interface SymbolItem {
  id: string;
  slug: string;
  name: string;
  category: SymbolCategory;
  shortMeaning: string;
  culturalMeaning: string;
  symbolicMeaning: string;
  psychologicalMeaning: string;
  everydayMeaning: string;
  reflectionQuestions: string[];
  image: string;
  relatedCards: string[];
  relatedDreams: string[];
  popular: boolean;
}

export type SymbolCategory =
  | "objects"
  | "animals"
  | "numbers"
  | "colors"
  | "nature"
  | "home"
  | "actions"
  | "people"
  | "events";

export interface SpreadPosition {
  id: string;
  name: string;
  description: string;
}

export interface Spread {
  id: string;
  slug: string;
  name: string;
  description: string;
  cardCount: number;
  duration: string;
  premium: boolean;
  positions: SpreadPosition[];
  image: string;
}

export interface SpreadResult {
  id: string;
  spreadSlug: string;
  question: string;
  cards: { positionId: string; cardSlug: string }[];
  interpretation: string;
  createdAt: string;
}

export interface SavedDailyCardEntry {
  id: string;
  cardSlug: string;
  date: string;
  theme: string;
  question: string;
  shortMeaning: string;
  fullMeaning: string;
  zodiacSign?: string;
  savedAt: string;
}

export interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: DreamMood;
  characters: string[];
  places: string[];
  symbols: string[];
  recurring: boolean;
  personalNote: string;
  analysis?: DreamAnalysis;
}

export interface DreamAnalysis {
  summary: string;
  emotions: string[];
  foundSymbols: string[];
  themes: string[];
  questions: string[];
}

export type DreamMood = "peaceful" | "anxious" | "mysterious" | "joyful" | "sad" | "neutral";

export interface Course {
  id: string;
  slug: string;
  name: string;
  description: string;
  lessonCount: number;
  premium: boolean;
  image: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  exercise: string;
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration: string;
  premium: boolean;
  status: "not_started" | "in_progress" | "completed";
  stages: ProgramStage[];
  image: string;
}

export interface ProgramStage {
  id: string;
  day: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  status: "in_stock" | "preorder" | "digital";
  digitalBonus?: string;
  image: string;
  gallery: string[];
  composition?: string;
  characteristics?: Record<string, string>;
  platformConnection?: string;
  relatedCards?: string[];
  reviews?: ProductReview[];
}

export type ProductCategory =
  | "cards"
  | "candles"
  | "accessories"
  | "gift_sets"
  | "board_games"
  | "digital";

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Episode {
  id: string;
  slug: string;
  title: string;
  season: number;
  episode: number;
  description: string;
  themes: string[];
  relatedCards: string[];
}

export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  interests: string[];
  direction: "platform" | "game" | "shop";
  theme: "dark" | "warm" | "mystic";
  onboardingComplete: boolean;
  /** Знак зодиака — один профиль на платформу, игру и магазин */
  zodiacSign?: ZodiacSign;
  /** Натальная карта */
  natalChart?: NatalChart;
}

export interface NatalChart {
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyCard {
  cardSlug: string;
  date: string;
  theme: string;
  question: string;
  saved: boolean;
}

export interface DailySymbol {
  symbolSlug: string;
  date: string;
}

export interface EveningEntry {
  id: string;
  date: string;
  whatHappened: string;
  cardMatched: boolean;
  thoughts: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  mode: InterpreterMode;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export type InterpreterMode =
  | "dream"
  | "spread"
  | "symbol"
  | "question"
  | "tarot";

export interface CartItem {
  productSlug: string;
  quantity: number;
}

export interface ActivatedCode {
  code: string;
  bonus: string;
  activatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: { month: string; year: string };
  features: string[];
  premium: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

export interface SymbolObservation {
  id: string;
  symbolSlug: string;
  note: string;
  date: string;
}

export interface CourseProgress {
  courseSlug: string;
  completedLessons: string[];
  startedAt: string;
}

export interface ProgramProgress {
  programSlug: string;
  currentDay: number;
  completedStages: string[];
  startedAt: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}
