"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/layout/PageHeader";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { useAppStore } from "@/store/useAppStore";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";

const categoryLabels: Record<string, string> = {
  cards: "Карты",
  candles: "Свечи",
  accessories: "Аксессуары",
  gift_sets: "Подарочные наборы",
  board_games: "Настольные игры",
  digital: "Цифровые товары",
};

const statusLabels: Record<string, string> = {
  in_stock: "В наличии",
  preorder: "Предзаказ",
  digital: "Цифровой товар",
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);

  const addToCart = useAppStore((s) => s.addToCart);
  const addToast = useAppStore((s) => s.addToast);
  const cart = useAppStore((s) => s.cart);

  const gallery =
    product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [product.image]
        : [];
  const inCart = cart.some((i) => i.productSlug === product.slug);
  const cartQty = cart.find((i) => i.productSlug === product.slug)?.quantity ?? 0;
  const currentSrc = gallery[activeImage];

  const handleAddToCart = () => {
    addToCart(product.slug);
    addToast({
      title: "Добавлено в корзину",
      description: product.name,
      variant: "success",
    });
  };

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Каталог
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <div>
          <div className="glass-card aspect-square rounded-2xl flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-burgundy/10 to-purple-deep/10">
            {currentSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentSrc}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <ProductVisual category={product.category} size="lg" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-16 w-16 shrink-0 rounded-lg border overflow-hidden relative transition-all",
                    activeImage === i ? "border-gold/50" : "border-border/50"
                  )}
                  aria-label={`Изображение ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary">{categoryLabels[product.category] ?? product.category}</Badge>
            <Badge variant={product.status === "in_stock" ? "default" : "secondary"}>
              {statusLabels[product.status]}
            </Badge>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-medium leading-tight">{product.name}</h1>

          {avgRating && (
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(avgRating) ? "text-gold fill-gold" : "text-muted-foreground"
                  )}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {avgRating.toFixed(1)} ({product.reviews!.length})
              </span>
            </div>
          )}

          <p className="text-2xl md:text-3xl font-serif text-gold mt-4">{formatPrice(product.price)}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed text-sm md:text-base">{product.description}</p>

          {product.digitalBonus && (
            <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
              <p className="text-sm text-gold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                Цифровой бонус: {product.digitalBonus}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6 sticky bottom-4 sm:static z-10">
            <Button size="lg" onClick={handleAddToCart} className="flex-1 min-h-[48px]">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {inCart ? `В корзине (${cartQty})` : "В корзину"}
            </Button>
            {product.platformConnection && (
              <Button variant="outline" size="lg" className="min-h-[48px]" asChild>
                <Link href="/activate">Активировать QR</Link>
              </Button>
            )}
          </div>

          {product.composition && (
            <div className="mt-8">
              <h3 className="font-serif text-lg mb-2">Состав</h3>
              <p className="text-sm text-muted-foreground">{product.composition}</p>
            </div>
          )}

          {product.characteristics && (
            <div className="mt-6">
              <h3 className="font-serif text-lg mb-2">Характеристики</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {Object.entries(product.characteristics).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-border/40 py-2 gap-4">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="text-right">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.platformConnection && (
            <div className="mt-6 glass-card rounded-xl p-4">
              <h3 className="font-serif text-sm mb-1">Связь с платформой</h3>
              <p className="text-sm text-muted-foreground">{product.platformConnection}</p>
            </div>
          )}
        </div>
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Отзывы" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">{review.author}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < review.rating ? "text-gold fill-gold" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                <p className="text-xs text-muted-foreground/70 mt-3">{review.date}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
