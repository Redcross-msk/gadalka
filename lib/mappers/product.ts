import type { Product as DbProduct, MediaAsset, ProductImage, ProductReview as DbReview, ProductCategory as DbCategory, ProductStatus as DbStatus } from "@prisma/client";
import { resolveUploadedMediaSrc } from "@/lib/media-url";
import type { Product, ProductCategory, ProductReview } from "@/types";

const categoryMap: Record<DbCategory, ProductCategory> = {
  CARDS: "cards",
  CANDLES: "candles",
  ACCESSORIES: "accessories",
  GIFT_SETS: "gift_sets",
  BOARD_GAMES: "board_games",
  DIGITAL: "digital",
};

const statusMap: Record<DbStatus, Product["status"] | null> = {
  DRAFT: null,
  ARCHIVED: null,
  IN_STOCK: "in_stock",
  PREORDER: "preorder",
  DIGITAL: "digital",
};

export type DbProductFull = DbProduct & {
  coverMedia: MediaAsset | null;
  images?: (ProductImage & { media: MediaAsset })[];
  reviews?: DbReview[];
};

export function mapDbProductToApp(p: DbProductFull): Product | null {
  const status = statusMap[p.status];
  if (!status) return null;

  const cover =
    resolveUploadedMediaSrc(p.coverMedia?.url, p.coverMedia?.path) ?? "";
  const gallery = (p.images ?? [])
    .map((img) => resolveUploadedMediaSrc(img.media.url, img.media.path))
    .filter((u): u is string => Boolean(u));

  const characteristics =
    p.characteristics && typeof p.characteristics === "object" && !Array.isArray(p.characteristics)
      ? (p.characteristics as Record<string, string>)
      : undefined;

  const reviews: ProductReview[] | undefined = p.reviews?.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    text: r.text,
    date: r.createdAt.toISOString().slice(0, 10),
  }));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.priceCents / 100,
    category: categoryMap[p.category],
    status,
    digitalBonus: p.digitalBonus ?? undefined,
    image: cover,
    gallery: gallery.length > 0 ? gallery : cover ? [cover] : [],
    composition: p.composition ?? undefined,
    characteristics,
    platformConnection: p.platformConnection ?? undefined,
    relatedCards: p.relatedCards ?? undefined,
    reviews,
  };
}

export function mapDbProductsToApp(list: DbProductFull[]): Product[] {
  return list.map(mapDbProductToApp).filter((p): p is Product => p !== null);
}
