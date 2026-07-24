import "server-only";

import type { DreamMood } from "@prisma/client";

const SYMBOL_LEXICON: { key: string; labels: string[]; theme: string }[] = [
  { key: "вода", labels: ["вода", "река", "море", "озеро", "дождь", "океан"], theme: "эмоции и поток" },
  { key: "дверь", labels: ["дверь", "врата", "порог", "вход"], theme: "переход и выбор" },
  { key: "зеркало", labels: ["зеркало", "отражение"], theme: "самопознание" },
  { key: "дом", labels: ["дом", "квартира", "комната"], theme: "безопасность и корень" },
  { key: "лес", labels: ["лес", "деревья", "чаща"], theme: "бессознательное" },
  { key: "птица", labels: ["птица", "ворона", "сова", "голубь"], theme: "послание" },
  { key: "огонь", labels: ["огонь", "пламя", "свеча", "костёр"], theme: "трансформация" },
  { key: "дорога", labels: ["дорога", "путь", "тропа", "улица"], theme: "направление жизни" },
  { key: "ключ", labels: ["ключ", "замок"], theme: "доступ и тайна" },
  { key: "ребёнок", labels: ["ребёнок", "дети", "малыш"], theme: "начало и уязвимость" },
];

const MOOD_EMOTIONS: Record<DreamMood, string[]> = {
  PEACEFUL: ["спокойствие", "принятие", "гармония"],
  ANXIOUS: ["тревога", "напряжение", "ожидание"],
  MYSTERIOUS: ["загадка", "интуиция", "скрытое"],
  JOYFUL: ["радость", "лёгкость", "вдохновение"],
  SAD: ["грусть", "утрата", "ностальгия"],
  NEUTRAL: ["наблюдение", "равновесие"],
};

const MOOD_TONE: Record<DreamMood, number> = {
  PEACEFUL: 40,
  ANXIOUS: -35,
  MYSTERIOUS: 10,
  JOYFUL: 55,
  SAD: -45,
  NEUTRAL: 0,
};

export type DreamAnalysisInput = {
  title: string;
  description: string;
  mood: DreamMood;
  symbols: string[];
  characters: string[];
  places: string[];
  recurring: boolean;
  personalNote?: string;
};

export type DreamAnalysisResult = {
  summary: string;
  emotions: string[];
  foundSymbols: string[];
  themes: string[];
  questions: string[];
  toneScore: number;
  rawMeta: Record<string, unknown>;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/ё/g, "е");
}

export function analyzeDreamContent(input: DreamAnalysisInput): DreamAnalysisResult {
  const blob = normalize(
    [input.title, input.description, input.personalNote ?? "", ...input.symbols, ...input.places, ...input.characters].join(" ")
  );

  const foundFromText: string[] = [];
  const themes = new Set<string>();

  for (const entry of SYMBOL_LEXICON) {
    if (entry.labels.some((l) => blob.includes(l))) {
      foundFromText.push(entry.key);
      themes.add(entry.theme);
    }
  }

  for (const s of input.symbols) {
    const n = normalize(s);
    if (n && !foundFromText.includes(n)) foundFromText.push(s);
  }

  if (input.recurring) themes.add("повторяющийся сюжет");
  if (input.characters.length) themes.add("фигуры отношений");
  if (input.places.length) themes.add("пространство сна");

  const emotions = [...MOOD_EMOTIONS[input.mood]];
  if (foundFromText.includes("вода")) emotions.push("глубина чувств");
  if (foundFromText.includes("дверь")) emotions.push("готовность к шагу");

  const uniqueEmotions = [...new Set(emotions)].slice(0, 6);
  const themeList = [...themes].slice(0, 6);
  const symbolsList = foundFromText.slice(0, 10);

  const summaryParts = [
    `Сон «${input.title}» несёт ${input.mood === "ANXIOUS" || input.mood === "SAD" ? "напряжённый" : "живой"} отклик.`,
    symbolsList.length
      ? `Ключевые образы: ${symbolsList.slice(0, 4).join(", ")}.`
      : "Прямых символов из словаря мало — важнее общее настроение и детали, которые вы отметили.",
    themeList.length ? `Темы: ${themeList.slice(0, 3).join("; ")}.` : "",
    input.recurring
      ? "Повторяемость намекает, что психика возвращается к незавершённому опыту."
      : "Это разовый сюжет — полезно сравнить его с событиями дня.",
  ].filter(Boolean);

  const questions = [
    "Какое чувство осталось сразу после пробуждения?",
    symbolsList[0]
      ? `Что для вас лично означает образ «${symbolsList[0]}»?`
      : "Какой один символ из сна вы бы сохранили в дневник?",
    input.recurring
      ? "Что изменилось в повторяющемся сне по сравнению с прошлым разом?"
      : "С каким событием последних дней этот сон может перекликаться?",
  ];

  const toneScore = Math.max(
    -100,
    Math.min(100, MOOD_TONE[input.mood] + symbolsList.length * 3 - (input.recurring ? 5 : 0))
  );

  return {
    summary: summaryParts.join(" "),
    emotions: uniqueEmotions,
    foundSymbols: symbolsList,
    themes: themeList,
    questions,
    toneScore,
    rawMeta: {
      engine: "rule-lexicon-v1",
      symbolHits: foundFromText.length,
      mood: input.mood,
    },
  };
}
