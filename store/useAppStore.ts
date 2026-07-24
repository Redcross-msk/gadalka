"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  Dream,
  SpreadResult,
  SavedDailyCardEntry,
  ChatSession,
  CartItem,
  ActivatedCode,
  CourseProgress,
  ProgramProgress,
  SymbolObservation,
  Note,
  EveningEntry,
  Toast,
  InterpreterMode,
} from "@/types";
import { generateId } from "@/lib/utils";

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  completeOnboarding: (data: Partial<User>) => void;

  // Subscription
  isPremium: boolean;
  setPremium: (value: boolean) => void;

  // Favorites
  favoriteCards: string[];
  toggleFavorite: (slug: string) => void;

  // Daily
  savedDailyCards: string[];
  savedDailyCardEntries: SavedDailyCardEntry[];
  saveDailyCard: (slug: string) => void;
  saveDailyCardEntry: (entry: Omit<SavedDailyCardEntry, "id" | "savedAt">) => void;
  eveningEntries: EveningEntry[];
  addEveningEntry: (entry: Omit<EveningEntry, "id">) => void;

  // Spreads
  spreadHistory: SpreadResult[];
  lastFreeSpreadAt: string | null;
  saveSpread: (result: Omit<SpreadResult, "id" | "createdAt">) => void;
  canDoFreeSpread: () => boolean;
  getFreeSpreadCooldownMs: () => number;

  // Dreams
  dreams: Dream[];
  addDream: (dream: Omit<Dream, "id"> & { id?: string }) => void;
  getDream: (id: string) => Dream | undefined;

  // Symbols
  symbolObservations: SymbolObservation[];
  addSymbolObservation: (obs: Omit<SymbolObservation, "id">) => void;
  recentlyViewedSymbols: string[];
  addRecentlyViewedSymbol: (slug: string) => void;

  // Learning
  courseProgress: CourseProgress[];
  completeLesson: (courseSlug: string, lessonId: string) => void;
  programProgress: ProgramProgress[];
  startProgram: (programSlug: string) => void;
  completeProgramStage: (programSlug: string, stageId: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;

  // Chat
  chatSessions: ChatSession[];
  createChatSession: (mode: InterpreterMode, title: string) => string;
  addChatMessage: (sessionId: string, role: "user" | "assistant", content: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (productSlug: string) => void;
  removeFromCart: (productSlug: string) => void;
  updateCartQuantity: (productSlug: string, quantity: number) => void;
  clearCart: () => void;

  // Activation
  activatedCodes: ActivatedCode[];
  activateCode: (code: string) => { success: boolean; bonus?: string; error?: string };

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isPremium: false,
      favoriteCards: [],
      savedDailyCards: [],
      savedDailyCardEntries: [],
      eveningEntries: [],
      spreadHistory: [],
      lastFreeSpreadAt: null,
      dreams: [],
      symbolObservations: [],
      recentlyViewedSymbols: [],
      courseProgress: [],
      programProgress: [],
      notes: [],
      chatSessions: [],
      cart: [],
      activatedCodes: [],
      toasts: [],
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      login: (email, _password) => {
        const user: User = {
          id: generateId(),
          name: email.split("@")[0],
          email,
          level: 1,
          interests: [],
          direction: "platform",
          theme: "dark",
          onboardingComplete: true,
          zodiacSign: "leo",
        };
        set({ user, isAuthenticated: true });
        return true;
      },

      register: (name, email, _password) => {
        const user: User = {
          id: generateId(),
          name,
          email,
          level: 1,
          interests: [],
          direction: "platform",
          theme: "dark",
          onboardingComplete: false,
          // знак задаётся обязательно на онбординге
        };
        set({ user, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false, isPremium: false }),

      updateUser: (data) =>
        set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),

      completeOnboarding: (data) =>
        set((s) => ({
          user: s.user
            ? { ...s.user, ...data, onboardingComplete: true }
            : null,
        })),

      setPremium: (value) => set({ isPremium: value }),

      toggleFavorite: (slug) =>
        set((s) => ({
          favoriteCards: s.favoriteCards.includes(slug)
            ? s.favoriteCards.filter((c) => c !== slug)
            : [...s.favoriteCards, slug],
        })),

      saveDailyCard: (slug) =>
        set((s) => ({
          savedDailyCards: s.savedDailyCards.includes(slug)
            ? s.savedDailyCards
            : [...s.savedDailyCards, slug],
        })),

      saveDailyCardEntry: (entry) =>
        set((s) => {
          const exists = s.savedDailyCardEntries.some(
            (e) => e.cardSlug === entry.cardSlug && e.date === entry.date
          );
          if (exists) return s;
          return {
            savedDailyCardEntries: [
              {
                ...entry,
                id: generateId(),
                savedAt: new Date().toISOString(),
              },
              ...s.savedDailyCardEntries,
            ],
            savedDailyCards: s.savedDailyCards.includes(entry.cardSlug)
              ? s.savedDailyCards
              : [...s.savedDailyCards, entry.cardSlug],
          };
        }),

      addEveningEntry: (entry) =>
        set((s) => ({
          eveningEntries: [
            { ...entry, id: generateId() },
            ...s.eveningEntries,
          ],
        })),

      canDoFreeSpread: () => {
        const { isPremium, lastFreeSpreadAt } = get();
        if (isPremium) return true;
        if (!lastFreeSpreadAt) return true;
        const elapsed = Date.now() - new Date(lastFreeSpreadAt).getTime();
        return elapsed >= 24 * 60 * 60 * 1000;
      },

      getFreeSpreadCooldownMs: () => {
        const { isPremium, lastFreeSpreadAt } = get();
        if (isPremium || !lastFreeSpreadAt) return 0;
        const elapsed = Date.now() - new Date(lastFreeSpreadAt).getTime();
        return Math.max(0, 24 * 60 * 60 * 1000 - elapsed);
      },

      saveSpread: (result) =>
        set((s) => ({
          spreadHistory: [
            {
              ...result,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...s.spreadHistory,
          ],
          lastFreeSpreadAt: s.isPremium
            ? s.lastFreeSpreadAt
            : new Date().toISOString(),
        })),

      addDream: (dream) =>
        set((s) => ({
          dreams: [{ ...dream, id: dream.id ?? generateId() }, ...s.dreams],
        })),

      getDream: (id) => get().dreams.find((d) => d.id === id),

      addSymbolObservation: (obs) =>
        set((s) => ({
          symbolObservations: [
            { ...obs, id: generateId() },
            ...s.symbolObservations,
          ],
        })),

      addRecentlyViewedSymbol: (slug) =>
        set((s) => ({
          recentlyViewedSymbols: [
            slug,
            ...s.recentlyViewedSymbols.filter((s) => s !== slug),
          ].slice(0, 10),
        })),

      completeLesson: (courseSlug, lessonId) =>
        set((s) => {
          const existing = s.courseProgress.find(
            (p) => p.courseSlug === courseSlug
          );
          if (existing) {
            return {
              courseProgress: s.courseProgress.map((p) =>
                p.courseSlug === courseSlug
                  ? {
                      ...p,
                      completedLessons: p.completedLessons.includes(lessonId)
                        ? p.completedLessons
                        : [...p.completedLessons, lessonId],
                    }
                  : p
              ),
            };
          }
          return {
            courseProgress: [
              ...s.courseProgress,
              {
                courseSlug,
                completedLessons: [lessonId],
                startedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      startProgram: (programSlug) =>
        set((s) => ({
          programProgress: [
            ...s.programProgress.filter((p) => p.programSlug !== programSlug),
            {
              programSlug,
              currentDay: 1,
              completedStages: [],
              startedAt: new Date().toISOString(),
            },
          ],
        })),

      completeProgramStage: (programSlug, stageId) =>
        set((s) => ({
          programProgress: s.programProgress.map((p) =>
            p.programSlug === programSlug
              ? {
                  ...p,
                  completedStages: p.completedStages.includes(stageId)
                    ? p.completedStages
                    : [...p.completedStages, stageId],
                  currentDay: p.currentDay + 1,
                }
              : p
          ),
        })),

      addNote: (note) =>
        set((s) => ({
          notes: [
            {
              ...note,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...s.notes,
          ],
        })),

      createChatSession: (mode, title) => {
        const id = generateId();
        set((s) => ({
          chatSessions: [
            {
              id,
              mode,
              title,
              messages: [],
              createdAt: new Date().toISOString(),
            },
            ...s.chatSessions,
          ],
        }));
        return id;
      },

      addChatMessage: (sessionId, role, content) =>
        set((s) => ({
          chatSessions: s.chatSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [
                    ...session.messages,
                    {
                      id: generateId(),
                      role,
                      content,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : session
          ),
        })),

      addToCart: (productSlug) =>
        set((s) => {
          const existing = s.cart.find((i) => i.productSlug === productSlug);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.productSlug === productSlug
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { cart: [...s.cart, { productSlug, quantity: 1 }] };
        }),

      removeFromCart: (productSlug) =>
        set((s) => ({
          cart: s.cart.filter((i) => i.productSlug !== productSlug),
        })),

      updateCartQuantity: (productSlug, quantity) =>
        set((s) => ({
          cart:
            quantity <= 0
              ? s.cart.filter((i) => i.productSlug !== productSlug)
              : s.cart.map((i) =>
                  i.productSlug === productSlug ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ cart: [] }),

      activateCode: (code) => {
        const codes: Record<string, string> = {
          "GADALKA-CARD-2026": "Цифровая колода «Архив Гадалки»",
          "GADALKA-DREAM-2026": "Программа «Семь снов»",
          "GADALKA-GIFT-2026": "1 месяц Гадалка+",
        };
        const normalizedCode = code.trim().toUpperCase();
        if (get().activatedCodes.some((c) => c.code === normalizedCode)) {
          return { success: false, error: "Код уже активирован" };
        }
        const bonus = codes[normalizedCode];
        if (!bonus) {
          return { success: false, error: "Неверный код активации" };
        }
        set((s) => ({
          activatedCodes: [
            ...s.activatedCodes,
            {
              code: normalizedCode,
              bonus,
              activatedAt: new Date().toISOString(),
            },
          ],
        }));
        if (normalizedCode === "GADALKA-GIFT-2026") {
          set({ isPremium: true });
        }
        return { success: true, bonus };
      },

      addToast: (toast) => {
        const id = generateId();
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "gadalka-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
        favoriteCards: state.favoriteCards,
        savedDailyCards: state.savedDailyCards,
        savedDailyCardEntries: state.savedDailyCardEntries,
        eveningEntries: state.eveningEntries,
        spreadHistory: state.spreadHistory,
        lastFreeSpreadAt: state.lastFreeSpreadAt,
        dreams: state.dreams,
        symbolObservations: state.symbolObservations,
        recentlyViewedSymbols: state.recentlyViewedSymbols,
        courseProgress: state.courseProgress,
        programProgress: state.programProgress,
        notes: state.notes,
        chatSessions: state.chatSessions,
        cart: state.cart,
        activatedCodes: state.activatedCodes,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
