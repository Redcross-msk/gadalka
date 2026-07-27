"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZodiacOrb3D } from "@/components/platform/ZodiacOrb3D";
import { useAuth } from "@/hooks/useHydration";
import { getNatalDailyReading } from "@/data/natal";
import { cn } from "@/lib/utils";
import type { ZodiacSign } from "@/types";
import type { HoroscopeSections } from "@/data/horoscopes";

type SectionKey = keyof HoroscopeSections;

const sectionMeta: Record<
  SectionKey,
  { label: string; icon: typeof Sparkles; hint: string }
> = {
  general: { label: "Общее", icon: Sparkles, hint: "Настрой дня" },
  love: { label: "Любовь", icon: Heart, hint: "Отношения" },
  finance: { label: "Финансы", icon: Wallet, hint: "Материальный фон" },
};

function EnergyBars({
  energies,
}: {
  energies: { label: string; value: number }[];
}) {
  return (
    <div className="space-y-2 sm:space-y-2.5">
      {energies.map((e) => (
        <div
          key={e.label}
          className="grid grid-cols-[72px_1fr_32px] sm:grid-cols-[88px_1fr_36px] items-center gap-2 sm:gap-3"
        >
          <span className="text-[11px] sm:text-xs text-cream-muted truncate">{e.label}</span>
          <div className="h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-burgundy/60 to-gold"
              style={{ width: `${e.value}%` }}
            />
          </div>
          <span className="text-[11px] sm:text-xs text-gold/80 text-right tabular-nums">
            {e.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

function HoroscopeSectionsPanel({ sections }: { sections: HoroscopeSections }) {
  const [active, setActive] = useState<SectionKey>("general");
  const meta = sectionMeta[active];

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div
        className="flex gap-1 rounded-xl border border-gold/15 bg-black/20 p-1"
        role="tablist"
        aria-label="Разделы гороскопа"
      >
        {(Object.keys(sectionMeta) as SectionKey[]).map((key) => {
          const ItemIcon = sectionMeta[key].icon;
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] sm:text-xs tracking-wide touch-manipulation min-h-[40px] transition-colors",
                selected
                  ? "bg-gold/15 text-gold border border-gold/25"
                  : "text-muted-foreground border border-transparent hover:text-cream/80"
              )}
            >
              <ItemIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{sectionMeta[key].label}</span>
            </button>
          );
        })}
      </div>

      <div
        key={active}
        role="tabpanel"
        className="min-h-[4.5rem] sm:min-h-[5.25rem]"
      >
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-1.5">
          {meta.hint}
        </p>
        <p className="text-sm md:text-[15px] leading-relaxed text-cream/90 line-clamp-5 sm:line-clamp-6">
          {sections[active]}
        </p>
      </div>
    </div>
  );
}

export function HoroscopeBlock() {
  const { user, isAuthenticated } = useAuth();
  const hasSign = Boolean(user?.zodiacSign);

  const reading =
    hasSign && user?.zodiacSign
      ? getNatalDailyReading(user.zodiacSign as ZodiacSign, user.natalChart)
      : null;

  return (
    <section className="section-mobile mb-8 sm:mb-12">
      <div className="glass-card relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 45% 70% at 12% 50%, rgba(216,188,120,0.1) 0%, transparent 70%)",
          }}
        />

        {isAuthenticated && user && hasSign && reading ? (
          <div className="relative grid gap-4 sm:gap-5 md:grid-cols-[minmax(0,200px)_1fr] md:items-center">
            <div className="flex flex-col items-center justify-center">
              <ZodiacOrb3D constellation={reading.constellation} className="w-full max-w-[180px] md:max-w-none" />
              {reading.hasNatal && (
                <span className="mt-2 rounded-full border border-gold/20 bg-burgundy/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-gold/65">
                  По натальной карте
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.28em] text-gold/60">
                    Гороскоп на сегодня
                  </p>
                  <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-cream font-medium leading-tight mt-0.5">
                    {reading.signName}
                    <span className="ml-2 text-xs sm:text-sm font-sans font-normal text-muted-foreground">
                      {user.name}
                    </span>
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-gold/55 shrink-0 pt-0.5 sm:pt-1">
                  {reading.date}
                </p>
              </div>

              {reading.hasNatal && reading.natalFocus && (
                <p className="text-xs sm:text-sm leading-relaxed text-gold/85 border-l-2 border-gold/30 pl-3 line-clamp-2 sm:line-clamp-3">
                  {reading.natalFocus}
                </p>
              )}

              <HoroscopeSectionsPanel sections={reading.sections} />

              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 pt-1">
                <div className="rounded-xl border border-gold/12 bg-white/[0.02] p-3 sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-gold/60 mb-2.5 sm:mb-3">
                    Энергии дня
                  </p>
                  <EnergyBars energies={reading.energies} />
                </div>

                {reading.matrix && (
                  <div className="rounded-xl border border-gold/12 bg-white/[0.02] p-3 sm:p-4 flex-col justify-center hidden sm:flex">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-gold/60 mb-2">
                      Ваша матрица
                    </p>
                    <p className="font-serif text-lg text-gold-light">
                      Путь {reading.matrix.lifePath} · {reading.matrix.element}
                    </p>
                    <p className="text-sm text-cream-muted mt-2 leading-relaxed line-clamp-3">
                      {reading.matrix.lifePathDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gold/10">
                {!reading.hasNatal && (
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-gold/70 px-2">
                    <Link href="/platform/profile">Добавить натальную карту</Link>
                  </Button>
                )}
                <p className="text-[10px] text-mist/45 ml-auto">
                  Развлекательный характер · не консультация
                </p>
              </div>
            </div>
          </div>
        ) : isAuthenticated && user && !hasSign ? (
          <div className="relative flex flex-col items-center gap-3 py-3 sm:py-4 text-center px-2">
            <p className="text-sm text-cream/90">
              Укажите знак зодиака или натальную карту в профиле
            </p>
            <Button size="sm" asChild>
              <Link href="/platform/profile">Перейти в профиль</Link>
            </Button>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4 text-center px-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold/60">
              Гороскоп на сегодня
            </p>
            <p className="font-serif text-sm sm:text-base text-cream/90 max-w-md leading-relaxed">
              Войдите или зарегистрируйтесь, чтобы увидеть персональный гороскоп
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button size="sm" asChild className="w-full sm:w-auto">
                <Link href="/login?from=/platform">Войти</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="border-gold/25 w-full sm:w-auto">
                <Link href="/register?from=/platform">Регистрация</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
