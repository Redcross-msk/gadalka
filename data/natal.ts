import type { NatalChart, ZodiacSign } from "@/types";
import { getTodayHoroscope, getZodiacName, zodiacSigns } from "./horoscopes";

export type ConstellationStar = {
  id: string;
  x: number;
  y: number;
  size: number;
  label?: string;
};

export type ConstellationInfo = {
  sign: ZodiacSign;
  constellationName: string;
  symbol: string;
  element: string;
  modality: string;
  rulingPlanet: string;
  description: string;
  stars: ConstellationStar[];
  lines: [string, string][];
};

const constellationData: Record<ZodiacSign, Omit<ConstellationInfo, "sign">> = {
  aries: {
    constellationName: "Овен",
    symbol: "♈",
    element: "Огонь",
    modality: "Кардинальный",
    rulingPlanet: "Марс",
    description: "Энергия начала, импульс и смелость. Ваша матрица тянется к действию и первооткрытию.",
    stars: [
      { id: "a1", x: 28, y: 55, size: 3.2, label: "Хамаль" },
      { id: "a2", x: 42, y: 48, size: 2.4 },
      { id: "a3", x: 55, y: 42, size: 2.8 },
      { id: "a4", x: 68, y: 38, size: 2.2 },
      { id: "a5", x: 72, y: 52, size: 2 },
    ],
    lines: [["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a4", "a5"]],
  },
  taurus: {
    constellationName: "Телец",
    symbol: "♉",
    element: "Земля",
    modality: "Фиксированный",
    rulingPlanet: "Венера",
    description: "Стабильность, чувственность и терпение. Матрица усиливает умение создавать и удерживать ценное.",
    stars: [
      { id: "t1", x: 30, y: 42, size: 3.4, label: "Альдебаран" },
      { id: "t2", x: 44, y: 38, size: 2.2 },
      { id: "t3", x: 58, y: 45, size: 2.4 },
      { id: "t4", x: 68, y: 55, size: 2 },
      { id: "t5", x: 52, y: 62, size: 2.2 },
    ],
    lines: [["t1", "t2"], ["t2", "t3"], ["t3", "t4"], ["t3", "t5"], ["t1", "t5"]],
  },
  gemini: {
    constellationName: "Близнецы",
    symbol: "♊",
    element: "Воздух",
    modality: "Мутабельный",
    rulingPlanet: "Меркурий",
    description: "Гибкость ума, диалог и любопытство. Матрица открывает каналы обмена идеями.",
    stars: [
      { id: "g1", x: 35, y: 35, size: 3, label: "Кастор" },
      { id: "g2", x: 42, y: 38, size: 3, label: "Поллукс" },
      { id: "g3", x: 55, y: 48, size: 2.2 },
      { id: "g4", x: 62, y: 58, size: 2 },
      { id: "g5", x: 48, y: 65, size: 2.2 },
    ],
    lines: [["g1", "g2"], ["g2", "g3"], ["g3", "g4"], ["g4", "g5"], ["g1", "g5"]],
  },
  cancer: {
    constellationName: "Рак",
    symbol: "♋",
    element: "Вода",
    modality: "Кардинальный",
    rulingPlanet: "Луна",
    description: "Интуиция, защита и глубина чувств. Матрица связана с домом, памятью и внутренним корнем.",
    stars: [
      { id: "c1", x: 40, y: 40, size: 2.4 },
      { id: "c2", x: 52, y: 35, size: 2.8 },
      { id: "c3", x: 62, y: 48, size: 2.2 },
      { id: "c4", x: 48, y: 58, size: 2.4 },
      { id: "c5", x: 35, y: 52, size: 2 },
    ],
    lines: [["c1", "c2"], ["c2", "c3"], ["c3", "c4"], ["c4", "c5"], ["c5", "c1"]],
  },
  leo: {
    constellationName: "Лев",
    symbol: "♌",
    element: "Огонь",
    modality: "Фиксированный",
    rulingPlanet: "Солнце",
    description: "Сияние, творчество и сердце. Матрица раскрывает потребность творить и вдохновлять.",
    stars: [
      { id: "l1", x: 32, y: 58, size: 3.6, label: "Регул" },
      { id: "l2", x: 45, y: 48, size: 2.4 },
      { id: "l3", x: 58, y: 42, size: 2.6 },
      { id: "l4", x: 68, y: 50, size: 2.2 },
      { id: "l5", x: 55, y: 62, size: 2 },
    ],
    lines: [["l1", "l2"], ["l2", "l3"], ["l3", "l4"], ["l2", "l5"], ["l5", "l1"]],
  },
  virgo: {
    constellationName: "Дева",
    symbol: "♍",
    element: "Земля",
    modality: "Мутабельный",
    rulingPlanet: "Меркурий",
    description: "Анализ, служение и точность. Матрица усиливает способность видеть детали и улучшать.",
    stars: [
      { id: "v1", x: 38, y: 38, size: 3.2, label: "Спика" },
      { id: "v2", x: 50, y: 45, size: 2.2 },
      { id: "v3", x: 60, y: 52, size: 2.4 },
      { id: "v4", x: 48, y: 62, size: 2 },
      { id: "v5", x: 35, y: 55, size: 2.2 },
    ],
    lines: [["v1", "v2"], ["v2", "v3"], ["v3", "v4"], ["v4", "v5"]],
  },
  libra: {
    constellationName: "Весы",
    symbol: "♎",
    element: "Воздух",
    modality: "Кардинальный",
    rulingPlanet: "Венера",
    description: "Гармония, справедливость и красота. Матрица ищет равновесие в отношениях и решениях.",
    stars: [
      { id: "li1", x: 30, y: 50, size: 2.4 },
      { id: "li2", x: 45, y: 42, size: 2.8 },
      { id: "li3", x: 58, y: 45, size: 2.6 },
      { id: "li4", x: 70, y: 52, size: 2.4 },
      { id: "li5", x: 50, y: 62, size: 2.2 },
    ],
    lines: [["li1", "li2"], ["li2", "li3"], ["li3", "li4"], ["li2", "li5"], ["li4", "li5"]],
  },
  scorpio: {
    constellationName: "Скорпион",
    symbol: "♏",
    element: "Вода",
    modality: "Фиксированный",
    rulingPlanet: "Плутон",
    description: "Трансформация, глубина и сила. Матрица связана с тайным и возрождением.",
    stars: [
      { id: "s1", x: 28, y: 55, size: 3, label: "Антарес" },
      { id: "s2", x: 42, y: 48, size: 2.4 },
      { id: "s3", x: 55, y: 42, size: 2.6 },
      { id: "s4", x: 68, y: 48, size: 2.2 },
      { id: "s5", x: 72, y: 62, size: 2.4 },
    ],
    lines: [["s1", "s2"], ["s2", "s3"], ["s3", "s4"], ["s4", "s5"]],
  },
  sagittarius: {
    constellationName: "Стрелец",
    symbol: "♐",
    element: "Огонь",
    modality: "Мутабельный",
    rulingPlanet: "Юпитер",
    description: "Горизонт, смысл и свобода. Матрица тянет к поиску истины и расширению.",
    stars: [
      { id: "sg1", x: 35, y: 65, size: 2.8 },
      { id: "sg2", x: 48, y: 52, size: 3.2 },
      { id: "sg3", x: 58, y: 42, size: 2.4 },
      { id: "sg4", x: 65, y: 35, size: 2.2 },
      { id: "sg5", x: 52, y: 38, size: 2 },
    ],
    lines: [["sg1", "sg2"], ["sg2", "sg3"], ["sg3", "sg4"], ["sg2", "sg5"]],
  },
  capricorn: {
    constellationName: "Козерог",
    symbol: "♑",
    element: "Земля",
    modality: "Кардинальный",
    rulingPlanet: "Сатурн",
    description: "Структура, амбиции и время. Матрица строит опору через дисциплину и цель.",
    stars: [
      { id: "cp1", x: 38, y: 38, size: 2.4 },
      { id: "cp2", x: 48, y: 45, size: 2.8 },
      { id: "cp3", x: 58, y: 52, size: 2.6 },
      { id: "cp4", x: 62, y: 65, size: 2.2 },
      { id: "cp5", x: 45, y: 62, size: 2 },
    ],
    lines: [["cp1", "cp2"], ["cp2", "cp3"], ["cp3", "cp4"], ["cp4", "cp5"]],
  },
  aquarius: {
    constellationName: "Водолей",
    symbol: "♒",
    element: "Воздух",
    modality: "Фиксированный",
    rulingPlanet: "Уран",
    description: "Оригинальность, будущее и сообщество. Матрица соединяет идеи и людей нестандартно.",
    stars: [
      { id: "aq1", x: 32, y: 48, size: 2.4 },
      { id: "aq2", x: 42, y: 42, size: 2.6 },
      { id: "aq3", x: 55, y: 40, size: 2.8 },
      { id: "aq4", x: 68, y: 45, size: 2.4 },
      { id: "aq5", x: 58, y: 58, size: 2.2 },
    ],
    lines: [["aq1", "aq2"], ["aq2", "aq3"], ["aq3", "aq4"], ["aq3", "aq5"]],
  },
  pisces: {
    constellationName: "Рыбы",
    symbol: "♓",
    element: "Вода",
    modality: "Мутабельный",
    rulingPlanet: "Нептун",
    description: "Воображение, сострадание и тонкие грани. Матрица чувствует невидимое и символическое.",
    stars: [
      { id: "p1", x: 30, y: 45, size: 2.4 },
      { id: "p2", x: 42, y: 52, size: 2.8 },
      { id: "p3", x: 55, y: 48, size: 2.4 },
      { id: "p4", x: 65, y: 55, size: 2.6 },
      { id: "p5", x: 48, y: 65, size: 2.2 },
    ],
    lines: [["p1", "p2"], ["p2", "p3"], ["p3", "p4"], ["p2", "p5"], ["p4", "p5"]],
  },
};

export function getZodiacFromDate(dateStr: string): ZodiacSign | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}

export function getConstellation(sign: ZodiacSign): ConstellationInfo {
  return { sign, ...constellationData[sign] };
}

function lifePathNumber(dateStr: string): number {
  const digits = dateStr.replace(/\D/g, "");
  let sum = digits.split("").reduce((a, b) => a + Number(b), 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split("").reduce((a, b) => a + Number(b), 0);
  }
  return sum;
}

const lifePathDescriptions: Record<number, string> = {
  1: "Лидерство и самостоятельный путь",
  2: "Партнёрство и тонкая чувствительность",
  3: "Творчество и самовыражение",
  4: "Структура и надёжный фундамент",
  5: "Свобода и перемены",
  6: "Забота и гармония в отношениях",
  7: "Глубина, анализ и духовный поиск",
  8: "Сила, амбиции и материальный рост",
  9: "Мудрость и завершение циклов",
  11: "Интуиция и вдохновляющий дар",
  22: "Мастер-строитель больших замыслов",
};

export function getNatalMatrix(natal: NatalChart, sign: ZodiacSign) {
  const constellation = getConstellation(sign);
  const path = lifePathNumber(natal.birthDate);

  return {
    lifePath: path,
    lifePathDescription: lifePathDescriptions[path] ?? lifePathDescriptions[9],
    element: constellation.element,
    modality: constellation.modality,
    rulingPlanet: constellation.rulingPlanet,
    ascendantHint: natal.birthTime
      ? `Время ${natal.birthTime} усиливает личную ось карты`
      : "Добавьте время рождения для точного восхода",
    summary: `${constellation.constellationName} · путь ${path}. ${constellation.description}`,
  };
}

function dayHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000;
  return h;
}

export function getNatalDailyEnergies(sign: ZodiacSign, birthDate: string) {
  const today = new Date().toISOString().split("T")[0];
  const base = dayHash(`${sign}-${birthDate}-${today}`);

  const dims = ["Энергия", "Интуиция", "Любовь", "Ясность", "Удача"];
  return dims.map((label, i) => ({
    label,
    value: 45 + ((base + i * 97) % 50),
  }));
}

const natalFocusTexts: Record<ZodiacSign, string> = {
  aries: "Марс подсвечивает вашу натальную ось — день благоприятен для смелых решений.",
  taurus: "Венера смягчает ритм дня — опирайтесь на то, что приносит стабильность.",
  gemini: "Меркурий активирует мысль — короткий диалог может дать ключ.",
  cancer: "Луна усиливает чувствительность — берегите внутреннее пространство.",
  leo: "Солнце в резонансе с картой — самовыражение сегодня особенно уместно.",
  virgo: "Меркурий просит порядок — одна завершённая задача принесёт покой.",
  libra: "Венера ищет баланс — честный разговор важнее видимой гармонии.",
  scorpio: "Плутон углубляет день — доверяйте интуиции, но не копайте лишнего.",
  sagittarius: "Юпитер расширяет горизонт — даже малый шаг обновит взгляд.",
  capricorn: "Сатурн поддерживает структуру — закрепите один результат.",
  aquarius: "Уран приносит неожиданное — нестандартная идея может сработать.",
  pisces: "Нептун шепчет образами — запишите знак или сон, если он повторится.",
};

export function getNatalDailyReading(sign: ZodiacSign, natal?: NatalChart) {
  const horoscope = getTodayHoroscope(sign);
  const constellation = getConstellation(sign);
  const matrix = natal ? getNatalMatrix(natal, sign) : null;
  const energies = getNatalDailyEnergies(sign, natal?.birthDate ?? sign);
  const natalFocus = natalFocusTexts[sign];

  return {
    ...horoscope,
    constellation,
    matrix,
    natalFocus,
    energies,
    hasNatal: Boolean(natal?.birthDate),
  };
}

export function formatBirthDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatBirthTime(time?: string) {
  if (!time) return "Не указано";
  return time;
}

export { zodiacSigns, getZodiacName };
