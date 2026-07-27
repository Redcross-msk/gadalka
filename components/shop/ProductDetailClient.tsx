"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/layout/PageHeader";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { useAppStore } from "@/store/useAppStore";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { addToCartAction } from "@/features/shop/actions";

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

function ProductGallery({
  gallery,
  productName,
  category,
}: {
  gallery: string[];
  productName: string;
  category: Product["category"];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const touchRef = useRef<{ x: number; y: number; dragging: boolean } | null>(null);
  const lockRef = useRef(false);
  const multi = gallery.length > 1;
  const currentSrc = gallery[activeImage];

  const goTo = useCallback(
    (next: number) => {
      if (!multi) return;
      const wrapped = ((next % gallery.length) + gallery.length) % gallery.length;
      setActiveImage(wrapped);
    },
    [gallery.length, multi]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    if (!multi) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, dragging: false };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!multi) return;
    const start = touchRef.current;
    if (!start) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (!start.dragging && Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      start.dragging = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!multi) return;
    const start = touchRef.current;
    touchRef.current = null;
    if (!start?.dragging || lockRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    if (Math.abs(dx) < 48) return;
    lockRef.current = true;
    goTo(activeImage + (dx < 0 ? 1 : -1));
    window.setTimeout(() => {
      lockRef.current = false;
    }, 280);
  };

  const mainImage = (
    <div
      className={cn(
        "glass-card aspect-square rounded-2xl flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-burgundy/10 to-purple-deep/10",
        multi && "touch-pan-y select-none"
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        touchRef.current = null;
      }}
    >
      {currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={productName}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <ProductVisual category={category} size="lg" />
      )}

      {multi && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 lg:hidden pointer-events-none">
          {gallery.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                activeImage === i ? "bg-gold" : "bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (!multi) {
    return <div>{mainImage}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_5.5rem]">
      {mainImage}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:max-h-[min(100%,32rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pr-0.5">
        {gallery.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setActiveImage(i)}
            className={cn(
              "relative shrink-0 overflow-hidden border transition-all",
              "h-16 w-16 rounded-lg lg:h-20 lg:w-full lg:rounded-xl",
              activeImage === i
                ? "border-gold/60 ring-1 ring-gold/30"
                : "border-border/50 opacity-80 hover:opacity-100"
            )}
            aria-label={`Изображение ${i + 1}`}
            aria-current={activeImage === i}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductDetailClient({ product }: { product: Product }) {
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

  const handleAddToCart = () => {
    addToCart(product.slug, product.id);
    addToast({
      title: "Добавлено в корзину",
      description: product.name,
      variant: "success",
    });
    void addToCartAction(product.id, 1).catch(() => undefined);
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
        <ProductGallery gallery={gallery} productName={product.name} category={product.category} />

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
