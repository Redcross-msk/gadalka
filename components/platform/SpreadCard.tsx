"use client";

import Link from "next/link";
import { Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFreeSpreadCooldown } from "@/hooks/useFreeSpreadCooldown";
import { formatCooldown } from "@/data/daily";
import type { Spread } from "@/types";
import { cn } from "@/lib/utils";
import { AccessBadge } from "@/components/shared/AccessBadge";

interface SpreadCardProps {
  spread: Spread;
}

export function SpreadCard({ spread }: SpreadCardProps) {
  const { isPremium, available, remaining } = useFreeSpreadCooldown();
  const onCooldown = !spread.premium && !isPremium && !available;

  const inner = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-burgundy/20 border border-gold/10">
          <Layers className="h-6 w-6 text-gold" />
        </div>
        <AccessBadge requiresPremium={spread.premium} freeLabel="Бесплатно" />
      </div>
      <h3 className="font-serif text-xl group-hover:text-gold transition-colors">{spread.name}</h3>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{spread.description}</p>
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          {spread.cardCount} карт
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {spread.duration}
        </span>
      </div>
      {onCooldown ? (
        <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
          Через {formatCooldown(remaining)}
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="mt-4 pointer-events-none">
          Сделать расклад
        </Button>
      )}
    </>
  );

  if (onCooldown) {
    return (
      <div
        className={cn(
          "relative block rounded-xl border border-border bg-card/50 p-6",
          "opacity-90"
        )}
      >
        <div className="absolute inset-0 z-10 rounded-xl bg-background/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="text-center">
            <Clock className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-cream">Расклад на паузе</p>
            <p className="text-xs text-muted-foreground mt-1">
              Доступен через {formatCooldown(remaining)}
            </p>
          </div>
        </div>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/platform/spreads/${spread.slug}`}
      className="group block rounded-xl border border-border hover:border-gold/30 bg-card/50 p-6 transition-all hover:glow-gold"
    >
      {inner}
    </Link>
  );
}
