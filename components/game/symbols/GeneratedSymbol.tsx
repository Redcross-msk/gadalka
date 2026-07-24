"use client";

import { getSymbolGeometry } from "@/game/generators/symbols";
import { cn } from "@/lib/utils";

export function GeneratedSymbol({
  seed,
  size = 64,
  className,
  animate = false,
}: {
  seed: string;
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  const g = getSymbolGeometry(seed);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn(className)} role="img" aria-label="Знак">
      {g.outer === "circle" ? (
        <circle cx="50" cy="50" r="36" fill="none" stroke="#d8bc78" strokeWidth="1.2" className={animate ? "animate-[dash_1.2s_ease_forwards]" : undefined} />
      ) : (
        <path d="M50 14 L86 50 L50 86 L14 50 Z" fill="none" stroke="#d8bc78" strokeWidth="1.2" />
      )}
      {Array.from({ length: g.rings }).map((_, i) => (
        <circle key={i} cx="50" cy="50" r={12 + i * 8} fill="none" stroke="#d8bc78" strokeWidth="0.6" opacity={0.45} />
      ))}
      {g.hasV && <line x1="50" y1="18" x2="50" y2="82" stroke="#d8bc78" strokeWidth="0.7" opacity="0.55" />}
      {g.hasH && <line x1="18" y1="50" x2="82" y2="50" stroke="#d8bc78" strokeWidth="0.7" opacity="0.55" />}
      {g.strokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#d8bc78" strokeWidth="0.7" opacity="0.6" />
      ))}
      {g.dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#d8bc78" opacity="0.75" />
      ))}
    </svg>
  );
}
