import type { VisitorRequestDef } from "@/types/game";

export const VISITOR_REQUESTS: VisitorRequestDef[] = [
  { id: "r01", name: "Марина", category: "dream", situation: "Несколько ночей подряд видит один и тот же закрытый дом. Хочет понять, почему образ повторяется.", bestTool: "dream_book", okTools: ["mirror", "sign_book"], durationSec: 30, baseReward: 80, xpReward: 12, bonusChance: 0.35 },
  { id: "r02", name: "Игорь", category: "relationship", situation: "После ссоры находит на столе чужой ключ. Не знает, оставить ли разговор или ждать.", bestTool: "deck", okTools: ["sign_book", "archive"], durationSec: 60, baseReward: 120, xpReward: 18, bonusChance: 0.3 },
  { id: "r03", name: "Елена", category: "family", situation: "В квартире бабушки нашла письмо без адресата. На полях повторяется один знак.", bestTool: "archive", okTools: ["sign_book", "mirror"], durationSec: 60, baseReward: 140, xpReward: 20, bonusChance: 0.4 },
  { id: "r04", name: "Артём", category: "decision", situation: "Стоит перед сменой работы. Каждое утро видит одну и ту же птицу у окна.", bestTool: "deck", okTools: ["sign_book", "archive"], durationSec: 30, baseReward: 90, xpReward: 14, bonusChance: 0.25 },
  { id: "r05", name: "Ольга", category: "found_item", situation: "Купила на блошином рынке зеркало. В отражении иногда мелькает чужая тень.", bestTool: "mirror", okTools: ["sign_book", "deck"], durationSec: 60, baseReward: 130, xpReward: 18, bonusChance: 0.45 },
  { id: "r06", name: "Никита", category: "repeating_sign", situation: "Один и тот же узор появляется на чашке, в блокноте и на стекле автобуса.", bestTool: "sign_book", okTools: ["mirror", "archive"], durationSec: 30, baseReward: 70, xpReward: 10, bonusChance: 0.5 },
  { id: "r07", name: "Светлана", category: "past_event", situation: "Вспоминает день, когда часы остановились ровно в 3:17. Хочет понять связь.", bestTool: "archive", okTools: ["dream_book", "sign_book"], durationSec: 180, baseReward: 280, xpReward: 35, bonusChance: 0.35 },
  { id: "r08", name: "Павел", category: "coincidence", situation: "Три раза подряд встретил одного человека в разных частях города.", bestTool: "deck", okTools: ["mirror", "sign_book"], durationSec: 60, baseReward: 110, xpReward: 16, bonusChance: 0.3 },
  { id: "r09", name: "Дарья", category: "dream", situation: "Во сне поднимается по лестнице, которой нет в её доме. Наверху — закрытая дверь.", bestTool: "dream_book", okTools: ["mirror", "deck"], durationSec: 60, baseReward: 150, xpReward: 22, bonusChance: 0.4 },
  { id: "r10", name: "Кирилл", category: "relationship", situation: "Партнёр молчит уже неделю. На столе лежит нить — будто намёк.", bestTool: "deck", okTools: ["sign_book", "dream_book"], durationSec: 180, baseReward: 260, xpReward: 32, bonusChance: 0.28 },
  { id: "r11", name: "Анна", category: "family", situation: "Мать просит не открывать старый шкаф. Анна уже открыла — внутри пусто, кроме запаха воска.", bestTool: "archive", okTools: ["mirror", "sign_book"], durationSec: 180, baseReward: 300, xpReward: 38, bonusChance: 0.42 },
  { id: "r12", name: "Роман", category: "decision", situation: "Два предложения о переезде. На обоих конвертах — один и тот же водяной знак.", bestTool: "sign_book", okTools: ["deck", "archive"], durationSec: 60, baseReward: 125, xpReward: 17, bonusChance: 0.33 },
  { id: "r13", name: "Юлия", category: "found_item", situation: "В кармане пальто нашла чужое кольцо. Пальто — наследство.", bestTool: "archive", okTools: ["mirror", "deck"], durationSec: 60, baseReward: 135, xpReward: 19, bonusChance: 0.36 },
  { id: "r14", name: "Максим", category: "repeating_sign", situation: "На каждом новом рабочем столе появляется царапина в форме треугольника.", bestTool: "sign_book", okTools: ["mirror", "deck"], durationSec: 30, baseReward: 75, xpReward: 11, bonusChance: 0.48 },
  { id: "r15", name: "Ирина", category: "past_event", situation: "Десять лет назад потеряла фотографию. Вчера она лежала на её тумбочке.", bestTool: "archive", okTools: ["dream_book", "mirror"], durationSec: 300, baseReward: 480, xpReward: 55, bonusChance: 0.4 },
  { id: "r16", name: "Сергей", category: "coincidence", situation: "Книга, которую он искал месяц, сама упала с полки в чужой библиотеке.", bestTool: "deck", okTools: ["sign_book", "archive"], durationSec: 60, baseReward: 115, xpReward: 15, bonusChance: 0.32 },
  { id: "r17", name: "Вера", category: "dream", situation: "Слышит во сне голос, который зовёт по имени, но лицо всегда в тени.", bestTool: "dream_book", okTools: ["mirror", "sign_book"], durationSec: 180, baseReward: 270, xpReward: 34, bonusChance: 0.38 },
  { id: "r18", name: "Алексей", category: "relationship", situation: "Друг вернул долг купюрой, сложенной в сложный узел. Не может развязать.", bestTool: "deck", okTools: ["sign_book", "archive"], durationSec: 30, baseReward: 85, xpReward: 13, bonusChance: 0.27 },
  { id: "r19", name: "Татьяна", category: "family", situation: "Дед молчал о войне, но оставил часы без стрелок. Они тикают сами.", bestTool: "archive", okTools: ["sign_book", "dream_book"], durationSec: 300, baseReward: 520, xpReward: 60, bonusChance: 0.45 },
  { id: "r20", name: "Глеб", category: "decision", situation: "Нужно выбрать: остаться в городе или уехать. В обоих вариантах ему снятся одни часы.", bestTool: "deck", okTools: ["dream_book", "sign_book"], durationSec: 180, baseReward: 250, xpReward: 30, bonusChance: 0.3 },
  { id: "r21", name: "Наталья", category: "found_item", situation: "На чердаке — коробка с письмами, адресованными ей, но написанными до её рождения.", bestTool: "archive", okTools: ["sign_book", "mirror"], durationSec: 300, baseReward: 500, xpReward: 58, bonusChance: 0.5 },
  { id: "r22", name: "Вадим", category: "repeating_sign", situation: "Каждый раз, когда сомневается, на стекле появляется круг с точкой.", bestTool: "mirror", okTools: ["sign_book", "deck"], durationSec: 60, baseReward: 145, xpReward: 21, bonusChance: 0.55 },
  { id: "r23", name: "Людмила", category: "past_event", situation: "Вернулась в школьный двор. Дерево, у которого она загадывала желание, всё ещё стоит.", bestTool: "dream_book", okTools: ["archive", "sign_book"], durationSec: 180, baseReward: 290, xpReward: 36, bonusChance: 0.34 },
  { id: "r24", name: "Фёдор", category: "coincidence", situation: "Два незнакомых человека за день сказали ему одну и ту же фразу про дверь.", bestTool: "deck", okTools: ["sign_book", "mirror"], durationSec: 30, baseReward: 95, xpReward: 14, bonusChance: 0.29 },
];

export function getRequestDef(id: string): VisitorRequestDef | undefined {
  return VISITOR_REQUESTS.find((r) => r.id === id);
}

export const TOOL_LABELS: Record<string, string> = {
  deck: "Колода",
  dream_book: "Книга снов",
  mirror: "Зеркало",
  archive: "Архив",
  sign_book: "Книга знаков",
};
