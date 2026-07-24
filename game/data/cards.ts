import type { GameCardDef } from "@/types/game";

export const GAME_CARDS: GameCardDef[] = [
  { id: "key", number: 1, name: "Ключ", description: "Открывает новые возможности в обращениях.", rarity: "common", passiveBonus: "request_reward", bonusValue: 0.08, relatedCategories: ["decision", "found_item"] },
  { id: "door", number: 2, name: "Дверь", description: "Чаще появляются посетители.", rarity: "common", passiveBonus: "visitor_rate", bonusValue: 0.1, relatedCategories: ["decision"] },
  { id: "mirror", number: 3, name: "Зеркало", description: "Выше шанс получить знак.", rarity: "uncommon", passiveBonus: "symbol_chance", bonusValue: 0.12, relatedCategories: ["repeating_sign", "coincidence"] },
  { id: "thread", number: 4, name: "Нить", description: "Больше опыта за действия.", rarity: "common", passiveBonus: "xp_mult", bonusValue: 0.1, relatedCategories: ["family", "relationship"] },
  { id: "flame", number: 5, name: "Пламя", description: "Усиливает автоматический доход.", rarity: "uncommon", passiveBonus: "passive_mult", bonusValue: 0.1, relatedCategories: ["past_event"] },
  { id: "water", number: 6, name: "Вода", description: "Награды за сны становятся щедрее.", rarity: "common", passiveBonus: "dream_reward", bonusValue: 0.15, relatedCategories: ["dream"] },
  { id: "clock", number: 7, name: "Часы", description: "Сокращает длительность обращений.", rarity: "uncommon", passiveBonus: "timer_reduce", bonusValue: 0.08, relatedCategories: ["coincidence"] },
  { id: "bird", number: 8, name: "Птица", description: "Усиливает доход за клик.", rarity: "common", passiveBonus: "click_mult", bonusValue: 0.08, relatedCategories: ["repeating_sign"] },
  { id: "threshold", number: 9, name: "Порог", description: "Больше энергии за обращения.", rarity: "rare", passiveBonus: "request_reward", bonusValue: 0.15, relatedCategories: ["decision", "past_event"] },
  { id: "letter", number: 10, name: "Письмо", description: "Больше архивных фрагментов.", rarity: "uncommon", passiveBonus: "archive_fragments", bonusValue: 0.2, relatedCategories: ["family", "found_item"] },
  { id: "shadow", number: 11, name: "Тень", description: "Выше шанс редких событий.", rarity: "rare", passiveBonus: "card_chance", bonusValue: 0.1, relatedCategories: ["past_event", "coincidence"] },
  { id: "memory", number: 12, name: "Память", description: "Увеличивает архивные фрагменты и опыт.", rarity: "archival", passiveBonus: "archive_fragments", bonusValue: 0.25, relatedCategories: ["family", "dream"] },
];

export function getCardDef(id: string): GameCardDef | undefined {
  return GAME_CARDS.find((c) => c.id === id);
}
