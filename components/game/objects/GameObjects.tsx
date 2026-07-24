"use client";

import { cn } from "@/lib/utils";

interface ObjProps {
  level?: number;
  locked?: boolean;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

function frame(level: number) {
  if (level >= 20) return 2.2;
  if (level >= 10) return 1.6;
  if (level >= 5) return 1.2;
  return 0.9;
}

export function GameBook({ level = 1, locked, className, onClick, active }: ObjProps) {
  const glow = locked ? 0 : 0.25 + Math.min(level, 20) * 0.02;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={cn(
        "select-none touch-manipulation transition-[filter] duration-150",
        active && "brightness-110",
        className
      )}
      aria-label="Книга знаков"
    >
      <svg
        viewBox="0 0 120 140"
        className={cn(
          "w-full h-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)] transition-transform duration-150 ease-out",
          active && "scale-[0.97]"
        )}
      >
        <defs>
          <linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5a3844" />
            <stop offset="55%" stopColor="#3a242c" />
            <stop offset="100%" stopColor="#24161c" />
          </linearGradient>
          <linearGradient id="bookShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(242,223,168,0.22)" />
            <stop offset="40%" stopColor="rgba(242,223,168,0)" />
          </linearGradient>
          <filter id="bookGlow">
            <feGaussianBlur stdDeviation={glow * 4} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="18"
          y="16"
          width="84"
          height="108"
          rx="4"
          fill="url(#bookCover)"
          stroke="#d8bc78"
          strokeWidth={frame(level)}
          opacity={locked ? 0.35 : 1}
          filter={locked ? undefined : "url(#bookGlow)"}
        />
        <rect x="18" y="16" width="84" height="108" rx="4" fill="url(#bookShine)" opacity={locked ? 0 : 1} />
        <rect x="28" y="26" width="64" height="88" rx="2" fill="none" stroke="#d8bc78" strokeWidth="0.7" opacity="0.45" />
        <circle cx="60" cy="70" r="16" fill="none" stroke="#d8bc78" strokeWidth="1.2" opacity={locked ? 0.2 : 0.8} />
        <line x1="60" y1="54" x2="60" y2="86" stroke="#d8bc78" strokeWidth="0.8" opacity="0.7" />
        <line x1="46" y1="70" x2="74" y2="70" stroke="#d8bc78" strokeWidth="0.8" opacity="0.7" />
        {level >= 5 && <circle cx="60" cy="70" r="8" fill="none" stroke="#d8bc78" strokeWidth="0.6" opacity="0.5" />}
        {level >= 10 && (
          <path d="M36 34 L42 34 M78 34 L84 34 M36 106 L42 106 M78 106 L84 106" stroke="#d8bc78" strokeWidth="1" />
        )}
        {level >= 20 && <circle cx="60" cy="70" r="22" fill="none" stroke="#d8bc78" strokeWidth="0.5" opacity="0.35" />}
        <text x="60" y="118" textAnchor="middle" fill="#d8bc78" fontSize="7" opacity="0.7" fontFamily="serif">
          Книга знаков
        </text>
      </svg>
    </button>
  );
}

export function GameCandle({ level = 1, locked, className, onClick }: ObjProps) {
  return (
    <button type="button" onClick={onClick} className={cn("select-none", className)} aria-label="Свеча" disabled={!onClick}>
      <svg viewBox="0 0 60 90" className="w-full h-full">
        <rect x="22" y="38" width="16" height="40" rx="2" fill={locked ? "#3a343c" : "#6b3d4c"} stroke="#d8bc78" strokeWidth="0.8" opacity={locked ? 0.4 : 1} />
        {!locked && (
          <>
            <line x1="30" y1="38" x2="30" y2="28" stroke="#d8bc78" strokeWidth="1.2" />
            <ellipse cx="30" cy="24" rx={4 + Math.min(level, 10) * 0.2} ry={6 + Math.min(level, 10) * 0.3} fill="#d8bc78" opacity="0.55" />
          </>
        )}
        {level >= 5 && !locked && <rect x="20" y="74" width="20" height="4" rx="1" fill="#d8bc78" opacity="0.3" />}
      </svg>
    </button>
  );
}

export function GameDeck({ level = 1, locked, className }: ObjProps) {
  return (
    <svg viewBox="0 0 70 90" className={cn("w-full h-full", className)} aria-label="Колода">
      <rect x="14" y="18" width="40" height="58" rx="3" fill="#3a3238" stroke="#d8bc78" strokeWidth="0.9" opacity={locked ? 0.3 : 0.95} />
      <rect x="10" y="22" width="40" height="58" rx="3" fill="#4a3c44" stroke="#d8bc78" strokeWidth="0.9" opacity={locked ? 0.25 : 0.9} />
      {!locked && <circle cx="30" cy="51" r="8" fill="none" stroke="#d8bc78" strokeWidth="0.8" />}
      {level >= 5 && !locked && <rect x="8" y="26" width="40" height="58" rx="3" fill="none" stroke="#d8bc78" strokeWidth="0.5" opacity="0.4" />}
    </svg>
  );
}

export function GameMirror({ level = 1, locked, className, onClick }: ObjProps) {
  return (
    <button type="button" onClick={onClick} className={cn(className)} aria-label="Зеркало">
      <svg viewBox="0 0 70 90" className="w-full h-full">
        <ellipse cx="35" cy="42" rx="22" ry="28" fill="#2a3038" stroke="#d8bc78" strokeWidth="1.2" opacity={locked ? 0.3 : 0.9} />
        <ellipse cx="35" cy="42" rx="16" ry="20" fill="url(#mirr)" opacity={locked ? 0.15 : 0.35} />
        <defs>
          <linearGradient id="mirr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a8b8c8" />
            <stop offset="100%" stopColor="#4a4058" />
          </linearGradient>
        </defs>
        {level >= 5 && !locked && <ellipse cx="35" cy="42" rx="10" ry="12" fill="none" stroke="#d8bc78" strokeWidth="0.5" opacity="0.4" />}
      </svg>
    </button>
  );
}

export function GameClock({ level = 1, locked, className, onClick }: ObjProps) {
  return (
    <button type="button" onClick={onClick} className={cn(className)} aria-label="Часы">
      <svg viewBox="0 0 70 70" className="w-full h-full">
        <circle cx="35" cy="35" r="24" fill="#3a3238" stroke="#d8bc78" strokeWidth="1.2" opacity={locked ? 0.3 : 1} />
        <circle cx="35" cy="35" r="2" fill="#d8bc78" opacity={locked ? 0.2 : 0.8} />
        {!locked && (
          <>
            <line x1="35" y1="35" x2="35" y2="20" stroke="#d8bc78" strokeWidth="1.5" />
            <line x1="35" y1="35" x2="48" y2="35" stroke="#d8bc78" strokeWidth="1.2" />
          </>
        )}
        {level >= 10 && !locked && <circle cx="35" cy="35" r="18" fill="none" stroke="#d8bc78" strokeWidth="0.4" opacity="0.4" strokeDasharray="2 3" />}
      </svg>
    </button>
  );
}

export function DreamBook({ level = 1, locked, className }: ObjProps) {
  return (
    <svg viewBox="0 0 70 80" className={cn("w-full h-full", className)} aria-label="Книга снов">
      <path d="M12 20 Q35 12 58 20 L58 62 Q35 72 12 62 Z" fill="#3a3040" stroke="#d8bc78" strokeWidth="0.9" opacity={locked ? 0.3 : 0.95} />
      {!locked && <path d="M35 18 L35 66" stroke="#d8bc78" strokeWidth="0.6" opacity="0.5" />}
      {level >= 5 && !locked && <circle cx="35" cy="40" r="8" fill="none" stroke="#d8bc78" strokeWidth="0.6" opacity="0.5" />}
    </svg>
  );
}

export function ArchiveCabinet({ level = 1, locked, className }: ObjProps) {
  return (
    <svg viewBox="0 0 80 90" className={cn("w-full h-full", className)} aria-label="Архивный шкаф">
      <rect x="14" y="12" width="52" height="66" rx="2" fill="#3a3230" stroke="#d8bc78" strokeWidth="1" opacity={locked ? 0.3 : 0.95} />
      <line x1="14" y1="34" x2="66" y2="34" stroke="#d8bc78" strokeWidth="0.6" opacity="0.5" />
      <line x1="14" y1="56" x2="66" y2="56" stroke="#d8bc78" strokeWidth="0.6" opacity="0.5" />
      {!locked && <circle cx="55" cy="24" r="2" fill="#d8bc78" opacity="0.6" />}
      {level >= 5 && !locked && <rect x="20" y="18" width="20" height="10" fill="none" stroke="#d8bc78" strokeWidth="0.5" opacity="0.4" />}
    </svg>
  );
}

export function VisitorDoor({ level = 1, locked, className }: ObjProps) {
  return (
    <svg viewBox="0 0 60 90" className={cn("w-full h-full", className)} aria-label="Дверь">
      <rect x="12" y="10" width="36" height="70" rx="1" fill="#3a2e30" stroke="#d8bc78" strokeWidth="1" opacity={locked ? 0.3 : 0.95} />
      {!locked && <circle cx="40" cy="48" r="2.5" fill="#d8bc78" opacity="0.7" />}
      {level >= 5 && !locked && <rect x="18" y="18" width="24" height="20" fill="none" stroke="#d8bc78" strokeWidth="0.5" opacity="0.35" />}
    </svg>
  );
}

export function GameWindow({ level = 1, locked, className, onClick }: ObjProps) {
  return (
    <button type="button" onClick={onClick} className={cn(className)} aria-label="Окно">
      <svg viewBox="0 0 70 70" className="w-full h-full">
        <rect x="10" y="12" width="50" height="46" rx="2" fill="#2a3038" stroke="#d8bc78" strokeWidth="1" opacity={locked ? 0.3 : 0.9} />
        <line x1="35" y1="12" x2="35" y2="58" stroke="#d8bc78" strokeWidth="0.7" opacity="0.5" />
        <line x1="10" y1="35" x2="60" y2="35" stroke="#d8bc78" strokeWidth="0.7" opacity="0.5" />
        {!locked && <rect x="14" y="16" width="16" height="14" fill="#d8bc78" opacity={0.08 + Math.min(level, 10) * 0.01} />}
      </svg>
    </button>
  );
}
