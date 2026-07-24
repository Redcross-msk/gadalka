"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Moon } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { DreamCard } from "@/components/dreams/DreamCard";
import { DreamAnalysisPanel } from "@/components/dreams/DreamAnalysisPanel";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { dreamMoods } from "@/data/dreams";
import { useAppStore } from "@/store/useAppStore";
import { useAuth, useHydration } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";
import type { DreamMood } from "@/types";

export default function DreamsPage() {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<DreamMood | "all">("all");
  const [recurringOnly, setRecurringOnly] = useState(false);

  const hydrated = useHydration();
  const { isPremium } = useAuth();
  const dreams = useAppStore((s) => s.dreams);

  const filteredDreams = useMemo(() => {
    if (!hydrated) return [];
    const query = search.toLowerCase().trim();
    return dreams.filter((d) => {
      const matchesSearch =
        !query ||
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.symbols.some((s) => s.toLowerCase().includes(query));
      const matchesMood = moodFilter === "all" || d.mood === moodFilter;
      const matchesRecurring = !recurringOnly || d.recurring;
      return matchesSearch && matchesMood && matchesRecurring;
    });
  }, [hydrated, dreams, search, moodFilter, recurringOnly]);

  const stats = useMemo(() => {
    if (!hydrated) return { total: 0, recurring: 0, withAnalysis: 0 };
    return {
      total: dreams.length,
      recurring: dreams.filter((d) => d.recurring).length,
      withAnalysis: dreams.filter((d) => d.analysis).length,
    };
  }, [hydrated, dreams]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Дневник снов" }]} />
      <PageHeader
        title="Дневник снов"
        description="Записывайте сны, отслеживайте символы и находите закономерности"
      >
        <Button asChild>
          <Link href="/platform/dreams/new">
            <Plus className="h-4 w-4" />
            Новый сон
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">Всего записей</p>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{stats.recurring}</p>
          <p className="text-sm text-muted-foreground mt-1">Повторяющихся</p>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{stats.withAnalysis}</p>
          <p className="text-sm text-muted-foreground mt-1">С анализом</p>
        </div>
      </div>

      {hydrated && <DreamAnalysisPanel dreams={dreams} isPremium={isPremium} />}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск по снам и символам..."
          className="flex-1 max-w-md"
        />
        <button
          onClick={() => setRecurringOnly(!recurringOnly)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm border transition-colors min-h-[44px]",
            recurringOnly
              ? "border-gold/40 bg-burgundy/20 text-gold"
              : "border-border text-muted-foreground hover:border-gold/20"
          )}
        >
          Только повторяющиеся
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setMoodFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[36px]",
            moodFilter === "all"
              ? "border-gold/40 bg-burgundy/20 text-gold"
              : "border-border text-muted-foreground hover:border-gold/20"
          )}
        >
          Все настроения
        </button>
        {dreamMoods.map((m) => (
          <button
            key={m.id}
            onClick={() => setMoodFilter(m.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[36px]",
              moodFilter === m.id
                ? "border-gold/40 bg-burgundy/20 text-gold"
                : "border-border text-muted-foreground hover:border-gold/20"
            )}
          >
            {m.emoji} {m.name}
          </button>
        ))}
      </div>

      <SectionHeader
        title="Записи"
        description={`${filteredDreams.length} из ${stats.total}`}
      />

      {!hydrated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl border border-border bg-card/30 animate-pulse" />
          ))}
        </div>
      ) : filteredDreams.length === 0 ? (
        <EmptyState
          icon={<Moon />}
          title={dreams.length === 0 ? "Дневник пуст" : "Сны не найдены"}
          description={
            dreams.length === 0
              ? "У вас пока нет записанных снов"
              : "Попробуйте изменить фильтры"
          }
          action={
            <Button asChild>
              <Link href="/platform/dreams/new">
                {dreams.length === 0 ? "Записать первый сон" : "Записать сон"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDreams.map((d) => (
            <DreamCard key={d.id} dream={d} />
          ))}
        </div>
      )}

    </>
  );
}
