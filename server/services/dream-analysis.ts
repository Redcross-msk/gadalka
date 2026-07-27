import "server-only";

import type { DreamMood } from "@prisma/client";
import { interpretDream } from "@/data/dreamInterpreter";

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

export function analyzeDreamContent(input: DreamAnalysisInput): DreamAnalysisResult {
  const blob = [input.title, input.description, input.personalNote ?? "", ...input.places, ...input.characters].join(
    " "
  );

  const interpreted = interpretDream(blob);
  const symbolReadings = interpreted.symbols;
  const foundSymbols = [
    ...symbolReadings.map((s) => s.keyword),
    ...input.symbols.filter(Boolean),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const themes = new Set<string>(symbolReadings.map((s) => s.title));
  if (input.recurring) themes.add("повторяющийся сюжет");
  if (input.characters.length) themes.add("фигуры отношений");
  if (input.places.length) themes.add("пространство сна");

  const emotions = [...MOOD_EMOTIONS[input.mood]];
  if (symbolReadings.some((s) => s.keyword === "вода" || s.keyword === "море" || s.keyword === "река")) {
    emotions.push("глубина чувств");
  }
  if (symbolReadings.some((s) => s.keyword === "дверь" || s.keyword === "мост")) {
    emotions.push("готовность к шагу");
  }
  if (symbolReadings.some((s) => s.keyword === "падаю" || s.keyword === "страшно")) {
    emotions.push("тревога");
  }

  const uniqueEmotions = [...new Set(emotions)].slice(0, 6);
  const themeList = [...themes].slice(0, 8);
  const symbolsList = foundSymbols.slice(0, 12);

  const summaryParts = [
    interpreted.summary,
    input.recurring
      ? "Повторяемость намекает, что психика возвращается к незавершённому опыту."
      : "Это разовый сюжет — полезно сравнить его с событиями дня.",
  ];

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
      engine: "dream-interpreter-v1",
      disclaimer: interpreted.disclaimer,
      symbolReadings,
      symbolHits: symbolReadings.length,
      mood: input.mood,
    },
  };
}
