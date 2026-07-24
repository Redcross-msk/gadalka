import type { Dream } from "@/types";

export const demoDreams: Dream[] = [
  {
    id: "dream-1",
    title: "Дверь в тумане",
    description: "Я шла по длинному коридору. В конце была деревянная дверь, за которой слышался шум воды. Когда я открыла её, увидела зеркало вместо комнаты.",
    date: "2026-07-18",
    mood: "mysterious",
    characters: ["Я", "Незнакомая женщина"],
    places: ["Коридор", "Комната с зеркалом"],
    symbols: ["dver", "zerkalo", "voda"],
    recurring: true,
    personalNote: "Похожий сон был месяц назад",
    analysis: {
      summary: "Сон о переходе и самопознании. Дверь и зеркало указывают на готовность к внутренним изменениям.",
      emotions: ["любопытство", "лёгкая тревога", "ожидание"],
      foundSymbols: ["dver", "zerkalo", "voda"],
      themes: ["переход", "самопознание", "скрытое"],
      questions: ["Что вы боитесь увидеть в зеркале?", "К какому переходу вы готовитесь?"],
    },
  },
  {
    id: "dream-2",
    title: "Птица у окна",
    description: "Белая птица сидела на подоконнике и стучала клювом по стеклу. Я открыла окно, и она влетела, оставив перо на столе.",
    date: "2026-07-15",
    mood: "peaceful",
    characters: ["Я"],
    places: ["Моя комната"],
    symbols: ["ptitsa", "okno"],
    recurring: false,
    personalNote: "",
    analysis: {
      summary: "Сон о послании и новых возможностях. Птица — символ свободы и важного знака.",
      emotions: ["спокойствие", "удивление", "надежда"],
      foundSymbols: ["ptitsa", "okno"],
      themes: ["послание", "свобода", "новое"],
      questions: ["Какое послание вы получили?", "Что означает перо?"],
    },
  },
];

export const dreamMoods = [
  { id: "peaceful", name: "Спокойный", emoji: "🌙" },
  { id: "anxious", name: "Тревожный", emoji: "🌊" },
  { id: "mysterious", name: "Загадочный", emoji: "✨" },
  { id: "joyful", name: "Радостный", emoji: "☀️" },
  { id: "sad", name: "Грустный", emoji: "🌧️" },
  { id: "neutral", name: "Нейтральный", emoji: "🍃" },
] as const;

export function generateDreamAnalysis(dream: Partial<Dream>) {
  const symbols = dream.symbols || [];
  return {
    summary: `Сон «${dream.title}» содержит символы перехода и самопознания. Обратите внимание на повторяющиеся образы.`,
    emotions: ["любопытство", "надежда", "лёгкая тревога"],
    foundSymbols: symbols,
    themes: ["переход", "самопознание", "послание"],
    questions: [
      "Какие чувства остались после пробуждения?",
      "Есть ли связь с текущей жизненной ситуацией?",
      "Какой символ повторяется чаще всего?",
    ],
  };
}
