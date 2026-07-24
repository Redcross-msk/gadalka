"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { ProgramCard } from "@/components/platform/ProgramCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { programs } from "@/data/programs";
import { useAppStore } from "@/store/useAppStore";
import { useHydration } from "@/hooks/useHydration";

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const hydrated = useHydration();
  const programProgress = useAppStore((s) => s.programProgress);

  const filteredPrograms = useMemo(() => {
    const query = search.toLowerCase().trim();
    return programs.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      const matchesFilter =
        filter === "all" ||
        (filter === "free" && !p.premium) ||
        (filter === "premium" && p.premium);
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const activeCount = hydrated
    ? programProgress.filter((p) => {
        const prog = programs.find((pr) => pr.slug === p.programSlug);
        return prog && p.completedStages.length < prog.stages.length;
      }).length
    : 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Программы" }]} />
      <PageHeader
        title="Тематические программы"
        description="Пошаговые практики для наблюдения за знаками, снами и картами"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{programs.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Программ</p>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{activeCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Активных</p>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">
            {programs.filter((p) => !p.premium).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Бесплатных</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск программ..."
          className="flex-1 max-w-md"
        />
        <div className="flex gap-2">
          {(["all", "free", "premium"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Все" : f === "free" ? "Бесплатные" : "Премиум"}
            </Button>
          ))}
        </div>
      </div>

      <SectionHeader title="Каталог программ" description={`${filteredPrograms.length} программ`} />

      {filteredPrograms.length === 0 ? (
        <EmptyState
          title="Программы не найдены"
          description="Попробуйте изменить запрос или фильтр"
          action={
            <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }}>
              Сбросить
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      )}

    </>
  );
}
