"use client";

import { useCallback, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGate } from "@/components/auth/AuthGate";

const cards = [
  { href: "/platform", label: "ПЛАТФОРМА", hint: "Архив · расклады · сны" },
  { href: "/game", label: "ИГРА", hint: "Кабинет · энергия · карты" },
  { href: "/shop", label: "МАГАЗИН", hint: "Колоды · свечи · артефакты" },
] as const;

function CardFaces({
  label,
  hint,
  faceUp,
}: {
  label: string;
  hint?: string;
  faceUp: boolean;
}) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        transformStyle: "preserve-3d",
        transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
        transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl border-2 border-gold/35 bg-gradient-to-br from-[#5a4550] via-[#463840] to-[#342c34] shadow-[0_28px_56px_rgba(0,0,0,0.4)]"
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        aria-hidden
      >
        <div className="absolute inset-[10px] rounded-xl border border-gold/20" />
        <div className="absolute inset-[18px] rounded-lg border border-gold/10" />
        <div
          className="absolute inset-[26px] rounded-md opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(201,169,98,0.08) 6px, rgba(201,169,98,0.08) 7px), repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(201,169,98,0.06) 6px, rgba(201,169,98,0.06) 7px)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-burgundy/20">
            <span className="font-serif text-2xl text-gold/70">✦</span>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-[#4a3c44] via-[#3a3238] to-[#302a30] shadow-[0_28px_60px_rgba(216,188,120,0.18)] px-4"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="absolute inset-[10px] rounded-xl border border-gold/25" />
        <div className="absolute inset-[20px] rounded-lg border border-dashed border-gold/15 bg-black/15" />
        <span className="relative z-10 font-serif text-2xl tracking-[0.2em] text-gold text-center">
          {label}
        </span>
        {hint && (
          <p className="relative z-10 mt-3 text-[11px] tracking-[0.08em] text-cream-muted/80 text-center max-w-[12rem] leading-relaxed">
            {hint}
          </p>
        )}
        <p className="relative z-10 mt-6 text-[10px] uppercase tracking-[0.28em] text-gold/45">
          Нажмите, чтобы войти
        </p>
      </div>
    </div>
  );
}

function DesktopGate() {
  return (
    <div className="relative z-10 hidden sm:flex flex-row items-center justify-center gap-6 md:gap-8 px-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group relative block h-[min(48vh,380px)] w-[min(30vw,240px)] md:h-[min(56vh,440px)] md:w-[min(32vw,280px)] lg:h-[min(60vh,480px)] lg:w-[min(28vw,320px)] [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={card.label}
        >
          <div className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]">
            <div
              className="absolute inset-0 rounded-xl border-2 border-gold/35 bg-gradient-to-br from-[#5a4550] via-[#463840] to-[#342c34] shadow-[0_24px_50px_rgba(0,0,0,0.28)] [backface-visibility:hidden]"
              aria-hidden
            >
              <div className="absolute inset-[10px] rounded-lg border border-gold/20" />
              <div className="absolute inset-[18px] rounded-md border border-gold/10" />
              <div
                className="absolute inset-[28px] rounded-sm opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(201,169,98,0.08) 6px, rgba(201,169,98,0.08) 7px), repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(201,169,98,0.06) 6px, rgba(201,169,98,0.06) 7px)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-burgundy/20">
                  <span className="font-serif text-2xl text-gold/70">✦</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-gold/45 bg-gradient-to-br from-[#4a3c44] via-[#3a3238] to-[#302a30] shadow-[0_24px_50px_rgba(216,188,120,0.12)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute inset-[10px] rounded-lg border border-gold/25" />
              <div className="absolute inset-[22px] rounded-md border border-dashed border-gold/15 bg-black/20" />
              <span className="relative z-10 font-serif text-xl md:text-2xl lg:text-3xl tracking-[0.18em] text-gold">
                {card.label}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MobileCarousel() {
  const [index, setIndex] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const touchRef = useRef<{ x: number; y: number; dragging: boolean } | null>(null);
  const swipedRef = useRef(false);
  const lockRef = useRef(false);
  const n = cards.length;

  const goTo = useCallback(
    (next: number) => {
      const wrapped = ((next % n) + n) % n;
      setIndex(wrapped);
      setDragPx(0);
    },
    [n]
  );

  const relativeOffset = (i: number) => {
    let d = i - index;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, dragging: false };
    swipedRef.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const start = touchRef.current;
    if (!start) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (!start.dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      start.dragging = true;
      swipedRef.current = true;
    }
    if (start.dragging) {
      setDragPx(dx);
    }
  };

  const onTouchEnd = () => {
    const start = touchRef.current;
    const dx = dragPx;
    touchRef.current = null;
    if (!start?.dragging) {
      setDragPx(0);
      return;
    }
    if (lockRef.current) {
      setDragPx(0);
      return;
    }
    if (dx < -64) {
      lockRef.current = true;
      goTo(index + 1);
      setTimeout(() => {
        lockRef.current = false;
      }, 350);
    } else if (dx > 64) {
      lockRef.current = true;
      goTo(index - 1);
      setTimeout(() => {
        lockRef.current = false;
      }, 350);
    } else {
      setDragPx(0);
    }
  };

  return (
    <div className="relative z-10 flex w-full flex-col items-center sm:hidden px-2">
      <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-gold/55">Выберите путь</p>

      <div
        className="relative h-[min(58vh,420px)] w-full max-w-[360px]"
        style={{ perspective: "1400px" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {cards.map((card, i) => {
          const offset = relativeOffset(i);
          const isCenter = offset === 0;
          const isSide = Math.abs(offset) === 1;
          if (!isCenter && !isSide) return null;

          const xPx = offset * 118 + (isCenter ? dragPx * 0.85 : dragPx * 0.35);
          const scale = isCenter ? 1 : 0.76;
          const z = isCenter ? 40 : 10;
          const opacity = isCenter ? 1 : 0.7;
          const rotateYTilt = offset * -14;

          return (
            <motion.div
              key={card.href}
              className="absolute left-1/2 top-1/2"
              initial={false}
              animate={{
                x: xPx,
                scale,
                opacity,
                rotateY: rotateYTilt,
                zIndex: z,
              }}
              transition={
                Math.abs(dragPx) > 0
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 30 }
              }
              style={{
                width: "min(70vw, 250px)",
                height: "min(50vh, 370px)",
                marginLeft: "calc(min(70vw, 250px) / -2)",
                marginTop: "calc(min(50vh, 370px) / -2)",
                transformStyle: "preserve-3d",
              }}
            >
              {isCenter ? (
                <Link
                  href={card.href}
                  className="block h-full w-full rounded-2xl touch-manipulation"
                  aria-label={`Открыть раздел ${card.label}`}
                  onClick={(e) => {
                    if (swipedRef.current || Math.abs(dragPx) > 14) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <CardFaces label={card.label} hint={card.hint} faceUp />
                </Link>
              ) : (
                <button
                  type="button"
                  className="block h-full w-full rounded-2xl touch-manipulation"
                  aria-label={`Выбрать ${card.label}`}
                  onClick={() => {
                    if (swipedRef.current || Math.abs(dragPx) > 14) return;
                    goTo(i);
                  }}
                >
                  <CardFaces label={card.label} hint={card.hint} faceUp={false} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2">
        {cards.map((card, i) => (
          <button
            key={card.href}
            type="button"
            onClick={() => goTo(i)}
            className="h-2 rounded-full transition-all touch-manipulation"
            style={{
              width: i === index ? 22 : 8,
              background: i === index ? "#d8bc78" : "rgba(216,188,120,0.28)",
            }}
            aria-label={card.label}
          />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-mist/50 tracking-wide">Свайп влево или вправо · тап — войти</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#302a30] text-gold/70 font-serif tracking-[0.2em] uppercase text-sm">
          Открытие колоды…
        </div>
      }
    >
      <AuthGate>
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#302a30] touch-manipulation">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 20%, rgba(216,188,120,0.12) 0%, transparent 50%), linear-gradient(180deg, #383238 0%, #302a30 60%, #2c262c 100%)",
            }}
          />

          <motion.div
            className="relative z-10 flex w-full items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <MobileCarousel />
            <DesktopGate />
          </motion.div>
        </div>
      </AuthGate>
    </Suspense>
  );
}
