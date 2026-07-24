"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gift, QrCode } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartButton } from "@/components/shop/CartButton";
import { Button } from "@/components/ui/button";
import { productCategories } from "@/data/products";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types";

export function ShopCatalog({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<ProductCategory | "all">("all");

  const filtered = useMemo(
    () =>
      category === "all" ? products : products.filter((p) => p.category === category),
    [category, products]
  );

  return (
    <>
      <section className="section-mobile mb-7 sm:mb-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs tracking-[0.22em] uppercase text-gold/60">Магазин</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-1.5 sm:mt-2 text-cream leading-tight">
              Коллекции и артефакты
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
              Колоды, свечи, аксессуары и цифровые товары по мотивам сериала «Гадалка»
            </p>
          </div>
          <CartButton className="mt-0.5 sm:mt-2 shrink-0" />
        </div>
        <div className="decorative-line mt-5 sm:mt-8 opacity-60" />
      </section>

      <div className="mb-6 sm:mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          <CategoryChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="Все"
          />
          {productCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              active={category === cat.id}
              onClick={() => setCategory(cat.id as ProductCategory)}
              label={cat.name}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 sm:p-12 text-center">
          <p className="text-sm text-muted-foreground">Товары в этой категории скоро появятся</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <section className="section-mobile mt-8 sm:mt-12 glass-card rounded-2xl border border-gold/15 p-4 sm:p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 mx-auto md:mx-0">
            <QrCode className="h-6 w-6 sm:h-7 sm:w-7 text-gold" />
          </div>
          <div className="flex-1 text-center md:text-left min-w-0">
            <h3 className="font-serif text-lg sm:text-xl">QR-коды на товарах</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">
              Многие товары содержат QR-код для активации цифровых бонусов —
              колод, программ или пробного периода подписки.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0 w-full md:w-auto">
            <Link href="/activate">
              <Gift className="h-4 w-4 mr-2" />
              Активировать код
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors min-h-[40px] sm:min-h-[44px] touch-manipulation",
        active
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-border/60 text-muted-foreground hover:border-gold/25 hover:text-cream"
      )}
    >
      {label}
    </button>
  );
}
