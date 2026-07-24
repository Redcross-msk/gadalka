"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { ProductVisual } from "./ProductVisual";

const categoryLabels: Record<string, string> = {
  cards: "Карты",
  candles: "Свечи",
  accessories: "Аксессуары",
  gift_sets: "Наборы",
  board_games: "Игры",
  digital: "Цифровое",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAppStore((s) => s.addToCart);
  const addToast = useAppStore((s) => s.addToast);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.slug);
    addToast({ title: "Добавлено в корзину", description: product.name, variant: "success" });
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col glass-card rounded-xl border border-gold/10 overflow-hidden hover:border-gold/25 transition-colors min-w-0"
    >
      <div className="aspect-[4/3] relative flex items-center justify-center bg-gradient-to-br from-burgundy/10 to-purple-deep/10 overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="p-3 sm:p-6">
            <ProductVisual category={product.category} size="md" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 sm:p-4 md:p-5">
        <Badge variant="secondary" className="w-fit mb-1.5 sm:mb-2 text-[9px] sm:text-[10px]">
          {categoryLabels[product.category] ?? product.category}
        </Badge>
        <h3 className="font-serif text-sm sm:text-base md:text-lg group-hover:text-gold transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-1 sm:mt-1.5 line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3 sm:mt-4 gap-1.5 sm:gap-2">
          <span className="font-serif text-base sm:text-lg text-gold tabular-nums leading-none">
            {formatPrice(product.price)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] shrink-0 px-2 touch-manipulation"
            onClick={handleAddToCart}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        {product.digitalBonus && (
          <p className="text-[9px] sm:text-[10px] text-gold/70 mt-1.5 sm:mt-2 line-clamp-1">
            + {product.digitalBonus}
          </p>
        )}
      </div>
    </Link>
  );
}
