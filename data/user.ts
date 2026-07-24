import type { User, SubscriptionPlan } from "@/types";

export const mockUser: User = {
  id: "user-demo",
  name: "Анна",
  email: "anna@example.com",
  level: 3,
  interests: ["sport", "astrology", "meditation"],
  direction: "platform",
  theme: "dark",
  onboardingComplete: true,
  zodiacSign: "leo",
  natalChart: { birthDate: "1995-08-12", birthTime: "14:30", birthPlace: "Москва" },
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Бесплатный",
    price: { month: "0 ₽", year: "0 ₽" },
    features: [
      "Одна карта дня",
      "Базовые значения карт",
      "Ограниченные расклады",
      "Ограниченные AI-запросы",
      "Несколько записей снов",
      "Ограниченная история",
      "Вводные уроки",
    ],
    premium: false,
  },
  {
    id: "gadalka-plus",
    name: "Гадалка+",
    price: { month: "Цена уточняется", year: "Цена уточняется" },
    features: [
      "Расширенная карта дня",
      "Все расклады",
      "Неограниченная история",
      "Расширенный AI-ассистент",
      "Память предыдущих диалогов",
      "Полный дневник снов",
      "Повторяющиеся символы",
      "Все курсы",
      "Тематические программы",
      "Аудиофункции",
      "Эксклюзивные цифровые колоды",
      "Бонусы магазина",
      "Отсутствие рекламы",
    ],
    premium: true,
  },
];

export const activationCodes: Record<string, { bonus: string; description: string }> = {
  "GADALKA-CARD-2026": { bonus: "Цифровая колода «Архив Гадалки»", description: "Полная цифровая колода из 78 карт" },
  "GADALKA-DREAM-2026": { bonus: "Программа «Семь снов»", description: "7-дневная программа работы со снами" },
  "GADALKA-GIFT-2026": { bonus: "1 месяц Гадалка+", description: "Пробный период подписки Гадалка+" },
};

export const interestOptions = [
  { id: "sport", label: "Спорт", emoji: "⚽" },
  { id: "games", label: "Игры", emoji: "🎮" },
  { id: "extrasensory", label: "Экстрасенсорика", emoji: "🔮" },
  { id: "music", label: "Музыка", emoji: "🎵" },
  { id: "travel", label: "Путешествия", emoji: "✈️" },
  { id: "art", label: "Искусство", emoji: "🎨" },
  { id: "science", label: "Наука", emoji: "🔬" },
  { id: "nature", label: "Природа", emoji: "🌿" },
  { id: "cooking", label: "Кулинария", emoji: "🍳" },
  { id: "cinema", label: "Кино и сериалы", emoji: "🎬" },
  { id: "books", label: "Книги", emoji: "📚" },
  { id: "fashion", label: "Мода", emoji: "👗" },
  { id: "psychology", label: "Психология", emoji: "🧠" },
  { id: "meditation", label: "Медитация", emoji: "🧘" },
  { id: "astrology", label: "Астрология", emoji: "♈" },
  { id: "photography", label: "Фотография", emoji: "📷" },
  { id: "dance", label: "Танцы", emoji: "💃" },
  { id: "tech", label: "Технологии", emoji: "💻" },
  { id: "animals", label: "Животные", emoji: "🐾" },
  { id: "family", label: "Семья", emoji: "👨‍👩‍👧" },
];

export const directionOptions = [
  { id: "platform", label: "Платформа", description: "Карты, сны, символы" },
  { id: "game", label: "Онлайн-игра", description: "Истории и испытания" },
  { id: "shop", label: "Магазин", description: "Колоды и аксессуары" },
];

export const themeOptions = [
  { id: "dark", label: "Тёмный архив", color: "#12121a" },
  { id: "warm", label: "Тёплый свиток", color: "#2a1f1a" },
  { id: "mystic", label: "Мистический фиолет", color: "#1a1028" },
];
