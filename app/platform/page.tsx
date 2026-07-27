"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { SectionHeader } from "@/components/layout/PageHeader";
import { HoroscopeBlock } from "@/components/platform/HoroscopeBlock";
import { DailyCardWidget } from "@/components/platform/DailyCardWidget";
import { FreeSpreadsCarousel } from "@/components/platform/FreeSpreadsCarousel";
import { DreamCard } from "@/components/dreams/DreamCard";
import { SymbolCard } from "@/components/platform/SymbolCard";
import { ProgramCard } from "@/components/platform/ProgramCard";
import { CourseCard } from "@/components/platform/CourseCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useHydration";
import { useAppStore } from "@/store/useAppStore";
import { subscriptionPlans } from "@/data/user";
import { getPopularSymbols } from "@/data/symbols";
import { programs } from "@/data/programs";
import { courses } from "@/data/courses";

const quickActions = [
  { href: "/platform/today", label: "Сегодня", desc: "Карта и знак дня" },
  { href: "/platform/tarot", label: "Таро", desc: "Каталог карт" },
  { href: "/platform/spreads", label: "Расклады", desc: "Интерактивные расклады" },
  { href: "/platform/dreams", label: "Сны", desc: "Дневник снов" },
  { href: "/platform/interpreter", label: "Толкователь", desc: "AI-ассистент" },
  { href: "/platform/my-book", label: "Книга", desc: "Сохранённые карты" },
];

export default function PlatformDashboardPage() {
  const { isPremium, hydrated } = useAuth();
  const dreams = useAppStore((s) => s.dreams);

  const recentDreams = dreams.slice(0, 2);
  const popularSymbols = getPopularSymbols().slice(0, 4);
  const featuredPrograms = programs.slice(0, 3);
  const featuredCourses = courses.slice(0, 3);

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-36 sm:h-40 bg-secondary/50 rounded-xl" />
        <div className="h-20 sm:h-24 bg-secondary/50 rounded-xl" />
        <div className="h-40 sm:h-48 bg-secondary/50 rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <HoroscopeBlock />

      <section className="section-mobile mb-8 sm:mb-12">
        <SectionHeader title="Быстрые действия" />
        {/* Мобилка: плотная сетка без flip-aspect */}
        <div className="grid grid-cols-3 gap-1.5 sm:hidden">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="glass-card relative flex flex-col items-center justify-center rounded-xl border border-gold/20 px-1.5 py-3 min-h-[72px] touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
              aria-label={`${action.label}: ${action.desc}`}
            >
              <span className="font-serif text-[10px] tracking-[0.12em] uppercase text-gold text-center leading-tight">
                {action.label}
              </span>
              <span className="mt-1 text-[9px] text-cream/55 text-center leading-tight line-clamp-2 px-0.5">
                {action.desc}
              </span>
            </Link>
          ))}
        </div>
        {/* Планшет / десктоп: flip-карточки */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flip-card block aspect-[3/4] outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-xl"
              aria-label={`${action.label}: ${action.desc}`}
            >
              <div className="flip-card-inner">
                <div className="flip-card-face glass-card flex flex-col items-center justify-center p-4 border border-gold/15 bg-gradient-to-br from-[#5a4550]/70 via-[#463840]/60 to-[#342c34]/70">
                  <div className="absolute inset-[8px] rounded-lg border border-gold/10" aria-hidden />
                  <span className="relative font-serif text-xs tracking-[0.22em] uppercase text-gold text-center px-1">
                    {action.label}
                  </span>
                  <span className="relative mt-3 text-gold/30 text-lg" aria-hidden>
                    ✦
                  </span>
                </div>
                <div className="flip-card-face flip-card-back glass-card flex flex-col items-center justify-center p-4 border border-gold/30 bg-gradient-to-br from-[#4a3c44] to-[#302a30]">
                  <div className="absolute inset-[8px] rounded-lg border border-gold/20" aria-hidden />
                  <p className="relative font-serif text-[10px] tracking-[0.18em] uppercase text-gold/70 mb-2 text-center">
                    {action.label}
                  </p>
                  <p className="relative text-xs text-cream/85 text-center leading-relaxed px-1">
                    {action.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-mobile mb-8 sm:mb-12">
        <SectionHeader title="Карта дня" />
        <DailyCardWidget />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12">
        <section className="section-mobile">
          <SectionHeader
            title="Расклады"
            action={
              <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                <Link href="/platform/spreads">Все</Link>
              </Button>
            }
          />
          <FreeSpreadsCarousel />
        </section>

        <section className="section-mobile">
          <SectionHeader
            title="Сны"
            action={
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm shrink-0">
                <Link href="/platform/dreams/new">
                  {recentDreams.length > 0 ? "Записать" : "Первый сон"}
                </Link>
              </Button>
            }
          />
          {recentDreams.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentDreams.slice(0, 1).map((dream) => (
                <DreamCard key={dream.id} dream={dream} compact className="sm:hidden" />
              ))}
              {recentDreams.map((dream) => (
                <DreamCard key={`full-${dream.id}`} dream={dream} className="hidden sm:block" />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-5 sm:p-6 text-center">
              <p className="text-sm text-muted-foreground">У вас пока нет записанных снов</p>
            </div>
          )}
        </section>
      </div>

      <section className="section-mobile mb-8 sm:mb-10">
        <SectionHeader
          title="Популярные знаки"
          action={
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/platform/symbols">Все</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {popularSymbols.map((symbol) => (
            <SymbolCard key={symbol.id} symbol={symbol} />
          ))}
        </div>
      </section>

      <section className="section-mobile mb-8 sm:mb-10">
        <SectionHeader
          title="Программы"
          action={
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/platform/programs">Все</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {featuredPrograms.map((program, i) => (
            <div key={program.id} className={i === 2 ? "sm:col-span-2 md:col-span-1" : undefined}>
              <ProgramCard program={program} />
            </div>
          ))}
        </div>
      </section>

      <section className="section-mobile mb-8 sm:mb-10">
        <SectionHeader
          title="Обучение"
          action={
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/platform/learning">Все</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {featuredCourses.map((course, i) => (
            <div key={course.id} className={i === 2 ? "sm:col-span-2 md:col-span-1" : undefined}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </section>

      {!isPremium && (
        <section className="section-mobile">
          <div className="glass-card rounded-2xl p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-5 sm:gap-8 text-center md:text-left">
            <div className="flex-1 min-w-0">
              <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-gold mb-3 sm:mb-4 mx-auto md:mx-0" />
              <h3 className="font-serif text-xl sm:text-2xl">{subscriptionPlans[1].name}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Полный доступ ко всем раскладам, картам и программам
              </p>
              <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {subscriptionPlans[1].features.slice(0, 4).map((f) => (
                  <li key={f}>✦ {f}</li>
                ))}
              </ul>
            </div>
            <Button variant="premium" size="lg" asChild className="w-full md:w-auto shrink-0">
              <Link href="/platform/subscription">Узнать больше</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
