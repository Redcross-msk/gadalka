"use client";

import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Dream } from "@/types";
import { dreamMoods } from "@/data/dreams";

interface DreamCardProps {
  dream: Dream;
  className?: string;
  compact?: boolean;
}

export function DreamCard({ dream, className, compact }: DreamCardProps) {
  const mood = dreamMoods.find((m) => m.id === dream.mood);

  return (
    <Link
      href={`/platform/dreams/${dream.id}`}
      className={cn(
        "group block rounded-xl border border-border hover:border-gold/30 bg-card/50 transition-colors",
        compact ? "p-4" : "p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <span className="text-[11px] sm:text-xs text-muted-foreground">{formatDate(dream.date)}</span>
        {mood && (
          <span className="text-xs sm:text-sm shrink-0">
            {mood.emoji}
            <span className="hidden sm:inline"> {mood.name}</span>
          </span>
        )}
      </div>
      <h3 className="font-serif text-base sm:text-lg group-hover:text-gold transition-colors leading-snug">
        {dream.title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
        {dream.description}
      </p>
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {dream.recurring && <Badge variant="premium">Повторяющийся</Badge>}
          {dream.symbols.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
