import {
  tarotDeckCardMap,
  type TarotDeckCard,
  type TarotDomain,
} from "./deck";
import {
  getCardInteraction,
  getDominantCard,
  type CardInteraction,
} from "./combinations";

export interface TarotInterpretation {
  cards: TarotDeckCard[];
  title: string;
  summary: string;
  domainText: string;
  sequence: string[];
  interactions: CardInteraction[];
  conclusion: string;
  disclaimer: string;
}

const domainLabels: Record<TarotDomain, string> = {
  general: "общей ситуации",
  love: "отношений",
  work: "работы и задач",
  finance: "финансовой сферы",
  inner: "внутреннего состояния",
};

function cardDomainMeaning(card: TarotDeckCard, domain: TarotDomain): string {
  return card.meanings[domain];
}

function oneCardInterpretation(card: TarotDeckCard, domain: TarotDomain): TarotInterpretation {
  return {
    cards: [card],
    title: card.name,
    summary: card.coreMeaning,
    domainText: cardDomainMeaning(card, domain),
    sequence: [
      `Основная тема: ${card.coreMeaning}`,
      `Светлая сторона: ${card.light}.`,
      `Теневая сторона: ${card.shadow}.`,
    ],
    interactions: [],
    conclusion: card.meanings.neutralGuidance,
    disclaimer:
      "Интерпретация носит развлекательный и символический характер. Она не является точным прогнозом, профессиональной консультацией или руководством к действию.",
  };
}

function twoCardInterpretation(
  first: TarotDeckCard,
  second: TarotDeckCard,
  domain: TarotDomain
): TarotInterpretation {
  const interaction = getCardInteraction(first, second);
  const dominant = getDominantCard([first, second]);

  return {
    cards: [first, second],
    title: `${first.name} — ${second.name}`,
    summary: `${first.name} задает исходную тему, а ${second.name} показывает ее развитие или ответное влияние.`,
    domainText: `В контексте ${domainLabels[domain]} первая карта описывает начальный фон: ${cardDomainMeaning(first, domain)} Вторая карта добавляет следующий смысловой слой: ${cardDomainMeaning(second, domain)}`,
    sequence: [
      `Исходная тема — ${first.coreMeaning}`,
      `Развитие темы — ${second.coreMeaning}`,
      `Доминирующий акцент — ${dominant.name}.`,
    ],
    interactions: [interaction],
    conclusion: `Комбинация не сводится к одному событию. Она показывает, как качество «${first.keywords[0]}» соприкасается с качеством «${second.keywords[0]}».`,
    disclaimer:
      "Интерпретация носит развлекательный и символический характер. Она не является точным прогнозом, профессиональной консультацией или руководством к действию.",
  };
}

function threeCardInterpretation(
  first: TarotDeckCard,
  second: TarotDeckCard,
  third: TarotDeckCard,
  domain: TarotDomain
): TarotInterpretation {
  const firstInteraction = getCardInteraction(first, second);
  const secondInteraction = getCardInteraction(second, third);
  const dominant = getDominantCard([first, second, third]);

  return {
    cards: [first, second, third],
    title: `${first.name} — ${second.name} — ${third.name}`,
    summary: `${first.name} описывает исходную точку, ${second.name} — центральный процесс, а ${third.name} — направление, в котором складывается общий смысл.`,
    domainText: `В сфере ${domainLabels[domain]} карты образуют последовательность. ${cardDomainMeaning(first, domain)} Затем внимание переходит к карте ${second.name}: ${cardDomainMeaning(second, domain)} Завершающий оттенок задает ${third.name}: ${cardDomainMeaning(third, domain)}`,
    sequence: [
      `Первая позиция — фон: ${first.coreMeaning}`,
      `Вторая позиция — движение: ${second.coreMeaning}`,
      `Третья позиция — итоговый акцент: ${third.coreMeaning}`,
      `Доминирующая карта расклада — ${dominant.name}.`,
    ],
    interactions: [firstInteraction, secondInteraction],
    conclusion: `Вместе карты описывают переход от «${first.keywords[0]}» через «${second.keywords[0]}» к теме «${third.keywords[0]}». Это символическая модель развития ситуации, а не фиксированный сценарий.`,
    disclaimer:
      "Интерпретация носит развлекательный и символический характер. Она не является точным прогнозом, профессиональной консультацией или руководством к действию.",
  };
}

/** Толкование расклада из 1–3 карт по id движка (например magician, ace_of_cups). */
export function interpretTarot(
  cardIds: readonly string[],
  domain: TarotDomain = "general"
): TarotInterpretation {
  if (cardIds.length < 1 || cardIds.length > 3) {
    throw new Error("Расклад должен содержать от одной до трех карт.");
  }

  const cards = cardIds.map((id) => {
    const card = tarotDeckCardMap[id];
    if (!card) throw new Error(`Неизвестная карта: ${id}`);
    return card;
  });

  if (cards.length === 1) return oneCardInterpretation(cards[0], domain);
  if (cards.length === 2) {
    return twoCardInterpretation(cards[0], cards[1], domain);
  }

  return threeCardInterpretation(cards[0], cards[1], cards[2], domain);
}

export function formatInterpretationText(result: TarotInterpretation): string {
  const parts = [
    result.summary,
    "",
    result.domainText,
    "",
    ...result.sequence,
  ];

  if (result.interactions.length) {
    parts.push("");
    for (const interaction of result.interactions) {
      parts.push(`${interaction.title}: ${interaction.text}`);
    }
  }

  parts.push("", result.conclusion, "", result.disclaimer);
  return parts.join("\n");
}
