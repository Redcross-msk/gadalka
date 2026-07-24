"use client";

import { useState } from "react";
import type { ConstellationInfo } from "@/data/natal";
import { cn } from "@/lib/utils";

interface ConstellationMapProps {
  constellation: ConstellationInfo;
  className?: string;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConstellationMap({
  constellation,
  className,
  interactive = true,
  size = "md",
}: ConstellationMapProps) {
  const [activeStar, setActiveStar] = useState<string | null>(null);
  const starMap = Object.fromEntries(constellation.stars.map((s) => [s.id, s]));
  const active = constellation.stars.find((s) => s.id === activeStar);

  const heights = { sm: "h-40", md: "h-52", lg: "h-64" };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-gold/15 bg-gradient-to-b from-[#3a3440]/60 to-[#2a2428]/80",
          heights[size]
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 30%, rgba(242,223,168,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 70% 20%, rgba(242,223,168,0.35) 0%, transparent 100%), radial-gradient(1px 1px at 50% 80%, rgba(242,223,168,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 85% 65%, rgba(242,223,168,0.25) 0%, transparent 100%)",
          }}
        />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {constellation.lines.map(([from, to]) => {
            const a = starMap[from];
            const b = starMap[to];
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(216,188,120,0.35)"
                strokeWidth="0.6"
              />
            );
          })}
          {constellation.stars.map((star) => (
            <g key={star.id}>
              {interactive && activeStar === star.id && (
                <circle cx={star.x} cy={star.y} r={star.size * 2.2} fill="rgba(216,188,120,0.15)" />
              )}
              <circle
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill={activeStar === star.id ? "#f2dfa8" : "rgba(242,223,168,0.85)"}
                className={interactive ? "cursor-pointer" : ""}
                onMouseEnter={() => interactive && setActiveStar(star.id)}
                onMouseLeave={() => interactive && setActiveStar(null)}
                onClick={() => interactive && setActiveStar(star.id)}
              />
            </g>
          ))}
        </svg>
        <div className="absolute left-3 top-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold/60">Созвездие</p>
          <p className="font-serif text-lg text-gold-light">
            {constellation.symbol} {constellation.constellationName}
          </p>
        </div>
      </div>
      {interactive && active?.label && (
        <p className="mt-2 text-center text-xs text-gold/70 animate-in fade-in">
          ✦ {active.label}
        </p>
      )}
    </div>
  );
}
