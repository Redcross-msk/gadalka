import type { Episode } from "@/types";

export const episodes: Episode[] = [
  { id: "ep-1", slug: "s01e01", title: "Первое видение", season: 1, episode: 1, description: "Гадалка получает свой первый дар и сталкивается с силой, которую не может контролировать.", themes: ["пробуждение", "страх", "наследие"], relatedCards: ["mag", "luna"] },
  { id: "ep-2", slug: "s01e03", title: "Зеркало истины", season: 1, episode: 3, description: "Старый артефакт — зеркало — показывает то, что скрыто.", themes: ["самопознание", "тайна", "прошлое"], relatedCards: ["zerkalo", "luna", "poveshennyj"] },
  { id: "ep-3", slug: "s01e05", title: "Ключ от всех дверей", season: 1, episode: 5, description: "Загадочный ключ открывает двери, которые лучше было оставить закрытыми.", themes: ["выбор", "последствия", "смелость"], relatedCards: ["klyuch", "dver", "bashnya"] },
  { id: "ep-4", slug: "s01e08", title: "Сны и видения", season: 1, episode: 8, description: "Граница между сном и реальностью стирается.", themes: ["сны", "подсознание", "предупреждение"], relatedCards: ["luna", "zvezda", "otshchelnik"] },
];

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}
