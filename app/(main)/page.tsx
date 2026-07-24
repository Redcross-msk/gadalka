"use client";

import Link from "next/link";
import { Suspense } from "react";
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

/** Мобилка: обычные ссылки, без свайпа — тап всегда ведёт в раздел */
function MobileLinks() {
  return (
    <div className="relative z-10 flex w-full flex-col items-center gap-4 sm:hidden px-4 pb-8">
      <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold/55">Выберите путь</p>
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="relative block h-[min(28vh,220px)] w-full max-w-[320px] [perspective:1200px] touch-manipulation"
          aria-label={card.label}
        >
          <CardFaces label={card.label} hint={card.hint} faceUp />
        </Link>
      ))}
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
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[#302a30] touch-manipulation">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 20%, rgba(216,188,120,0.12) 0%, transparent 50%), linear-gradient(180deg, #383238 0%, #302a30 60%, #2c262c 100%)",
            }}
          />

          <motion.div
            className="relative z-10 flex w-full items-center justify-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <MobileLinks />
            <DesktopGate />
          </motion.div>
        </div>
      </AuthGate>
    </Suspense>
  );
}
