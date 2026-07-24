"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/platform/CourseCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { courses } from "@/data/courses";
import { useAppStore } from "@/store/useAppStore";
import { useHydration } from "@/hooks/useHydration";

export default function LearningPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const hydrated = useHydration();
  const courseProgress = useAppStore((s) => s.courseProgress);

  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase().trim();
    return courses.filter((c) => {
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query);
      const matchesFilter =
        filter === "all" ||
        (filter === "free" && !c.premium) ||
        (filter === "premium" && c.premium);
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const inProgressCount = hydrated
    ? courseProgress.filter((p) => p.completedLessons.length > 0).length
    : 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Обучение" }]} />
      <PageHeader
        title="Обучение"
        description="Курсы по Таро, символам и практике самопознания"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{courses.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Курсов</p>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">{inProgressCount}</p>
          <p className="text-sm text-muted-foreground mt-1">В процессе</p>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-5 text-center">
          <p className="text-3xl font-serif text-gold">
            {courses.filter((c) => !c.premium).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Бесплатных</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск курсов..."
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

      <SectionHeader title="Каталог курсов" description={`${filteredCourses.length} курсов`} />

      {filteredCourses.length === 0 ? (
        <EmptyState
          title="Курсы не найдены"
          description="Попробуйте изменить запрос или фильтр"
          action={
            <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }}>
              Сбросить
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}

    </>
  );
}
