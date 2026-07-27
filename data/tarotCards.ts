import type { TarotCard, TarotSymbol } from "@/types";
import {
  tarotDeckCards,
  type TarotArcana,
  type TarotSuit,
} from "@/data/tarot/deck";

/** Движковый id → slug в URL / старых данных (избранное, карта дня). */
export const ENGINE_ID_TO_SLUG: Record<string, string> = {
  fool: "shut",
  magician: "mag",
  high_priestess: "verkhovnaya-zhestitsa",
  empress: "imperatritsa",
  emperor: "imperator",
  hierophant: "ierofant",
  lovers: "vlyublyonnye",
  chariot: "kolesnitsa",
  strength: "sila",
  hermit: "otshchelnik",
  wheel_of_fortune: "koleso-fortuny",
  justice: "spravedlivost",
  hanged_man: "poveshennyj",
  death: "smert",
  temperance: "umerennost",
  devil: "dyavol",
  tower: "bashnya",
  star: "zvezda",
  moon: "luna",
  sun: "solntse",
  judgement: "sud",
  world: "mir",
};

export const SLUG_TO_ENGINE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ENGINE_ID_TO_SLUG).map(([engineId, slug]) => [slug, engineId])
);

const LEGACY_SYMBOLS: Record<string, TarotSymbol[]> = {
  shut: [
    { id: "s1", name: "Собака", description: "Верность и инстинкт", x: 30, y: 70 },
    { id: "s2", name: "Роза", description: "Страсть и красота", x: 60, y: 40 },
  ],
  mag: [
    { id: "s1", name: "Жезл", description: "Воля и действие", x: 25, y: 50 },
    { id: "s2", name: "Кубок", description: "Эмоции и интуиция", x: 50, y: 50 },
  ],
  "verkhovnaya-zhestitsa": [
    { id: "s1", name: "Луна", description: "Циклы и интуиция", x: 50, y: 20 },
    { id: "s2", name: "Колонны", description: "Граница между мирами", x: 20, y: 60 },
  ],
  imperatritsa: [
    { id: "s1", name: "Пшеница", description: "Изобилие и урожай", x: 40, y: 75 },
    { id: "s2", name: "Корона", description: "Власть и мудрость", x: 50, y: 15 },
  ],
  imperator: [
    { id: "s1", name: "Трон", description: "Власть и стабильность", x: 50, y: 70 },
    { id: "s2", name: "Орёл", description: "Видение и сила", x: 70, y: 30 },
  ],
  ierofant: [
    { id: "s1", name: "Ключи", description: "Доступ к знаниям", x: 35, y: 55 },
    { id: "s2", name: "Посох", description: "Духовный авторитет", x: 65, y: 45 },
  ],
  vlyublyonnye: [
    { id: "s1", name: "Ангел", description: "Божественное благословение", x: 50, y: 10 },
    { id: "s2", name: "Деревья", description: "Рост и выбор", x: 20, y: 80 },
  ],
  kolesnitsa: [
    { id: "s1", name: "Сфинксы", description: "Противоположные силы", x: 30, y: 65 },
    { id: "s2", name: "Звёзды", description: "Направление и судьба", x: 50, y: 15 },
  ],
  sila: [
    { id: "s1", name: "Лев", description: "Страсти и инстинкты", x: 50, y: 60 },
    { id: "s2", name: "Бесконечность", description: "Вечная энергия", x: 50, y: 25 },
  ],
  otshchelnik: [
    { id: "s1", name: "Фонарь", description: "Внутренний свет", x: 55, y: 35 },
    { id: "s2", name: "Посох", description: "Опора и путь", x: 40, y: 70 },
  ],
  "koleso-fortuny": [
    { id: "s1", name: "Колесо", description: "Циклы судьбы", x: 50, y: 50 },
    { id: "s2", name: "Сфинкс", description: "Загадка жизни", x: 50, y: 20 },
  ],
  spravedlivost: [
    { id: "s1", name: "Весы", description: "Равновесие и справедливость", x: 50, y: 45 },
    { id: "s2", name: "Меч", description: "Истина и решение", x: 50, y: 70 },
  ],
  poveshennyj: [
    { id: "s1", name: "Дерево", description: "Связь миров", x: 50, y: 30 },
    { id: "s2", name: "Нимб", description: "Просветление", x: 50, y: 15 },
  ],
  smert: [
    { id: "s1", name: "Флаг", description: "Новое начало", x: 60, y: 40 },
    { id: "s2", name: "Роза", description: "Красота трансформации", x: 40, y: 75 },
  ],
  umerennost: [
    { id: "s1", name: "Кубки", description: "Смешение элементов", x: 50, y: 55 },
    { id: "s2", name: "Ангел", description: "Божественное руководство", x: 50, y: 15 },
  ],
  dyavol: [
    { id: "s1", name: "Цепи", description: "Привязанности", x: 40, y: 70 },
    { id: "s2", name: "Факел", description: "Страсть и искушение", x: 60, y: 30 },
  ],
  bashnya: [
    { id: "s1", name: "Молния", description: "Внезапное озарение", x: 50, y: 20 },
    { id: "s2", name: "Корона", description: "Падение эго", x: 50, y: 35 },
  ],
  zvezda: [
    { id: "s1", name: "Звезда", description: "Надежда и направление", x: 50, y: 20 },
    { id: "s2", name: "Вода", description: "Исцеление и поток", x: 50, y: 75 },
  ],
  luna: [
    { id: "s1", name: "Луна", description: "Циклы и тайны", x: 50, y: 15 },
    { id: "s2", name: "Собака и волк", description: "Приручённое и дикое", x: 30, y: 70 },
  ],
  solntse: [
    { id: "s1", name: "Солнце", description: "Жизненная сила", x: 50, y: 15 },
    { id: "s2", name: "Ребёнок", description: "Невинность и радость", x: 50, y: 65 },
  ],
  sud: [
    { id: "s1", name: "Труба", description: "Призыв к пробуждению", x: 50, y: 20 },
    { id: "s2", name: "Гроб", description: "Возрождение", x: 50, y: 75 },
  ],
  mir: [
    { id: "s1", name: "Венок", description: "Победа и завершение", x: 50, y: 50 },
    { id: "s2", name: "Фигуры", description: "Четыре стихии", x: 25, y: 75 },
  ],
};

const LEGACY_IMAGES: Record<string, string> = {
  shut: "/images/tarot/shut.svg",
  mag: "/images/tarot/mag.svg",
  "verkhovnaya-zhestitsa": "/images/tarot/priestess.svg",
  imperatritsa: "/images/tarot/empress.svg",
  imperator: "/images/tarot/emperor.svg",
  ierofant: "/images/tarot/hierophant.svg",
  vlyublyonnye: "/images/tarot/lovers.svg",
  kolesnitsa: "/images/tarot/chariot.svg",
  sila: "/images/tarot/strength.svg",
  otshchelnik: "/images/tarot/hermit.svg",
  "koleso-fortuny": "/images/tarot/wheel.svg",
  spravedlivost: "/images/tarot/justice.svg",
  poveshennyj: "/images/tarot/hanged.svg",
  smert: "/images/tarot/death.svg",
  umerennost: "/images/tarot/temperance.svg",
  dyavol: "/images/tarot/devil.svg",
  bashnya: "/images/tarot/tower.svg",
  zvezda: "/images/tarot/star.svg",
  luna: "/images/tarot/moon.svg",
  solntse: "/images/tarot/sun.svg",
  sud: "/images/tarot/judgement.svg",
  mir: "/images/tarot/world.svg",
};

const SUIT_LABELS: Record<TarotSuit, string> = {
  wands: "Жезлы",
  cups: "Кубки",
  swords: "Мечи",
  pentacles: "Пентакли",
};

export type TarotSectionId = "major" | TarotSuit;

export const TAROT_SECTIONS: {
  id: TarotSectionId;
  title: string;
  description: string;
  count: number;
}[] = [
  {
    id: "major",
    title: "Старшие Арканы",
    description: "22 архетипа пути — от Шута до Мира",
    count: 22,
  },
  {
    id: "wands",
    title: "Жезлы",
    description: "Огонь, действие, инициатива",
    count: 14,
  },
  {
    id: "cups",
    title: "Кубки",
    description: "Вода, чувства, отношения",
    count: 14,
  },
  {
    id: "swords",
    title: "Мечи",
    description: "Воздух, мысль, ясность",
    count: 14,
  },
  {
    id: "pentacles",
    title: "Пентакли",
    description: "Земля, ресурсы, устойчивость",
    count: 14,
  },
];

function toSlug(engineId: string): string {
  return ENGINE_ID_TO_SLUG[engineId] ?? engineId.replace(/_/g, "-");
}

function toEngineId(slug: string): string {
  return SLUG_TO_ENGINE_ID[slug] ?? slug.replace(/-/g, "_");
}

function defaultSymbols(name: string, element: string): TarotSymbol[] {
  return [
    { id: "s1", name: "Элемент", description: element, x: 50, y: 28 },
    { id: "s2", name: "Смысл", description: name, x: 50, y: 72 },
  ];
}

function relatedSlugs(engineId: string, arcana: TarotArcana, suit: TarotSuit | null): string[] {
  const pool = tarotDeckCards.filter((c) =>
    arcana === "major" ? c.arcana === "major" : c.suit === suit
  );
  const idx = pool.findIndex((c) => c.id === engineId);
  if (idx < 0 || pool.length < 2) return [];
  const prev = pool[(idx - 1 + pool.length) % pool.length];
  const next = pool[(idx + 1) % pool.length];
  return [toSlug(prev.id), toSlug(next.id)];
}

export const tarotCards: TarotCard[] = tarotDeckCards.map((deck) => {
  const slug = toSlug(deck.id);
  const isMajor = deck.arcana === "major";
  const premium = isMajor ? deck.number >= 11 : true;

  return {
    id: `tarot-${deck.id}`,
    slug,
    number: deck.number,
    name: deck.name,
    shortMeaning: deck.keywords.join(", "),
    fullMeaning: deck.meanings.general,
    lightSide: deck.light,
    shadowSide: deck.shadow,
    relationshipsMeaning: deck.meanings.love,
    workMeaning: deck.meanings.work,
    decisionMeaning: deck.meanings.neutralGuidance,
    financeMeaning: deck.meanings.finance,
    innerMeaning: deck.meanings.inner,
    symbols: LEGACY_SYMBOLS[slug] ?? defaultSymbols(deck.name, deck.element),
    image: LEGACY_IMAGES[slug] ?? `/images/tarot/${slug}.svg`,
    premium,
    tags: [...deck.keywords],
    relatedCards: relatedSlugs(deck.id, deck.arcana, deck.suit),
    relatedSpreads: isMajor
      ? ["one-card", "three-cards"]
      : ["three-cards", "relationships"],
    arcana: deck.arcana,
    suit: deck.suit,
    element: deck.element,
    rank: deck.rank,
    engineId: deck.id,
    suitLabel: deck.suit ? SUIT_LABELS[deck.suit] : "Старшие Арканы",
  };
});

const bySlug = new Map(tarotCards.map((c) => [c.slug, c]));
const byEngineId = new Map(tarotCards.map((c) => [c.engineId!, c]));

export function getTarotCardBySlug(slug: string): TarotCard | undefined {
  return bySlug.get(slug) ?? byEngineId.get(slug) ?? byEngineId.get(toEngineId(slug));
}

export function getTarotCardByNumber(number: number): TarotCard | undefined {
  return tarotCards.find((c) => c.number === number && c.arcana === "major");
}

export function getTarotEngineId(slug: string): string | undefined {
  const card = getTarotCardBySlug(slug);
  return card?.engineId ?? SLUG_TO_ENGINE_ID[slug] ?? (byEngineId.has(slug) ? slug : undefined);
}

export function getCardsBySection(section: TarotSectionId): TarotCard[] {
  if (section === "major") {
    return tarotCards.filter((c) => c.arcana === "major");
  }
  return tarotCards.filter((c) => c.suit === section);
}

export function getTarotSection(section: string): (typeof TAROT_SECTIONS)[number] | undefined {
  return TAROT_SECTIONS.find((s) => s.id === section);
}

export function getArcanaLabel(card: TarotCard): string {
  if (card.arcana === "major") return "Старший Аркан";
  return card.suitLabel ?? "Младший Аркан";
}

export type { TarotArcana, TarotSuit };
