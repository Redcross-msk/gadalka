import type { Dream } from "@/types";
import { interpretDream } from "@/data/dreamInterpreter";

export const demoDreams: Dream[] = [
  {
    id: "dream-1",
    title: "Дверь в тумане",
    description:
      "Я шла по длинному коридору. В конце была деревянная дверь, за которой слышался шум воды. Когда я открыла её, увидела зеркало вместо комнаты.",
    date: "2026-07-18",
    mood: "mysterious",
    characters: ["Я", "Незнакомая женщина"],
    places: ["Коридор", "Комната с зеркалом"],
    symbols: ["dver", "zerkalo", "voda"],
    recurring: true,
    personalNote: "Похожий сон был месяц назад",
    analysis: {
      summary:
        "Сон о переходе и самопознании. Дверь и зеркало указывают на готовность к внутренним изменениям.",
      emotions: ["любопытство", "лёгкая тревога", "ожидание"],
      foundSymbols: ["дверь", "зеркало", "вода"],
      themes: ["Возможность", "Самопознание", "Чувства"],
      questions: ["Что вы боитесь увидеть в зеркале?", "К какому переходу вы готовитесь?"],
      symbolReadings: [
        { keyword: "дверь", title: "Возможность", interpretation: "Переход к новому." },
        { keyword: "зеркало", title: "Самопознание", interpretation: "Взгляд на себя." },
        { keyword: "вода", title: "Чувства", interpretation: "Эмоциональная сфера." },
      ],
      disclaimer: "Толкование носит исключительно развлекательный и символический характер.",
    },
  },
  {
    id: "dream-2",
    title: "Птица у окна",
    description:
      "Белая птица сидела на подоконнике и стучала клювом по стеклу. Я открыла окно, и она влетела, оставив перо на столе.",
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
      foundSymbols: ["птица", "окно"],
      themes: ["Весть", "Новый взгляд"],
      questions: ["Какое послание вы получили?", "Что означает перо?"],
      symbolReadings: [
        { keyword: "птица", title: "Весть", interpretation: "Новые идеи или известия." },
        { keyword: "окно", title: "Новый взгляд", interpretation: "Изменение перспективы." },
      ],
      disclaimer: "Толкование носит исключительно развлекательный и символический характер.",
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
  const blob = [
    dream.title ?? "",
    dream.description ?? "",
    dream.personalNote ?? "",
    ...(dream.places ?? []),
    ...(dream.characters ?? []),
  ].join(" ");
  const interpreted = interpretDream(blob);
  const symbols = dream.symbols || [];

  return {
    summary: interpreted.summary,
    emotions: ["любопытство", "надежда", "лёгкая тревога"],
    foundSymbols: [...interpreted.symbols.map((s) => s.keyword), ...symbols].filter(
      (v, i, arr) => arr.indexOf(v) === i
    ),
    themes: interpreted.symbols.map((s) => s.title),
    questions: [
      "Какие чувства остались после пробуждения?",
      interpreted.symbols[0]
        ? `Что для вас лично означает образ «${interpreted.symbols[0].keyword}»?`
        : "Есть ли связь с текущей жизненной ситуацией?",
      "Какой символ повторяется чаще всего?",
    ],
    symbolReadings: interpreted.symbols,
    disclaimer: interpreted.disclaimer,
  };
}
