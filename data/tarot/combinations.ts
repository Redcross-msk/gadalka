import type { TarotDeckCard, TarotSuit } from "./deck";

export type InteractionType =
  | "reinforcement"
  | "tension"
  | "transition"
  | "stabilization"
  | "amplification"
  | "reflection";

export interface CardInteraction {
  type: InteractionType;
  title: string;
  text: string;
}

const suitElements: Record<TarotSuit, string> = {
  wands: "Огонь",
  cups: "Вода",
  swords: "Воздух",
  pentacles: "Земля",
};

const compatiblePairs = new Set([
  "wands:swords",
  "swords:wands",
  "cups:pentacles",
  "pentacles:cups",
]);

const tensePairs = new Set([
  "wands:cups",
  "cups:wands",
  "swords:pentacles",
  "pentacles:swords",
]);

export function getCardInteraction(a: TarotDeckCard, b: TarotDeckCard): CardInteraction {
  if (a.arcana === "major" && b.arcana === "major") {
    return {
      type: "amplification",
      title: "Две ведущие темы",
      text: `${a.name} и ${b.name} образуют сильное сочетание: обе карты задают общий контекст и усиливают значимость происходящего.`,
    };
  }

  if (a.arcana === "major" || b.arcana === "major") {
    const major = a.arcana === "major" ? a : b;
    const minor = a.arcana === "minor" ? a : b;
    return {
      type: "reflection",
      title: "Большая тема и ее проявление",
      text: `${major.name} определяет общий смысл, а ${minor.name} показывает, как эта тема может проявляться в повседневной ситуации.`,
    };
  }

  const pair = `${a.suit}:${b.suit}`;
  if (compatiblePairs.has(pair)) {
    return {
      type: "reinforcement",
      title: "Поддерживающее сочетание",
      text: `Стихии ${suitElements[a.suit!]} и ${suitElements[b.suit!]} поддерживают друг друга. Значения карт соединяются достаточно естественно.`,
    };
  }

  if (tensePairs.has(pair)) {
    return {
      type: "tension",
      title: "Разные способы реагирования",
      text: `Стихии ${suitElements[a.suit!]} и ${suitElements[b.suit!]} задают разные ритмы. Комбинация отражает необходимость учитывать противоречивые импульсы.`,
    };
  }

  if (a.suit === b.suit) {
    return {
      type: "amplification",
      title: "Повторение одной темы",
      text: `Обе карты принадлежат масти ${a.suit}. Тема этой масти становится доминирующей и заметно усиливается.`,
    };
  }

  return {
    type: "transition",
    title: "Переход между темами",
    text: `${a.name} и ${b.name} показывают переход от одной формы опыта к другой. Их значения лучше читать как последовательность.`,
  };
}

export function getDominantCard(cards: readonly TarotDeckCard[]): TarotDeckCard {
  const majors = cards.filter((card) => card.arcana === "major");
  if (majors.length > 0) return majors[0];

  return [...cards].sort((a, b) => b.number - a.number)[0];
}
