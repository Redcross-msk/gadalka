"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ConstellationInfo, ConstellationStar } from "@/data/natal";
import { cn } from "@/lib/utils";

interface ZodiacOrb3DProps {
  constellation: ConstellationInfo;
  className?: string;
}

function starAgeYears(star: ConstellationStar): number {
  if (typeof star.ageMillionYears === "number") return star.ageMillionYears;
  let h = 0;
  for (const c of star.id) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return 80 + (h % 920);
}

function starDisplayName(star: ConstellationStar, index: number): string {
  return star.name ?? star.label ?? `Звезда ${index + 1}`;
}

function starTitle(star: ConstellationStar): string | null {
  return star.title ?? null;
}

const PLANETS = [
  { r: 38, size: 3.2, color: "#c4a882", speed: 18, phase: 0 },
  { r: 52, size: 2.4, color: "#8eb4c8", speed: 28, phase: 1.2 },
  { r: 66, size: 4.1, color: "#d8bc78", speed: 40, phase: 2.4 },
  { r: 80, size: 2.8, color: "#b088a0", speed: 55, phase: 0.7 },
];

function ConstellationScene({
  constellation,
  interactive,
  onStarSelect,
  selectedId,
}: {
  constellation: ConstellationInfo;
  interactive: boolean;
  onStarSelect?: (star: ConstellationStar, index: number) => void;
  selectedId?: string | null;
}) {
  const starMap = useMemo(
    () => Object.fromEntries(constellation.stars.map((s) => [s.id, s])),
    [constellation.stars]
  );

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      {[38, 52, 66, 80].map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r * 0.42}
          fill="none"
          stroke="rgba(216,188,120,0.12)"
          strokeWidth="0.35"
          strokeDasharray="1.2 2.4"
        />
      ))}

      <circle cx="50" cy="50" r="4.2" fill="#f2dfa8" opacity="0.95">
        <animate attributeName="opacity" values="0.75;1;0.75" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="7" fill="rgba(242,223,168,0.18)" />
      <circle cx="50" cy="50" r="11" fill="rgba(216,188,120,0.08)" />

      {PLANETS.map((p, i) => (
        <g key={i}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`${(p.phase * 180) / Math.PI} 50 50`}
            to={`${(p.phase * 180) / Math.PI + 360} 50 50`}
            dur={`${p.speed}s`}
            repeatCount="indefinite"
          />
          <circle
            cx={50 + p.r * 0.42}
            cy="50"
            r={p.size * 0.55}
            fill={p.color}
            opacity="0.85"
            style={{ filter: `drop-shadow(0 0 3px ${p.color})` }}
          />
        </g>
      ))}

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
            stroke="rgba(216,188,120,0.55)"
            strokeWidth="0.7"
          />
        );
      })}

      {constellation.stars.map((star, i) => {
        const selected = selectedId === star.id;
        const r = star.size * (selected ? 1.35 : 1);
        return (
          <g key={star.id}>
            <circle
              cx={star.x}
              cy={star.y}
              r={r}
              fill="#f2dfa8"
              opacity={0.85}
              style={{ filter: "drop-shadow(0 0 5px rgba(242,223,168,0.95))" }}
              className={interactive ? "cursor-pointer" : undefined}
              onClick={
                interactive
                  ? (e) => {
                      e.stopPropagation();
                      onStarSelect?.(star, i);
                    }
                  : undefined
              }
            />
            {interactive && (
              <circle
                cx={star.x}
                cy={star.y}
                r={Math.max(5, r + 3)}
                fill="transparent"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onStarSelect?.(star, i);
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function FullscreenConstellation({
  constellation,
  onClose,
}: {
  constellation: ConstellationInfo;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<{
    star: ConstellationStar;
    index: number;
  } | null>(null);
  const [scale, setScale] = useState(1);
  const rotRef = useRef({ x: 18, y: 0 });
  const [rot, setRot] = useState({ x: 18, y: 0 });
  const autoSpin = useRef(true);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const tick = () => {
      if (autoSpin.current && pointers.current.size === 0) {
        rotRef.current = {
          ...rotRef.current,
          y: rotRef.current.y + 0.35,
        };
        setRot({ ...rotRef.current });
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    autoSpin.current = false;

    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStart.current = { dist, scale };
      dragStart.current = null;
    } else if (pointers.current.size === 1) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        rotX: rotRef.current.x,
        rotY: rotRef.current.y,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const next = Math.min(2.4, Math.max(0.7, (dist / pinchStart.current.dist) * pinchStart.current.scale));
      setScale(next);
      return;
    }

    if (pointers.current.size === 1 && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      rotRef.current = {
        x: Math.max(-35, Math.min(55, dragStart.current.rotX - dy * 0.25)),
        y: dragStart.current.rotY + dx * 0.35,
      };
      setRot({ ...rotRef.current });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      setTimeout(() => {
        if (pointers.current.size === 0) autoSpin.current = true;
      }, 1200);
    } else if (pointers.current.size === 1) {
      const pt = [...pointers.current.values()][0];
      dragStart.current = {
        x: pt.x,
        y: pt.y,
        rotX: rotRef.current.x,
        rotY: rotRef.current.y,
      };
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    autoSpin.current = false;
    setScale((prev) => Math.min(2.4, Math.max(0.7, prev - e.deltaY * 0.0015)));
    setTimeout(() => {
      if (pointers.current.size === 0) autoSpin.current = true;
    }, 1200);
  };

  const handleStar = useCallback((star: ConstellationStar, index: number) => {
    setSelected({ star, index });
  }, []);

  if (typeof document === "undefined") return null;

  const title = selected ? starTitle(selected.star) : null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col touch-none">
      <div
        className="absolute inset-0 bg-[#1a1618]/75 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold/55">Созвездие</p>
          <h3 className="font-serif text-xl text-gold-light truncate">
            {constellation.constellationName}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold touch-manipulation"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative z-10 flex-1 flex items-center justify-center px-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="relative aspect-square w-[min(92vw,720px)]"
          style={{ perspective: "900px" }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${scale})`,
              transformStyle: "preserve-3d",
              transition: pointers.current.size ? "none" : "transform 0.05s linear",
            }}
          >
            <div
              className="absolute inset-[8%] rounded-full border border-gold/15"
              style={{ transform: "rotateX(70deg) translateZ(-20px)" }}
              aria-hidden
            />
            <div className="absolute inset-[6%]">
              <ConstellationScene
                constellation={constellation}
                interactive
                onStarSelect={handleStar}
                selectedId={selected?.star.id}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 space-y-3">
        {selected ? (
          <div className="rounded-2xl border border-gold/25 bg-[#2e282c]/92 px-4 py-3 backdrop-blur-md">
            <p className="font-serif text-lg text-gold-light">
              {starDisplayName(selected.star, selected.index)}
            </p>
            {title && (
              <p className="mt-0.5 text-sm text-cream-muted">{title}</p>
            )}
            <p className="mt-1 text-sm text-mist/70">
              Возраст ≈ {starAgeYears(selected.star)} млн лет
            </p>
            <p className="mt-1 text-[11px] text-mist/50">
              {constellation.rulingPlanet} · {constellation.element}
            </p>
          </div>
        ) : (
          <p className="text-center text-[11px] text-mist/55 leading-relaxed">
            Мышь / палец — вращение · колесо / щипок — масштаб · нажмите на звезду
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ZodiacOrb3D({ constellation, className }: ZodiacOrb3DProps) {
  const [hovered, setHovered] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const starMap = Object.fromEntries(constellation.stars.map((s) => [s.id, s]));

  return (
    <>
      <button
        type="button"
        className={cn(
          "flex w-full flex-col items-center justify-center touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-2xl",
          className
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setFullscreen(true)}
        aria-label={`Открыть созвездие ${constellation.constellationName}`}
      >
        <div
          className="relative flex h-[140px] w-[140px] sm:h-[172px] sm:w-[172px] items-center justify-center pointer-events-none"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="relative h-[124px] w-[124px] sm:h-[152px] sm:w-[152px]"
            style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
            animate={{
              rotateY: [0, 360],
              rotateX: hovered ? 8 : 14,
              scale: hovered ? 1.1 : 1,
            }}
            transition={{
              rotateY: { duration: 22, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-full border border-gold/20"
              style={{ transform: "translateZ(-24px) rotateX(72deg)" }}
            />
            <div
              className="pointer-events-none absolute inset-4 rounded-full border border-gold/10"
              style={{ transform: "translateZ(14px) rotateX(68deg)" }}
            />
            <div
              className="pointer-events-none absolute inset-[32%] rounded-full bg-gold/12 blur-xl"
              style={{ transform: "translateZ(6px)" }}
            />

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: "translateZ(20px)" }}
            >
              <svg viewBox="0 0 100 100" className="h-[88%] w-[88%] overflow-visible">
                <circle cx="50" cy="50" r="3.2" fill="#f2dfa8" opacity="0.9" />
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
                      stroke="rgba(216,188,120,0.48)"
                      strokeWidth="0.65"
                    />
                  );
                })}
                {constellation.stars.map((star, i) => {
                  const depth = ((i % 3) - 1) * 0.15;
                  const r = star.size * (0.9 + depth);
                  return (
                    <circle
                      key={star.id}
                      cx={star.x}
                      cy={star.y}
                      r={r}
                      fill="#f2dfa8"
                      opacity={0.72 + (i % 3) * 0.1}
                      style={{ filter: "drop-shadow(0 0 4px rgba(242,223,168,0.95))" }}
                    />
                  );
                })}
              </svg>
            </div>
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={{
              opacity: hovered ? 0.35 : 0,
              scale: hovered ? 1.05 : 0.9,
            }}
            transition={{ duration: 0.55 }}
            style={{
              background: "radial-gradient(circle, rgba(216,188,120,0.25) 0%, transparent 70%)",
            }}
          />
        </div>

        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.22em] text-gold/55">
          {constellation.constellationName}
        </p>
        <p className="mt-0.5 text-[9px] text-mist/40">Нажмите, чтобы открыть</p>
      </button>

      {fullscreen && (
        <FullscreenConstellation
          constellation={constellation}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}
