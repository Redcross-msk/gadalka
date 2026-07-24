"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { SymbolItem } from "@/types";

interface SymbolCardProps {
  symbol: SymbolItem;
}

export function SymbolCard({ symbol }: SymbolCardProps) {
  return (
    <Link
      href={`/platform/symbols/${symbol.slug}`}
      className="group block rounded-xl border border-border hover:border-gold/30 bg-card/50 p-3.5 sm:p-5 transition-colors"
    >
      <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-purple-deep/30 border border-gold/10 mb-3 sm:mb-4 text-xl sm:text-2xl">
        {symbol.name.charAt(0)}
      </div>
      <h3 className="font-serif text-base sm:text-lg group-hover:text-gold transition-colors leading-snug">
        {symbol.name}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{symbol.shortMeaning}</p>
      {symbol.popular && (
        <Badge variant="default" className="mt-2.5 sm:mt-3 text-[10px]">
          Популярный
        </Badge>
      )}
    </Link>
  );
}
