"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpreadActionButton } from "@/components/platform/SpreadActionButton";
import { useFreeSpreadCooldown } from "@/hooks/useFreeSpreadCooldown";
import { getSpreadBySlug } from "@/data/spreads";
import { cn } from "@/lib/utils";

const FREE_CAROUSEL_SLUGS = ["three-cards", "two-choices", "one-card"] as const;

function CardPreview({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-[56px] w-[38px] sm:h-[72px] sm:w-[48px] items-center justify-center rounded-lg border-2 border-gold/35 bg-gradient-to-br from-burgundy/50 to-[#342c34] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
          style={{
            transform: `rotate(${(i - (count - 1) / 2) * 8}deg) translateY(${Math.abs(i - (count - 1) / 2) * -4}px)`,
          }}
        >
          <span className="text-sm text-gold/45">✦</span>
        </div>
      ))}
    </div>
  );
}

export function FreeSpreadsCarousel() {
  const [index, setIndex] = useState(0);
  const { isPremium, available } = useFreeSpreadCooldown();

  const spread = getSpreadBySlug(FREE_CAROUSEL_SLUGS[index]);
  if (!spread) return null;

  const prev = () => setIndex((i) => (i - 1 + FREE_CAROUSEL_SLUGS.length) % FREE_CAROUSEL_SLUGS.length);
  const next = () => setIndex((i) => (i + 1) % FREE_CAROUSEL_SLUGS.length);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="free">Бесплатно</Badge>
          <span className="text-[11px] sm:text-xs text-muted-foreground truncate">{spread.duration}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8" onClick={prev} aria-label="Предыдущий расклад">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8" onClick={next} aria-label="Следующий расклад">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h3 className="font-serif text-lg sm:text-xl text-gold-light leading-snug">{spread.name}</h3>
      <p className="text-xs sm:text-sm text-cream-muted mt-1 line-clamp-2 sm:line-clamp-none">{spread.description}</p>

      <CardPreview count={spread.cardCount} />

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
        {spread.positions.map((pos) => (
          <div
            key={pos.id}
            className="rounded-lg border border-gold/10 bg-white/[0.03] px-1.5 sm:px-3 py-2 text-center"
          >
            <p className="text-[10px] sm:text-xs text-gold/80 leading-tight line-clamp-2">{pos.name}</p>
          </div>
        ))}
      </div>

      <SpreadActionButton href={`/platform/spreads/${spread.slug}`} fullWidth />

      <div className="mt-4 flex justify-center gap-2">
        {FREE_CAROUSEL_SLUGS.map((slug, i) => (
          <button
            key={slug}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-gold" : "w-2 bg-gold/25 hover:bg-gold/40"
            )}
            aria-label={`Расклад ${i + 1}`}
          />
        ))}
      </div>

      {!isPremium && (
        <p className="text-[11px] text-center text-muted-foreground mt-3">
          {available
            ? "Бесплатный тариф: 1 расклад в сутки"
            : "Следующий бесплатный расклад — после окончания таймера"}
        </p>
      )}
    </div>
  );
}
