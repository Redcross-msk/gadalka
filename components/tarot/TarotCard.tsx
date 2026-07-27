"use client";

import Link from "next/link";
import { Heart, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TarotCard } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { AccessBadge } from "@/components/shared/AccessBadge";

interface TarotCardProps {
  card: TarotCard;
  variant?: "grid" | "list";
  showFavorite?: boolean;
}

export function TarotCardComponent({ card, variant = "grid", showFavorite = true }: TarotCardProps) {
  const favoriteCards = useAppStore((s) => s.favoriteCards);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isPremium = useAppStore((s) => s.isPremium);
  const isFavorite = favoriteCards.includes(card.slug);
  const locked = card.premium && !isPremium;

  const cardImage = (
    <div className="relative aspect-[2/3] rounded-lg bg-gradient-to-br from-burgundy/30 to-purple-deep/30 border border-border flex items-center justify-center overflow-hidden">
      <div className="text-center p-4">
        <span className="text-4xl font-serif text-gold/60">{card.number}</span>
        <p className="text-xs text-muted-foreground mt-2 font-serif">{card.name}</p>
      </div>
      {locked && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-gold" />
        </div>
      )}
    </div>
  );

  if (variant === "list") {
    return (
      <Link
        href={`/platform/tarot/${card.slug}`}
        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-gold/30 bg-card/50 transition-all group"
      >
        <div className="w-16 shrink-0">{cardImage}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">#{card.number}</span>
            <AccessBadge requiresPremium={card.premium} freeLabel="Доступно" showLock={false} />
          </div>
          <h3 className="font-serif text-lg group-hover:text-gold transition-colors">{card.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{card.shortMeaning}</p>
        </div>
        {showFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(card.slug);
            }}
            className="p-2 rounded-lg hover:bg-secondary shrink-0"
            aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          >
            <Heart className={cn("h-5 w-5", isFavorite ? "fill-gold text-gold" : "text-muted-foreground")} />
          </button>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/platform/tarot/${card.slug}`}
      className="group block rounded-xl border border-border hover:border-gold/30 bg-card/50 transition-all hover:glow-gold overflow-hidden"
    >
      {cardImage}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">#{card.number}</span>
          <AccessBadge requiresPremium={card.premium} freeLabel="Доступно" showLock={false} />
        </div>
        <h3 className="font-serif text-base group-hover:text-gold transition-colors">{card.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.shortMeaning}</p>
        {showFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(card.slug);
            }}
            className="mt-3 p-1.5 rounded-lg hover:bg-secondary inline-flex"
            aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-gold text-gold" : "text-muted-foreground")} />
          </button>
        )}
      </div>
    </Link>
  );
}
