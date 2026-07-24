"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeDreamAnalytics } from "@/lib/dreamAnalytics";
import { cn } from "@/lib/utils";
import type { Dream } from "@/types";

function DonutChart({
  segments,
  compact,
}: {
  segments: { pct: number; color: string; label: string; emoji: string }[];
  compact?: boolean;
}) {
  const radius = compact ? 40 : 54;
  const stroke = compact ? 12 : 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-3 sm:gap-6", compact && "gap-3")}>
      <div className={cn("relative shrink-0", compact ? "h-24 w-24" : "h-36 w-36")}>
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(216,188,120,0.12)"
            strokeWidth={stroke}
          />
          {segments.map((seg) => {
            const dash = (seg.pct / 100) * circumference;
            const circle = (
              <circle
                key={seg.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Sparkles className={cn("mb-1 text-gold/70", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold/60">
            Настроение
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className={cn("flex items-center gap-2", compact ? "text-xs" : "text-sm")}>
            <span
              className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="truncate text-cream-muted">
              {seg.emoji} {seg.label}
            </span>
            <span className="ml-auto font-medium text-cream">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarGroup({
  items,
}: {
  items: { label: string; value: number; color: string; emoji: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-cream-muted">
              {item.emoji} {item.label}
            </span>
            <span className="text-cream">{item.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SleepGauge({ score }: { score: number }) {
  const angle = (score / 100) * 180 - 90;

  return (
    <div className="relative mx-auto h-28 w-48">
      <svg viewBox="0 0 200 110" className="h-full w-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(216,188,120,0.15)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#sleepGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251} 251`}
        />
        <defs>
          <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#955868" />
            <stop offset="50%" stopColor="#9a7ab8" />
            <stop offset="100%" stopColor="#d8bc78" />
          </linearGradient>
        </defs>
        <line
          x1="100"
          y1="100"
          x2={100 + 58 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 58 * Math.sin((angle * Math.PI) / 180)}
          stroke="#f2dfa8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="6" fill="#d8bc78" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-serif text-3xl text-gold-light">{score}</p>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold/60">индекс сна</p>
      </div>
    </div>
  );
}

interface DreamAnalysisPanelProps {
  dreams: Dream[];
  isPremium: boolean;
}

export function DreamAnalysisPanel({ dreams, isPremium }: DreamAnalysisPanelProps) {
  const analytics = computeDreamAnalytics(dreams);

  if (!analytics) {
    return (
      <section className="mb-10">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-gold/50" />
          <h3 className="font-serif text-2xl text-gold-light">Анализ снов</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream-muted">
            Запишите несколько снов — и здесь появится диаграмма настроений, атмосферы и ваш
            персональный профиль сна.
          </p>
        </div>
      </section>
    );
  }

  const toneTotal = analytics.tone.positive + analytics.tone.negative + analytics.tone.neutral;
  const atmosphereTotal =
    analytics.atmosphere.vivid + analytics.atmosphere.mysterious + analytics.atmosphere.heavy;

  const toneItems = [
    {
      label: "Светлые",
      value: Math.round((analytics.tone.positive / toneTotal) * 100),
      color: "#d8bc78",
      emoji: "☀️",
    },
    {
      label: "Нейтральные",
      value: Math.round((analytics.tone.neutral / toneTotal) * 100),
      color: "#9a7ab8",
      emoji: "✨",
    },
    {
      label: "Тяжёлые",
      value: Math.round((analytics.tone.negative / toneTotal) * 100),
      color: "#955868",
      emoji: "🌧️",
    },
  ];

  const atmosphereItems = [
    {
      label: "Красочные",
      value: Math.round((analytics.atmosphere.vivid / atmosphereTotal) * 100),
      color: "#d8bc78",
      emoji: "🎨",
    },
    {
      label: "Загадочные",
      value: Math.round((analytics.atmosphere.mysterious / atmosphereTotal) * 100),
      color: "#9a7ab8",
      emoji: "🌙",
    },
    {
      label: "Напряжённые",
      value: Math.round((analytics.atmosphere.heavy / atmosphereTotal) * 100),
      color: "#5a8ab0",
      emoji: "🌊",
    },
  ];

  const content = (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5">
        <h4 className="mb-4 font-serif text-lg text-gold-light">Настроения снов</h4>
        <DonutChart segments={analytics.moodBreakdown} />
      </div>

      <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5">
        <h4 className="mb-4 font-serif text-lg text-gold-light">Свет / тень</h4>
        <BarGroup items={toneItems} />
        <div className="my-5 decorative-line" />
        <h4 className="mb-4 font-serif text-lg text-gold-light">Атмосфера</h4>
        <BarGroup items={atmosphereItems} />
      </div>

      <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5 lg:col-span-2">
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold/65">Профиль сна</p>
            <h4 className="mt-2 font-serif text-2xl text-gold-light">{analytics.sleepProfile.title}</h4>
            <p className="mt-3 text-sm leading-relaxed text-cream-muted">
              {analytics.sleepProfile.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {analytics.sleepProfile.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full border border-gold/20 bg-burgundy/10 px-3 py-1 text-xs text-gold/80"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <SleepGauge score={analytics.sleepProfile.score} />

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold/65">
                Повторяющиеся сны
              </p>
              <p className="font-serif text-3xl text-cream">{analytics.recurringRate}%</p>
            </div>
            {analytics.topSymbols.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold/65">
                  Частые символы
                </p>
                <div className="flex flex-wrap gap-2">
                  {analytics.topSymbols.map((s) => (
                    <span
                      key={s.symbol}
                      className="rounded-lg border border-gold/15 px-2.5 py-1 text-xs text-cream-muted"
                    >
                      {s.symbol} · {s.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analytics.monthlyActivity.length > 1 && (
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold/65">
                  Активность
                </p>
                <div className="flex items-end gap-2 h-16">
                  {analytics.monthlyActivity.map((m) => {
                    const max = Math.max(...analytics.monthlyActivity.map((x) => x.count), 1);
                    return (
                      <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-burgundy/40 to-gold/50"
                          style={{ height: `${(m.count / max) * 100}%`, minHeight: 4 }}
                        />
                        <span className="text-[10px] text-muted-foreground">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(analytics.topThemes.length > 0 || analytics.topEmotions.length > 0) && (
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          {analytics.topThemes.length > 0 && (
            <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5">
              <h4 className="mb-3 font-serif text-lg text-gold-light">Повторяющиеся темы</h4>
              <div className="space-y-2">
                {analytics.topThemes.map((t) => (
                  <div key={t.theme} className="flex justify-between text-sm">
                    <span className="text-cream-muted">{t.theme}</span>
                    <span className="text-gold">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analytics.topEmotions.length > 0 && (
            <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5">
              <h4 className="mb-3 font-serif text-lg text-gold-light">Эмоции во снах</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.topEmotions.map((e) => (
                  <span
                    key={e.emotion}
                    className="rounded-full border border-gold/15 bg-burgundy/10 px-3 py-1.5 text-sm text-cream/85"
                  >
                    {e.emotion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="mb-8 sm:mb-10">
      <div className="mb-3 sm:mb-5">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold/65">По всем записям</p>
        <h3 className="font-serif text-xl sm:text-2xl text-gold-light md:text-3xl">Анализ снов</h3>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-cream-muted line-clamp-2 sm:line-clamp-none">
          Статистика по {analytics.total} {analytics.total === 1 ? "записи" : "записям"} — настроения,
          атмосфера и ваш профиль сна
        </p>
      </div>

      {/* Мобилка без подписки: расширенное превью с реальными графиками */}
      {!isPremium && (
        <div className="relative overflow-hidden rounded-2xl border border-gold/20 glass-card sm:hidden min-h-[340px]">
          <div className="pointer-events-none select-none blur-[4px] max-h-[360px] overflow-hidden p-3.5 opacity-90 scale-[0.98] origin-top">
            <div className="space-y-3">
              <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-3">
                <p className="mb-2 font-serif text-sm text-gold-light">Настроения снов</p>
                <DonutChart segments={analytics.moodBreakdown} compact />
              </div>
              <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-3">
                <p className="mb-2 font-serif text-sm text-gold-light">Свет / тень</p>
                <BarGroup items={toneItems} />
              </div>
              <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-3 flex items-center gap-3">
                <SleepGauge score={analytics.sleepProfile.score} />
                <div className="min-w-0">
                  <p className="font-serif text-base text-gold-light">{analytics.sleepProfile.title}</p>
                  <p className="mt-1 text-[11px] text-cream-muted line-clamp-2">
                    {analytics.sleepProfile.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-end sm:items-center justify-center bg-gradient-to-b from-transparent via-[#2e282c]/45 to-[#2e282c]/92 p-4 pb-5">
            <div className="w-full max-w-sm rounded-xl border border-gold/25 bg-[#342c34]/92 px-4 py-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-burgundy/20">
                <Lock className="h-5 w-5 text-gold" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold/70">Гадалка+</p>
              <h4 className="mt-1 font-serif text-lg text-gold-light">Полный анализ снов</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-cream-muted">
                Диаграммы настроений, атмосферы и профиль сна по всем записям.
              </p>
              <Button variant="premium" size="sm" className="mt-3.5 w-full" asChild>
                <Link href="/platform/subscription">Открыть по подписке</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Полный блок: премиум на мобиле / всегда на десктопе */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-gold/20 glass-card p-4 sm:p-5 md:p-7",
          !isPremium ? "hidden sm:block" : ""
        )}
      >
        <div className={isPremium ? "" : "pointer-events-none select-none blur-[6px]"}>
          {content}
        </div>

        {!isPremium && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-[#2e282c]/55 to-[#2e282c]/88 p-6">
            <div className="max-w-md rounded-2xl border border-gold/25 bg-[#342c34]/90 p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-burgundy/20">
                <Lock className="h-6 w-6 text-gold" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70">Гадалка+</p>
              <h4 className="mt-2 font-serif text-2xl text-gold-light">Полный анализ снов</h4>
              <p className="mt-3 text-sm leading-relaxed text-cream-muted">
                Узнайте, какие сны у вас преобладают — красочные или загадочные, светлые или
                тяжёлые — и как спит ваше подсознание по всем записям.
              </p>
              <Button variant="premium" className="mt-6 w-full sm:w-auto" asChild>
                <Link href="/platform/subscription">Смотреть анализ по подписке</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
