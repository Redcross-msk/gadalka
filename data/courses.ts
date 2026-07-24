import type { Course } from "@/types";

export const courses: Course[] = [
  {
    id: "c-1", slug: "tarot-basics", name: "Основы Таро", description: "Введение в мир карт Таро: история, структура колоды, этика работы с картами.", lessonCount: 5, premium: false, image: "/images/courses/basics.svg",
    lessons: [
      { id: "l-1", title: "Что такое Таро", content: "Таро — это система символов, используемая для самопознания и размышления. Карты не предсказывают будущее, а помогают увидеть ситуацию с новой стороны.", exercise: "Посмотрите на колоду и выберите карту, которая привлекает вас больше всего. Запишите первые ассоциации.", quiz: [{ id: "q1", question: "Таро — это...", options: ["Инструмент самопознания", "Гадание на будущее", "Магический ритуал"], correctIndex: 0 }] },
      { id: "l-2", title: "Структура колоды", content: "Колода состоит из 22 Старших и 56 Младших Арканов. Старшие Арканы — архетипы, Младшие — повседневные ситуации.", exercise: "Разделите колоду на Старшие и Младшие Арканы.", quiz: [{ id: "q1", question: "Сколько Старших Арканов?", options: ["22", "56", "78"], correctIndex: 0 }] },
      { id: "l-3", title: "Этика работы с картами", content: "Важно помнить: карты — инструмент размышления, а не медицинская или юридическая консультация.", exercise: "Сформулируйте свой этический кодекс работы с картами.", quiz: [{ id: "q1", question: "Карты Таро заменяют...", options: ["Ничего — это развлечение", "Врача", "Юриста"], correctIndex: 0 }] },
      { id: "l-4", title: "Первый расклад", content: "Начните с простого расклада «Одна карта». Сформулируйте вопрос и вытяните карту.", exercise: "Сделайте расклад «Одна карта» на тему дня.", quiz: [{ id: "q1", question: "Лучший первый расклад —", options: ["Одна карта", "Кельтский крест", "12 карт"], correctIndex: 0 }] },
      { id: "l-5", title: "Ведение дневника", content: "Записывайте свои расклады, впечатления и инсайты. Это поможет отслеживать прогресс.", exercise: "Создайте первую запись в дневнике.", quiz: [{ id: "q1", question: "Дневник помогает...", options: ["Отслеживать прогресс", "Предсказывать будущее", "Зарабатывать деньги"], correctIndex: 0 }] },
    ],
  },
  {
    id: "c-2", slug: "major-arcana", name: "Старшие Арканы", description: "Глубокое изучение 22 Старших Арканов и их архетипических значений.", lessonCount: 4, premium: true, image: "/images/courses/major.svg",
    lessons: [
      { id: "l-1", title: "Путь Шута", content: "Путешествие от Шута (0) до Мира (21) — это путь героя через архетипы.", exercise: "Расположите Старшие Арканы в порядке номеров.", quiz: [{ id: "q1", question: "Шут имеет номер", options: ["0", "1", "22"], correctIndex: 0 }] },
      { id: "l-2", title: "Архетипы 1-7", content: "От Мага до Колесницы — этап формирования личности и воли.", exercise: "Выберите 3 карты из этого диапазона и опишите их связь.", quiz: [{ id: "q1", question: "Маг символизирует", options: ["Волю и мастерство", "Любовь", "Смерть"], correctIndex: 0 }] },
      { id: "l-3", title: "Архетипы 8-14", content: "От Силы до Умеренности — этап внутренней трансформации.", exercise: "Сравните Силу и Колесницу.", quiz: [{ id: "q1", question: "Повешенный учит", options: ["Новому взгляду", "Агрессии", "Контролю"], correctIndex: 0 }] },
      { id: "l-4", title: "Архетипы 15-21", content: "От Дьявола до Мира — этап духовного пробуждения.", exercise: "Проследите путь от Башни до Мира.", quiz: [{ id: "q1", question: "Мир символизирует", options: ["Завершение и целостность", "Начало", "Кризис"], correctIndex: 0 }] },
    ],
  },
  { id: "c-3", slug: "minor-arcana", name: "Младшие Арканы", description: "Четыре масти и их значения в повседневной жизни.", lessonCount: 3, premium: true, image: "/images/courses/minor.svg", lessons: [{ id: "l-1", title: "Четыре масти", content: "Жезлы, Кубки, Мечи, Пентакли — четыре стихии жизни.", exercise: "Определите свою «домinant» масть.", quiz: [{ id: "q1", question: "Кубки связаны с", options: ["Эмоциями", "Деньгами", "Конфликтами"], correctIndex: 0 }] }] },
  { id: "c-4", slug: "combinations", name: "Сочетания карт", description: "Как читать карты в контексте друг друга.", lessonCount: 3, premium: true, image: "/images/courses/combo.svg", lessons: [{ id: "l-1", title: "Пары карт", content: "Две карты рядом создают диалог.", exercise: "Вытяните две карты и опишите их взаимодействие.", quiz: [{ id: "q1", question: "Сочетание усиливает", options: ["Общий смысл", "Случайность", "Ничего"], correctIndex: 0 }] }] },
  { id: "c-5", slug: "questions", name: "Как формулировать вопросы", description: "Искусство правильного вопроса для расклада.", lessonCount: 3, premium: false, image: "/images/courses/questions.svg", lessons: [{ id: "l-1", title: "Хороший вопрос", content: "Открытые вопросы лучше закрытых. «Что мне важно знать?» лучше «Да или нет?»", exercise: "Переформулируйте 3 закрытых вопроса в открытые.", quiz: [{ id: "q1", question: "Лучший вопрос —", options: ["Открытый", "Да/Нет", "Когда умру"], correctIndex: 0 }] }] },
  { id: "c-6", slug: "story-reading", name: "Как читать расклад как историю", description: "Создание связного нarrative из карт.", lessonCount: 3, premium: true, image: "/images/courses/story.svg", lessons: [{ id: "l-1", title: "Нarrative", content: "Каждый расклад — история с началом, серединой и концом.", exercise: "Прочитайте трёхкарточный расклад как рассказ.", quiz: [{ id: "q1", question: "Расклад — это", options: ["История", "Список фактов", "Предсказание"], correctIndex: 0 }] }] },
  { id: "c-7", slug: "symbols-tarot", name: "Символы в Таро", description: "Расшифровка символики на картах.", lessonCount: 3, premium: true, image: "/images/courses/symbols.svg", lessons: [{ id: "l-1", title: "Цвет и символ", content: "Каждый элемент на карте несёт значение.", exercise: "Выберите карту и опишите 5 символов.", quiz: [{ id: "q1", question: "Символы помогают", options: ["Глубже понять карту", "Украсить карту", "Запутать"], correctIndex: 0 }] }] },
  { id: "c-8", slug: "beginner-mistakes", name: "Ошибки начинающих", description: "Распространённые ошибки и как их избежать.", lessonCount: 3, premium: false, image: "/images/courses/mistakes.svg", lessons: [{ id: "l-1", title: "Типичные ошибки", content: "Запоминание значений без понимания, страх «плохих» карт, зависимость от карт.", exercise: "Определите свою главную ошибку.", quiz: [{ id: "q1", question: "Плохих карт", options: ["Не существует", "Много", "Только Смерть"], correctIndex: 0 }] }] },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
