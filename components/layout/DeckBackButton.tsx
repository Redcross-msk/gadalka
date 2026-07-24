"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

/** Возврат на главную с тремя картами выбора раздела */
export function DeckBackButton({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-gold/25 bg-black/20 px-3 py-2 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-gold/80 hover:border-gold/45 hover:text-gold transition-colors touch-manipulation min-h-[40px]",
        className
      )}
      aria-label="К колоде — выбор раздела"
    >
      <Layers className="h-3.5 w-3.5 shrink-0" />
      {!compact && <span>К колоде</span>}
      {compact && <span className="sm:hidden">Колода</span>}
      {compact && <span className="hidden sm:inline">К колоде</span>}
    </Link>
  );
}
