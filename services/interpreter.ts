import type { InterpreterMode } from "@/types";
import { formatDreamInterpretation, interpretDream } from "@/data/dreamInterpreter";

const responses: Record<Exclude<InterpreterMode, "dream">, string[]> = {
  spread: [
    "Ваш расклад показывает интересную динамику. Первая карта указывает на корень ситуации, вторая — на текущее состояние, а третья открывает возможное направление развития.",
    "Карты в вашем раскладе создают историю перехода. Обратите внимание на повторяющиеся темы — они указывают на главный урок.",
    "Расклад говорит о периоде перемен. Старые структуры уступают место новым, и это естественный процесс роста.",
  ],
  symbol: [
    "Этот символ часто появляется в моменты выбора. Он приглашает вас обратить внимание на возможности, которые вы, возможно, не замечаете.",
    "В культурном контексте этот знак связан с переходом и трансформацией. В вашей жизни он может указывать на приближающиеся изменения.",
    "Психологически этот символ отражает ваше внутреннее состояние. Спросите себя: что этот знак значит лично для вас?",
  ],
  question: [
    "Хороший вопрос открывает пространство для размышления. Попробуйте переформулировать: вместо «да/нет» спросите «что мне важно знать о...»",
    "Ваш вопрос можно углубить. Добавьте контекст: «Что поможет мне понять...» или «Какой урок несёт эта ситуация?»",
    "Помните: лучшие вопросы начинаются с «что», «как» и «почему». Они открывают больше возможностей для инсайтов.",
  ],
  tarot: [
    "Эта карта — мощный архетип. В прямом положении она говорит о новых начинаниях и доверии к процессу. Подумайте, где в вашей жизни проявляется эта энергия.",
    "Карта несёт важное послание. Её светлая сторона — свобода и возможности, теневая — безрассудство. Какой аспект резонирует с вами сейчас?",
    "В контексте вашего вопроса эта карта предлагает посмотреть на ситуацию с другой стороны. Какие ресурсы у вас уже есть?",
  ],
};

export async function sendMessage(
  mode: InterpreterMode,
  message: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  if (mode === "dream") {
    return formatDreamInterpretation(interpretDream(message));
  }

  const modeResponses = responses[mode];
  const baseResponse = modeResponses[Math.floor(Math.random() * modeResponses.length)];

  if (message.length > 20) {
    return `${baseResponse}\n\nВаш вопрос «${message.slice(0, 50)}${message.length > 50 ? "..." : ""}» затрагивает важную тему. Рекомендую также обратить внимание на связанные символы в вашем Архиве.`;
  }

  return baseResponse;
}

export function generateSessionTitle(mode: InterpreterMode, firstMessage: string): string {
  const prefixes: Record<InterpreterMode, string> = {
    dream: "Сон:",
    spread: "Расклад:",
    symbol: "Знак:",
    question: "Вопрос:",
    tarot: "Карта:",
  };
  const prefix = prefixes[mode];
  const truncated = firstMessage.slice(0, 30);
  return `${prefix} ${truncated}${firstMessage.length > 30 ? "..." : ""}`;
}

export const interpreterModes = [
  { id: "dream" as const, label: "Расшифровать сон", icon: "Moon" },
  { id: "spread" as const, label: "Объяснить расклад", icon: "Layers" },
  { id: "symbol" as const, label: "Объяснить знак", icon: "Eye" },
  { id: "question" as const, label: "Сформулировать вопрос", icon: "MessageCircle" },
  { id: "tarot" as const, label: "Изучить карту", icon: "Sparkles" },
];

export const premiumFeatures = [
  "Память предыдущих диалогов",
  "Неограниченные запросы",
  "Анализ истории",
  "Голосовой ввод",
  "Расширенные ответы",
];

// Future: replace with OpenAI API or other AI service
// export async function sendMessageToAI(mode, message, history) { ... }
