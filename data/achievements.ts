import type { Achievement } from "@/types";

export const achievements: Achievement[] = [
  { id: "ach-1", name: "Первый расклад", description: "Сделайте свой первый расклад", icon: "🎴", unlocked: false },
  { id: "ach-2", name: "Сонливый архивариус", description: "Запишите 5 снов", icon: "🌙", unlocked: false },
  { id: "ach-3", name: "Охотник за знаками", description: "Отметьте 10 символов", icon: "🔍", unlocked: false },
  { id: "ach-4", name: "Ученик", description: "Завершите первый урок", icon: "📖", unlocked: false },
  { id: "ach-5", name: "Коллекционер", description: "Соберите 10 карт в избранное", icon: "⭐", unlocked: false },
  { id: "ach-6", name: "Неделя ясности", description: "Завершите программу", icon: "✨", unlocked: false },
  { id: "ach-7", name: "Толкователь", description: "Проведите 10 диалогов с AI", icon: "💬", unlocked: false },
  { id: "ach-8", name: "Покупатель", description: "Сделайте первую покупку", icon: "🛍️", unlocked: false },
];

export const questionTopics = [
  { id: "relationships", label: "Отношения" },
  { id: "decision", label: "Решение" },
  { id: "work", label: "Работа" },
  { id: "family", label: "Семья" },
  { id: "inner", label: "Внутреннее состояние" },
];

export const dailyQuestions: Record<string, string> = {
  relationships: "Что ваши отношения говорят о ваших потребностях?",
  decision: "Какой выбор отражает ваши истинные ценности?",
  work: "Что приносит вам удовлетворение в работе?",
  family: "Какую роль вы играете в своей семье?",
  inner: "Что ваше внутреннее состояние просит сегодня?",
};
