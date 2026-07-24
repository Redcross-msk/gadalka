import type { Product } from "@/types";

export const products: Product[] = [
  { id: "p-1", slug: "archive-deck", name: "Колода «Архив Гадалки»", description: "Официальная колода из 78 карт с иллюстрациями по мотивам сериала. Каждая карта — произведение искусства.", price: 4500, category: "cards", status: "in_stock", digitalBonus: "Цифровая версия колоды в приложении", image: "/images/products/deck-main.svg", gallery: ["/images/products/deck-main.svg"], composition: "78 карт, руководство, мешочек", characteristics: { "Размер": "70×120 мм", "Материал": "Картон premium", "Язык": "RU" }, platformConnection: "Активация открывает колоду в приложении", relatedCards: ["luna", "zerkalo"], reviews: [{ id: "r1", author: "Мария", rating: 5, text: "Потрясающая колода! Иллюстрации как из сериала.", date: "2026-06-15" }] },
  { id: "p-2", slug: "love-signs-mini", name: "Мини-колода «Знаки любви»", description: "Компактная колода из 22 карт для быстрых раскладов.", price: 1800, category: "cards", status: "in_stock", digitalBonus: "3 премиум-расклада", image: "/images/products/deck-mini.svg", gallery: ["/images/products/deck-mini.svg"], platformConnection: "Бонусные расклады в приложении" },
  { id: "p-3", slug: "candle-set", name: "Набор свечей «Архив»", description: "Три ароматические свечи: Луна, Зеркало, Ключ.", price: 2200, category: "candles", status: "in_stock", image: "/images/products/candles.svg", gallery: ["/images/products/candles.svg"], composition: "3 свечи по 150г" },
  { id: "p-4", slug: "spread-cloth", name: "Платок для расклада", description: "Бархатный платок с символами Архива.", price: 1500, category: "accessories", status: "in_stock", image: "/images/products/cloth.svg", gallery: ["/images/products/cloth.svg"], characteristics: { "Размер": "50×50 см", "Материал": "Бархат" } },
  { id: "p-5", slug: "dream-journal", name: "Блокнот снов", description: "Премиальный блокнот для записи и анализа снов.", price: 1200, category: "accessories", status: "in_stock", digitalBonus: "Шаблоны записей в приложении", image: "/images/products/journal.svg", gallery: ["/images/products/journal.svg"] },
  { id: "p-6", slug: "gift-set", name: "Подарочный набор", description: "Колода + свечи + блокнот в подарочной упаковке.", price: 6500, category: "gift_sets", status: "in_stock", digitalBonus: "1 месяц Гадалка+", image: "/images/products/gift.svg", gallery: ["/images/products/gift.svg"] },
  { id: "p-7", slug: "digital-deck", name: "Цифровая колода", description: "Полная цифровая колода для использования в приложении.", price: 990, category: "digital", status: "digital", digitalBonus: "Мгновенная активация", image: "/images/products/digital.svg", gallery: ["/images/products/digital.svg"] },
  { id: "p-8", slug: "seasonal-program", name: "Сезонная программа", description: "Эксклюзивная тематическая программа на сезон.", price: 790, category: "digital", status: "digital", digitalBonus: "Доступ к программе в приложении", image: "/images/products/program.svg", gallery: ["/images/products/program.svg"] },
];

export const productCategories = [
  { id: "cards", name: "Карты" },
  { id: "candles", name: "Свечи" },
  { id: "accessories", name: "Аксессуары" },
  { id: "gift_sets", name: "Подарочные наборы" },
  { id: "board_games", name: "Настольные игры" },
  { id: "digital", name: "Цифровые товары" },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getPopularProducts(): Product[] {
  return products.slice(0, 4);
}
