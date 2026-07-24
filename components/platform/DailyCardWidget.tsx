"use client";

import { TarotCardFlip } from "@/components/tarot/TarotCardFlip";
import { getDailyCard } from "@/data/daily";
import { getTarotCardBySlug } from "@/data/tarotCards";
import { useAuth } from "@/hooks/useHydration";
import type { ZodiacSign } from "@/types";

export function DailyCardWidget() {
  const { user } = useAuth();
  const daily = getDailyCard(user?.zodiacSign as ZodiacSign | undefined);
  const card = getTarotCardBySlug(daily.cardSlug);

  if (!card) return null;

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl px-4 py-7 sm:px-6 sm:py-10 md:px-12 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(216,188,120,0.07) 0%, transparent 42%, transparent 58%, rgba(122,64,80,0.08) 100%)",
        }}
      />

      <div className="relative grid grid-cols-1 items-center gap-6 sm:gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-12">
        {/* Мобилка: карта сверху, затем послание и тема */}
        <div className="order-2 md:order-1 md:-translate-y-10 lg:-translate-y-14 md:text-right text-center">
          <p className="mb-2 sm:mb-3 text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-gold/65">
            Послание
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-tight tracking-wide text-gold-light md:text-4xl lg:text-[2.75rem]">
            {card.name}
          </h3>
          <div
            aria-hidden
            className="my-3 sm:my-5 h-px w-14 sm:w-16 bg-gradient-to-r from-transparent via-gold/45 to-transparent mx-auto md:ml-auto md:mr-0"
          />
          <p className="mx-auto max-w-xs text-xs sm:text-sm leading-relaxed text-cream-muted md:ml-auto md:mr-0 md:text-[0.95rem] line-clamp-3 sm:line-clamp-none">
            {card.shortMeaning}
          </p>
        </div>

        <div className="relative order-1 flex justify-center md:order-2">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 md:block"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(216,188,120,0.14) 0%, transparent 68%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-[18%] hidden h-px w-16 bg-gradient-to-l from-gold/35 to-transparent lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 bottom-[22%] hidden h-px w-16 bg-gradient-to-r from-gold/35 to-transparent lg:block"
          />
          <div className="relative drop-shadow-[0_20px_36px_rgba(0,0,0,0.3)] sm:drop-shadow-[0_28px_48px_rgba(0,0,0,0.35)]">
            <TarotCardFlip
              card={card}
              size="lg"
              className="!w-[7.5rem] !h-[11.25rem] sm:!w-40 sm:!h-60"
            />
          </div>
        </div>

        <div className="order-3 md:translate-y-10 lg:translate-y-14 md:text-left text-center">
          <p className="mb-1.5 sm:mb-2 text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-gold/65">
            Тема дня
          </p>
          <p className="font-serif text-xl sm:text-2xl font-medium leading-snug text-cream md:text-3xl">
            {daily.theme}
          </p>
          <div
            aria-hidden
            className="my-3 sm:my-5 h-px w-14 sm:w-16 bg-gradient-to-r from-gold/45 to-transparent mx-auto md:mx-0"
          />
          <p className="max-w-xs mx-auto md:mx-0 font-serif text-sm sm:text-base italic leading-relaxed text-cream/85 md:text-lg line-clamp-3 sm:line-clamp-none">
            &ldquo;{daily.question}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
