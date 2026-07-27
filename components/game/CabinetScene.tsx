"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdleGameStore } from "@/store/gameStore";
import { GameBook } from "@/components/game/objects/GameObjects";
import { comboMultiplier, formatGameNumber } from "@/game/formulas";
import { cn } from "@/lib/utils";

type FloatGain = { id: number; value: number; x: number };
type Ripple = { id: number; x: number; y: number };

function formatComboMult(combo: number): string | null {
  const m = comboMultiplier(combo);
  if (m <= 1) return null;
  return m.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

export function CabinetScene() {
  const clickBook = useIdleGameStore((s) => s.clickBook);
  const bookLevel = useIdleGameStore((s) => s.objectLevels.sign_book ?? 1);
  const settings = useIdleGameStore((s) => s.settings);
  const clickCombo = useIdleGameStore((s) => s.clickCombo);
  const [floats, setFloats] = useState<FloatGain[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pressed, setPressed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<number | null>(null);
  const floatId = useRef(0);

  const bookOpened = clickCombo >= 1000;
  const comboMult = formatComboMult(clickCombo);

  const onTap = useCallback(
    (e?: React.PointerEvent) => {
      const gained = clickBook();
      setPressed(true);
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
      pressTimer.current = window.setTimeout(() => setPressed(false), 90);

      if (settings.reducedMotion || !settings.animations) return;

      const id = ++floatId.current;
      const jitter = (Math.random() - 0.5) * 40;
      setFloats((f) => [...f.slice(-3), { id, value: gained, x: jitter }]);
      window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 700);

      if (wrapRef.current && e) {
        const rect = wrapRef.current.getBoundingClientRect();
        const rx = e.clientX - rect.left;
        const ry = e.clientY - rect.top;
        const rid = id + 0.1;
        setRipples((r) => [...r.slice(-2), { id: rid, x: rx, y: ry }]);
        window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== rid)), 480);
      }
    },
    [clickBook, settings.animations, settings.reducedMotion]
  );

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center py-2 sm:py-6 md:py-10",
        "select-none touch-manipulation overscroll-none",
        "[-webkit-user-select:none] [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]"
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <p className="text-[10px] tracking-[0.28em] uppercase text-gold/55 mb-2 sm:mb-4 pointer-events-none">
        Кабинет Гадалки
      </p>

      <div
        ref={wrapRef}
        className={cn(
          "relative",
          "w-[min(86vw,300px)] h-[min(72vw,280px)]",
          "sm:w-[280px] sm:h-[300px] md:w-[320px] md:h-[340px]"
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-[-18%] rounded-full"
          animate={{
            opacity: bookOpened ? 0.75 : pressed ? 0.65 : 0.4,
            scale: pressed ? 1.05 : bookOpened ? 1.04 : 1,
          }}
          transition={{ duration: 0.12 }}
          style={{
            background: bookOpened
              ? "radial-gradient(circle, rgba(242,223,168,0.38) 0%, rgba(216,188,120,0.12) 45%, transparent 70%)"
              : "radial-gradient(circle, rgba(216,188,120,0.28) 0%, rgba(216,188,120,0.08) 42%, transparent 68%)",
          }}
        />

        <AnimatePresence>
          {clickCombo >= 10 && comboMult && (
            <motion.div
              key="combo"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className={cn(
                  "rounded-full border px-3 py-1 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                  bookOpened
                    ? "border-gold/55 bg-gold/15"
                    : "border-gold/35 bg-[#2e282c]/85"
                )}
              >
                <p className="text-[11px] sm:text-xs text-gold whitespace-nowrap tabular-nums">
                  {bookOpened ? "✦ " : ""}
                  Комбо {clickCombo} · ×{comboMult}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          role="button"
          tabIndex={0}
          aria-label="Книга знаков"
          className={cn(
            "relative z-10 h-full w-full cursor-pointer rounded-xl outline-none",
            "touch-manipulation select-none",
            "[-webkit-user-select:none] [-webkit-touch-callout:none]",
            "focus-visible:ring-2 focus-visible:ring-gold/40",
            "transition-transform duration-75 ease-out",
            pressed ? "scale-[0.94]" : "scale-100"
          )}
          style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            onTap(e);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTap();
            }
          }}
        >
          <GameBook
            level={bookLevel}
            active={pressed}
            opened={bookOpened}
            className="relative z-10 h-full w-full pointer-events-none rounded-xl"
          />
        </div>

        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.5, scale: 0.25 }}
              animate={{ opacity: 0, scale: 1.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="pointer-events-none absolute z-20 rounded-full border border-gold/45"
              style={{
                left: r.x,
                top: r.y,
                width: 24,
                height: 24,
                marginLeft: -12,
                marginTop: -12,
              }}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {floats.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 1, y: 8, x: f.x, scale: 0.9 }}
              animate={{ opacity: 0, y: -56, x: f.x * 1.1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute left-1/2 top-[16%] z-20 text-gold font-serif text-lg sm:text-2xl pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
            >
              +{formatGameNumber(f.value)}
            </motion.span>
          ))}
        </AnimatePresence>

        {pressed && (
          <div
            className="pointer-events-none absolute inset-0 z-[15] rounded-xl"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(242,223,168,0.28) 0%, transparent 55%)",
            }}
          />
        )}
      </div>

      <p className="mt-2.5 sm:mt-4 text-[11px] sm:text-xs text-muted-foreground/80 text-center px-4 pointer-events-none">
        <span className="sm:hidden">
          {bookOpened ? "Книга раскрыта · комбо 1000+" : "Нажимайте на книгу · комбо 1000 раскроет её"}
        </span>
        <span className="hidden sm:inline">
          {bookOpened
            ? "Книга раскрыта · Enter / Space"
            : "Нажмите на книгу · комбо 1000 раскроет её · Enter / Space"}
        </span>
      </p>
    </div>
  );
}
