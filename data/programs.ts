import type { Program } from "@/types";

export const programs: Program[] = [
  {
    id: "pr-1", slug: "week-of-clarity", name: "Неделя ясности", description: "7 дней для обретения ясности в текущей ситуации.", duration: "7 дней", premium: false, status: "not_started", image: "/images/programs/clarity.svg",
    stages: [
      { id: "s1", day: 1, title: "Карта намерения", description: "Выберите карту, которая отражает ваше намерение на неделю.", completed: false },
      { id: "s2", day: 2, title: "Символ дня", description: "Запишите символ, который встретился сегодня.", completed: false },
      { id: "s3", day: 3, title: "Утренний вопрос", description: "Сформулируйте вопрос для утренней медитации.", completed: false },
      { id: "s4", day: 4, title: "Мини-расклад", description: "Сделайте расклад из одной карты.", completed: false },
      { id: "s5", day: 5, title: "Вечерняя рефлексия", description: "Запишите итоги дня.", completed: false },
      { id: "s6", day: 6, title: "Знак недели", description: "Определите главный знак недели.", completed: false },
      { id: "s7", day: 7, title: "Итоги", description: "Подведите итоги программы.", completed: false },
    ],
  },
  {
    id: "pr-2", slug: "seven-dreams", name: "Семь снов", description: "Неделя наблюдения за снами и их символами.", duration: "7 дней", premium: true, status: "not_started", image: "/images/programs/dreams.svg",
    stages: [
      { id: "s1", day: 1, title: "Подготовка", description: "Поставьте блокнот у кровати.", completed: false },
      { id: "s2", day: 2, title: "Первый сон", description: "Запишите утренний сон.", completed: false },
      { id: "s3", day: 3, title: "Символы", description: "Выделите ключевые символы.", completed: false },
      { id: "s4", day: 4, title: "Эмоции", description: "Опишите эмоции во сне.", completed: false },
      { id: "s5", day: 5, title: "Связь с жизнью", description: "Найдите параллели с реальностью.", completed: false },
      { id: "s6", day: 6, title: "Повторения", description: "Отметьте повторяющиеся образы.", completed: false },
      { id: "s7", day: 7, title: "Карта снов", description: "Создайте карту ваших снов.", completed: false },
    ],
  },
  { id: "pr-3", slug: "important-decision", name: "Важное решение", description: "5-дневная программа для принятия важного решения.", duration: "5 дней", premium: true, status: "not_started", image: "/images/programs/decision.svg", stages: [{ id: "s1", day: 1, title: "Формулировка", description: "Чётко сформулируйте решение.", completed: false }, { id: "s2", day: 2, title: "Варианты", description: "Запишите все варианты.", completed: false }, { id: "s3", day: 3, title: "Расклад", description: "Сделайте расклад на решение.", completed: false }, { id: "s4", day: 4, title: "Рефлексия", description: "Обдумайте результаты.", completed: false }, { id: "s5", day: 5, title: "Выбор", description: "Примите решение.", completed: false }] },
  { id: "pr-4", slug: "deck-intro", name: "Знакомство с колодой", description: "21 день знакомства с каждой картой Старших Арканов.", duration: "21 день", premium: false, status: "not_started", image: "/images/programs/deck.svg", stages: [{ id: "s1", day: 1, title: "Шут", description: "Изучите карту Шут.", completed: false }] },
  { id: "pr-5", slug: "21-symbols", name: "21 символ", description: "21 день наблюдения за символами в жизни.", duration: "21 день", premium: true, status: "not_started", image: "/images/programs/symbols.svg", stages: [{ id: "s1", day: 1, title: "Ключ", description: "Ищите символ ключа.", completed: false }] },
  { id: "pr-6", slug: "month-observation", name: "Месяц наблюдений", description: "30 дней ведения дневника знаков и символов.", duration: "30 дней", premium: true, status: "not_started", image: "/images/programs/month.svg", stages: [{ id: "s1", day: 1, title: "Начало", description: "Начните дневник наблюдений.", completed: false }] },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}
