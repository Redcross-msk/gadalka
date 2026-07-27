"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import type { Program } from "@/types";
import { AccessBadge } from "@/components/shared/AccessBadge";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link
      href={`/platform/programs/${program.slug}`}
      className="group block rounded-xl border border-border hover:border-gold/30 bg-card/50 p-4 sm:p-6 transition-colors"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-deep/30 text-lg sm:text-xl shrink-0">
          ✨
        </div>
        <AccessBadge
          requiresPremium={program.premium}
          freeLabel="Бесплатно"
          className="text-[10px] sm:text-xs"
        />
      </div>
      <h3 className="font-serif text-lg sm:text-xl group-hover:text-gold transition-colors leading-snug">
        {program.name}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
        {program.description}
      </p>
      <div className="flex items-center gap-1 mt-3 sm:mt-4 text-[11px] sm:text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        {program.duration}
      </div>
    </Link>
  );
}
