"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdleGameStore } from "@/store/gameStore";
import { GameBook } from "@/components/game/objects/GameObjects";
import { formatGameNumber } from "@/game/formulas";

type FloatGain = { id: number; value: number; x: number };
type Ripple = { id: number; x: number; y: number };

export function CabinetScene() {
  const clickBook = useIdleGameStore((s) => s.clickBook);
  const bookLevel = useIdleGameStore((s) => s.objectLevels.sign_book ?? 1);
  const settings = useIdleGameStore((s) => s.settings);
  const clickCombo = useIdleGameStore((s) => s.clickCombo);
  const [floats, setFloats] = useState<FloatGain[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pressed, setPressed] = useState(false);
  const [pulse, setPulse] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const onClick = (e?: React.MouseEvent | React.PointerEvent) => {
    const gained = clickBook();
    setPulse((p) => p + 1);
    setPressed(true);
    window.setTimeout(() => setPressed(false), 160);

    if (settings.reducedMotion || !settings.animations) return;

    const id = Date.now() + Math.random();
    const jitter = (Math.random() - 0.5) * 48;
    setFloats((f) => [...f.slice(-10), { id, value: gained, x: jitter }]);
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 900);

    if (wrapRef.current && e && "clientX" in e) {
      const rect = wrapRef.current.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      const rid = id + 0.5;
      setRipples((r) => [...r.slice(-4), { id: rid, x: rx, y: ry }]);
      window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== rid)), 650);
    }
  };

  const comboMult =
    clickCombo >= 50 ? "2" : clickCombo >= 25 ? "1,5" : clickCombo >= 10 ? "1,2" : null;

  return (
    <div className="relative flex flex-col items-center justify-center py-3 sm:py-6 md:py-10 select-none touch-manipulation">
      <p className="text-[10px] tracking-[0.28em] uppercase text-gold/55 mb-2 sm:mb-4">
        Кабинет Гадалки
      </p>

      <div
        ref={wrapRef}
        className="relative w-[min(78vw,280px)] h-[min(92vw,340px)] sm:w-[260px] sm:h-[320px] md:w-[300px] md:h-[370px]"
      >
        {/* Аура */}
        <motion.div
          className="pointer-events-none absolute inset-[-22%] rounded-full"
          animate={{
            opacity: pressed ? 0.7 : 0.45,
            scale: pressed ? 1.06 : 1,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          style={{
            background:
              "radial-gradient(circle, rgba(216,188,120,0.28) 0%, rgba(216,188,120,0.08) 42%, transparent 68%)",
          }}
        />

        {/* Комбо — оверлей, без сдвига вёрстки */}
        <AnimatePresence>
          {clickCombo >= 10 && comboMult && (
            <motion.div
              key="combo"
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="rounded-full border border-gold/35 bg-[#2e282c]/85 px-3 py-1 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                <p className="text-[11px] sm:text-xs text-gold whitespace-nowrap tabular-nums">
                  Комбо {clickCombo} · ×{comboMult}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Книга знаков"
          className="relative z-10 h-full w-full cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-xl"
          animate={
            pressed
              ? { scale: 0.93, rotateZ: -1.2 }
              : { scale: 1, rotateZ: 0 }
          }
          transition={{ type: "spring", stiffness: 520, damping: 18 }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            onClick(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <GameBook
            level={bookLevel}
            active={pressed}
            className="relative z-10 w-full h-full pointer-events-none rounded-xl"
          />
        </motion.div>

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.55, scale: 0.2 }}
              animate={{ opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-none absolute z-20 rounded-full border border-gold/50"
              style={{
                left: r.x,
                top: r.y,
                width: 28,
                height: 28,
                marginLeft: -14,
                marginTop: -14,
              }}
            />
          ))}
        </AnimatePresence>

        {/* +energy floats */}
        <AnimatePresence>
          {floats.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 1, y: 12, x: f.x, scale: 0.85 }}
              animate={{ opacity: 0, y: -72, x: f.x * 1.15, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-[18%] z-20 text-gold font-serif text-xl sm:text-2xl md:text-3xl pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
            >
              +{formatGameNumber(f.value)}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Мягкий flash при клике */}
        <AnimatePresence>
          {pressed && (
            <motion.div
              key={pulse}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="pointer-events-none absolute inset-0 z-[15] rounded-xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(242,223,168,0.35) 0%, transparent 55%)",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-muted-foreground/80 text-center px-4">
        <span className="sm:hidden">Нажмите на книгу</span>
        <span className="hidden sm:inline">Нажмите на книгу · Enter / Space</span>
      </p>
    </div>
  );
}
