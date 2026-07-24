"use client";

import Link from "next/link";
import {
  BookOpen,
  Layers,
  Moon,
  Eye,
  StickyNote,
  Trophy,
  Gift,
  Sparkles,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { getTarotCardBySlug } from "@/data/tarotCards";
import { getSpreadBySlug } from "@/data/spreads";
import { programs } from "@/data/programs";
import { achievements } from "@/data/achievements";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const moodLabels: Record<string, string> = {
  peaceful: "Спокойный",
  anxious: "Тревожный",
  mysterious: "Загадочный",
  joyful: "Радостный",
  sad: "Грустный",
  neutral: "Нейтральный",
};

export default function MyBookPage() {
  const favoriteCards = useAppStore((s) => s.favoriteCards);
  const savedDailyCardEntries = useAppStore((s) => s.savedDailyCardEntries);
  const spreadHistory = useAppStore((s) => s.spreadHistory);
  const dreams = useAppStore((s) => s.dreams);
  const symbolObservations = useAppStore((s) => s.symbolObservations);
  const notes = useAppStore((s) => s.notes);
  const programProgress = useAppStore((s) => s.programProgress);
  const activatedCodes = useAppStore((s) => s.activatedCodes);

  const favoriteOnly = favoriteCards.filter(
    (slug) => !savedDailyCardEntries.some((e) => e.cardSlug === slug)
  );
  const allCardsCount = favoriteCards.length + savedDailyCardEntries.length;
  const activePrograms = programProgress.map((p) => {
    const program = programs.find((pr) => pr.slug === p.programSlug);
    return { ...p, program };
  });

  const sections = [
    { id: "cards", label: "Карты", icon: Layers, count: allCardsCount },
    { id: "spreads", label: "Расклады", icon: Sparkles, count: spreadHistory.length },
    { id: "dreams", label: "Сны", icon: Moon, count: dreams.length },
    { id: "symbols", label: "Символы", icon: Eye, count: symbolObservations.length },
    { id: "notes", label: "Заметки", icon: StickyNote, count: notes.length },
    { id: "programs", label: "Программы", icon: BookOpen, count: activePrograms.length },
    { id: "achievements", label: "Достижения", icon: Trophy, count: achievements.filter((a) => a.unlocked).length },
    { id: "activated", label: "Активации", icon: Gift, count: activatedCodes.length },
  ];

  return (
    <div>
      <PageHeader
        title="Моя книга"
        description="Персональный архив — все ваши находки, записи и открытия в одном месте"
      />

      {/* Book cover visual */}
      <div className="relative mb-10 rounded-2xl border border-gold/30 bg-gradient-to-br from-burgundy/30 via-purple-deep/20 to-graphite/40 p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gold/20 to-transparent hidden md:block" />
        <div className="absolute top-4 right-4 text-6xl opacity-10">📖</div>
        <div className="relative max-w-xl">
          <p className="text-xs text-gold tracking-widest uppercase mb-2">Личный архив</p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold">Книга знаков и открытий</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Здесь собраны карты, расклады, сны, символы и заметки — ваш путь через мир Архива Гадалки.
            Каждая страница — часть вашей истории.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-background/30 px-3 py-1 text-xs hover:border-gold/40 transition-colors"
              >
                <s.icon className="h-3 w-3 text-gold" />
                {s.label}
                <span className="text-gold">{s.count}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Cards section */}
      <section id="cards" className="mb-12 scroll-mt-24">
        <SectionHeader title="Карты" description="Карты дня и избранное — с темой и описанием" />
        {savedDailyCardEntries.length === 0 && favoriteOnly.length === 0 ? (
          <EmptyState
            icon="🎴"
            title="Пока нет сохранённых карт"
            description="Сохраняйте карту дня кнопкой «В мою книгу»"
            action={
              <Button asChild>
                <Link href="/platform">К карте дня</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {savedDailyCardEntries.map((entry) => {
              const card = getTarotCardBySlug(entry.cardSlug);
              if (!card) return null;
              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border bg-card/30 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <Badge variant="secondary" className="mb-2">Карта дня</Badge>
                      <h4 className="font-serif text-xl text-gold">{card.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{entry.shortMeaning}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="text-gold">Тема:</span> {entry.theme}
                  </p>
                  <p className="text-sm italic text-muted-foreground mt-1">
                    &ldquo;{entry.question}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-4">
                    {entry.fullMeaning}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={`/platform/tarot/${card.slug}`}>Открыть карту</Link>
                  </Button>
                </div>
              );
            })}
            {favoriteOnly.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                {favoriteOnly.map((slug) => {
                  const card = getTarotCardBySlug(slug);
                  if (!card) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/platform/tarot/${slug}`}
                      className="group rounded-xl border border-border bg-card/50 p-4 hover:border-gold/30 transition-all"
                    >
                      <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-burgundy/20 to-purple-deep/20 flex items-center justify-center mb-3">
                        <span className="text-2xl opacity-60">🃏</span>
                      </div>
                      <p className="text-xs text-muted-foreground">№{card.number}</p>
                      <h4 className="font-serif text-sm group-hover:text-gold transition-colors">{card.name}</h4>
                      <Badge variant="secondary" className="mt-2 text-[10px]">Избранное</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Spreads section */}
      <section id="spreads" className="mb-12 scroll-mt-24">
        <SectionHeader title="Расклады" description="История с датами, картами и толкованием" />
        {spreadHistory.length === 0 ? (
          <EmptyState
            icon="✨"
            title="Раскладов пока нет"
            description="Сделайте первый расклад — он сохранится здесь"
            action={
              <Button asChild>
                <Link href="/platform/spreads/one-card">Сделать расклад</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {spreadHistory.map((spread) => {
              const spreadInfo = getSpreadBySlug(spread.spreadSlug);
              return (
                <div
                  key={spread.id}
                  className="rounded-xl border border-border bg-card/30 p-5 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-lg">{spreadInfo?.name ?? spread.spreadSlug}</h4>
                      <p className="text-sm italic text-muted-foreground mt-1">
                        &ldquo;{spread.question}&rdquo;
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(spread.createdAt)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {spread.cards.map((c) => {
                      const card = getTarotCardBySlug(c.cardSlug);
                      const pos = spreadInfo?.positions.find((p) => p.id === c.positionId);
                      return (
                        <div key={c.positionId} className="text-sm border-b border-border/30 pb-2">
                          <span className="text-gold">{pos?.name ?? "Позиция"}:</span>{" "}
                          <span className="font-serif">{card?.name}</span>
                          {card && (
                            <p className="text-xs text-muted-foreground mt-0.5">{card.shortMeaning}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {spread.interpretation && (
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <p className="text-xs text-gold mb-1">Толкование</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {spread.interpretation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Dreams section */}
      <section id="dreams" className="mb-12 scroll-mt-24">
        <SectionHeader title="Сны" description="Записи из дневника снов" />
        {dreams.length === 0 ? (
          <EmptyState
            icon="🌙"
            title="Снов пока нет"
            description="У вас пока нет записанных снов"
            action={
              <Button asChild>
                <Link href="/platform/dreams/new">Записать первый сон</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dreams.slice(0, 6).map((dream) => (
              <Link
                key={dream.id}
                href={`/platform/dreams/${dream.id}`}
                className="rounded-xl border border-border bg-card/30 p-5 hover:border-gold/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-lg">{dream.title}</h4>
                  {dream.recurring && <Badge variant="premium">Повторяющийся</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{dream.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{formatDate(dream.date)}</span>
                  <span>{moodLabels[dream.mood] ?? dream.mood}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Symbols section */}
      <section id="symbols" className="mb-12 scroll-mt-24">
        <SectionHeader title="Символы" description="Наблюдения за знаками" />
        {symbolObservations.length === 0 ? (
          <EmptyState
            icon="👁️"
            title="Наблюдений пока нет"
            description="Отмечайте символы, которые встречаются в жизни"
            action={
              <Button asChild>
                <Link href="/platform/symbols">Энциклопедия символов</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {symbolObservations.map((obs) => (
              <div key={obs.id} className="rounded-xl border border-border bg-card/30 p-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/platform/symbols/${obs.symbolSlug}`}
                    className="font-serif text-lg hover:text-gold transition-colors"
                  >
                    {obs.symbolSlug}
                  </Link>
                  <span className="text-xs text-muted-foreground">{formatDate(obs.date)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{obs.note}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notes section */}
      <section id="notes" className="mb-12 scroll-mt-24">
        <SectionHeader title="Заметки" description="Личные записи и размышления" />
        {notes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Заметок пока нет"
            description="Создайте первую заметку в разделе «Сегодня»"
            action={
              <Button asChild>
                <Link href="/platform/today">Перейти к сегодня</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-border bg-card/30 p-5">
                <h4 className="font-serif text-lg">{note.title}</h4>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{note.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Programs section */}
      <section id="programs" className="mb-12 scroll-mt-24">
        <SectionHeader title="Программы" description="Активные и завершённые программы" />
        {activePrograms.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Программы не начаты"
            description="Выберите тематическую программу для ежедневной практики"
            action={
              <Button asChild>
                <Link href="/platform/programs">Смотреть программы</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePrograms.map((p) => (
              <div key={p.programSlug} className="rounded-xl border border-gold/20 bg-gradient-to-br from-burgundy/10 to-purple-deep/10 p-5">
                <h4 className="font-serif text-lg">{p.program?.name ?? p.programSlug}</h4>
                <p className="text-sm text-muted-foreground mt-1">{p.program?.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>День {p.currentDay}</span>
                    <span>{p.completedStages.length} этапов пройдено</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gold/50"
                      style={{
                        width: `${Math.min(100, (p.completedStages.length / (p.program?.stages.length ?? 7)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Achievements section */}
      <section id="achievements" className="mb-12 scroll-mt-24">
        <SectionHeader title="Достижения" description="Награды за активность в Архиве" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={cn(
                "rounded-xl border p-4 text-center transition-all",
                ach.unlocked
                  ? "border-gold/30 bg-gold/5"
                  : "border-border bg-card/20 opacity-50"
              )}
            >
              <span className="text-3xl">{ach.icon}</span>
              <h4 className="font-serif text-sm mt-2">{ach.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activated products section */}
      <section id="activated" className="mb-12 scroll-mt-24">
        <SectionHeader title="Активированные продукты" description="Бонусы от QR-кодов и покупок" />
        {activatedCodes.length === 0 ? (
          <EmptyState
            icon="🎁"
            title="Активаций пока нет"
            description="Активируйте QR-код с товара или введите код вручную"
            action={
              <Button asChild>
                <Link href="/activate">Активировать код</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {activatedCodes.map((code) => (
              <div
                key={code.code}
                className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="font-serif text-lg">{code.bonus}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{code.code}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(code.activatedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
