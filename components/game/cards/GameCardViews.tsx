"use client";

import { getCardDef } from "@/game/data/cards";
import { GeneratedSymbol } from "@/components/game/symbols/GeneratedSymbol";
import { cn } from "@/lib/utils";

export function GameCardFace({
  cardId,
  className,
  compact,
}: {
  cardId: string;
  className?: string;
  compact?: boolean;
}) {
  const card = getCardDef(cardId);
  if (!card) return null;
  return (
    <div
      className={cn(
        "relative rounded-xl border border-gold/30 bg-gradient-to-b from-[#4a3c44] via-[#3a3238] to-[#2a2428] flex flex-col items-center p-3 shadow-xl",
        compact ? "w-28 h-40" : "w-40 h-60",
        className
      )}
    >
      <div className="w-full flex justify-between text-[9px] text-gold/60 tracking-widest">
        <span>№{card.number}</span>
        <span>{card.rarity}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <GeneratedSymbol seed={`card-${card.id}`} size={compact ? 48 : 72} />
      </div>
      <p className="font-serif text-sm text-cream">{card.name}</p>
      {!compact && <p className="text-[10px] text-muted-foreground text-center mt-1 line-clamp-2">{card.description}</p>}
    </div>
  );
}

export function GameCardBack({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-gold/20 bg-[#302a30] w-40 h-60 flex items-center justify-center", className)}>
      <svg viewBox="0 0 80 120" className="w-3/4 opacity-40">
        <pattern id="cardBackPat" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 L5 0 L10 5 L5 10 Z" fill="none" stroke="#d8bc78" strokeWidth="0.4" />
        </pattern>
        <rect width="80" height="120" fill="url(#cardBackPat)" />
        <circle cx="40" cy="60" r="12" fill="none" stroke="#d8bc78" strokeWidth="1" />
      </svg>
    </div>
  );
}
