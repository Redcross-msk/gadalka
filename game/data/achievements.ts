import type { AchievementDef, DailyTaskDef } from "@/types/game";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_click", title: "Первый знак", description: "Сделайте первый клик по Книге знаков", category: "клики", target: 1, metric: "totalClicks", rewardXp: 5, rewardEnergy: 10 },
  { id: "clicks_100", title: "Сто касаний", description: "Сделайте 100 кликов", category: "клики", target: 100, metric: "totalClicks", rewardXp: 20, rewardEnergy: 50 },
  { id: "clicks_1000", title: "Тысяча кликов", description: "Сделайте 1 000 кликов", category: "клики", target: 1000, metric: "totalClicks", rewardXp: 80, rewardEnergy: 300 },
  { id: "energy_500", title: "Первый поток", description: "Заработайте 500 энергии всего", category: "энергия", target: 500, metric: "totalEnergyEarned", rewardXp: 25, rewardEnergy: 40 },
  { id: "energy_10k", title: "Поток архива", description: "Заработайте 10 000 энергии", category: "энергия", target: 10000, metric: "totalEnergyEarned", rewardXp: 100, rewardFragments: 2 },
  { id: "candle_1", title: "Свет зажжён", description: "Откройте свечу", category: "предметы", target: 1, metric: "unlocked_candle", rewardXp: 15, rewardEnergy: 20 },
  { id: "full_cabinet", title: "Полный кабинет", description: "Откройте все предметы первой комнаты", category: "предметы", target: 9, metric: "unlockedCount", rewardXp: 120, rewardFragments: 3 },
  { id: "req_1", title: "Первое обращение", description: "Завершите одно обращение", category: "обращения", target: 1, metric: "completedRequests", rewardXp: 20, rewardEnergy: 30 },
  { id: "req_5", title: "Пять историй", description: "Завершите 5 обращений", category: "обращения", target: 5, metric: "completedRequests", rewardXp: 60, rewardFragments: 1 },
  { id: "req_25", title: "Хранитель историй", description: "Завершите 25 обращений", category: "обращения", target: 25, metric: "completedRequests", rewardXp: 200, rewardFragments: 5 },
  { id: "card_1", title: "Первая карта", description: "Получите первую игровую карту", category: "карты", target: 1, metric: "cardsCount", rewardXp: 25, rewardEnergy: 40 },
  { id: "card_max", title: "Карта максимума", description: "Доведите карту до 5 уровня", category: "карты", target: 1, metric: "cardMaxLevel", rewardXp: 150, rewardFragments: 2 },
  { id: "cards_6", title: "Половина колоды", description: "Соберите 6 разных карт", category: "коллекция", target: 6, metric: "cardsCount", rewardXp: 80, rewardFragments: 2 },
  { id: "symbol_1", title: "Первый знак", description: "Получите процедурный знак", category: "знаки", target: 1, metric: "symbolsCount", rewardXp: 25, rewardEnergy: 35 },
  { id: "symbols_5", title: "Собрание знаков", description: "Соберите 5 знаков", category: "знаки", target: 5, metric: "symbolsCount", rewardXp: 70, rewardFragments: 1 },
  { id: "combo_25", title: "Комбо 25", description: "Достигните комбо 25", category: "клики", target: 25, metric: "maxClickCombo", rewardXp: 40, rewardEnergy: 60 },
  { id: "combo_50", title: "Комбо 50", description: "Достигните комбо 50", category: "клики", target: 50, metric: "maxClickCombo", rewardXp: 90, rewardEnergy: 150 },
  { id: "streak_3", title: "Три дня подряд", description: "Войдите три дня подряд", category: "серии", target: 3, metric: "loginStreak", rewardXp: 50, rewardFragments: 1 },
  { id: "prestige_1", title: "Первая Печать", description: "Откройте новую главу архива", category: "главы", target: 1, metric: "prestigeLevel", rewardXp: 200, rewardFragments: 5 },
  { id: "level_5", title: "Исследователь", description: "Достигните 5 уровня", category: "прогресс", target: 5, metric: "level", rewardXp: 40, rewardEnergy: 100 },
  { id: "upgrades_20", title: "Мастер улучшений", description: "Купите 20 улучшений", category: "предметы", target: 20, metric: "totalUpgrades", rewardXp: 60, rewardEnergy: 80 },
];

export const DAILY_TASK_POOL: DailyTaskDef[] = [
  { id: "d_clicks_50", title: "50 кликов", description: "Нажмите на Книгу знаков 50 раз", metric: "sessionClicks", target: 50, rewardEnergy: 80, rewardXp: 15 },
  { id: "d_energy_500", title: "500 энергии", description: "Заработайте 500 энергии сегодня", metric: "dayEnergy", target: 500, rewardEnergy: 100, rewardXp: 20 },
  { id: "d_upgrade_3", title: "Три улучшения", description: "Улучшите любой предмет 3 раза", metric: "dayUpgrades", target: 3, rewardEnergy: 90, rewardXp: 18 },
  { id: "d_request_1", title: "Одно обращение", description: "Завершите одно обращение", metric: "dayRequests", target: 1, rewardEnergy: 120, rewardXp: 25 },
  { id: "d_card_1", title: "Получить карту", description: "Получите одну карту", metric: "dayCards", target: 1, rewardEnergy: 150, rewardXp: 30 },
  { id: "d_symbol_1", title: "Найти знак", description: "Найдите один знак", metric: "daySymbols", target: 1, rewardEnergy: 150, rewardXp: 30 },
  { id: "d_combo_25", title: "Комбо 25", description: "Достигните комбо 25", metric: "dayCombo", target: 25, rewardEnergy: 110, rewardXp: 22 },
  { id: "d_offline", title: "Offline-доход", description: "Заберите offline-доход", metric: "dayOffline", target: 1, rewardEnergy: 70, rewardXp: 12 },
  { id: "d_event", title: "Случайное событие", description: "Откройте случайное событие", metric: "dayEvents", target: 1, rewardEnergy: 100, rewardXp: 20 },
  { id: "d_card_level", title: "Уровень карты", description: "Повысьте уровень любой карты", metric: "dayCardLevels", target: 1, rewardEnergy: 160, rewardXp: 35 },
];
