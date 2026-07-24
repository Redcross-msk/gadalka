"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { SymbolCard } from "@/components/platform/SymbolCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { symbols, symbolCategories, getPopularSymbols, getSymbolBySlug } from "@/data/symbols";
import { useAppStore } from "@/store/useAppStore";
import { useHydration } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";
import type { SymbolCategory } from "@/types";

export default function SymbolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SymbolCategory | "all">("all");
  const [observationNote, setObservationNote] = useState("");
  const [observationSlug, setObservationSlug] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const hydrated = useHydration();
  const recentlyViewedSlugs = useAppStore((s) => s.recentlyViewedSymbols);
  const addSymbolObservation = useAppStore((s) => s.addSymbolObservation);
  const addToast = useAppStore((s) => s.addToast);

  const popularSymbols = getPopularSymbols();
  const recentlyViewed = useMemo(
    () =>
      hydrated
        ? recentlyViewedSlugs
            .map((slug) => getSymbolBySlug(slug))
            .filter(Boolean)
        : [],
    [hydrated, recentlyViewedSlugs]
  );

  const filteredSymbols = useMemo(() => {
    const query = search.toLowerCase().trim();
    return symbols.filter((s) => {
      const matchesCategory = category === "all" || s.category === category;
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.shortMeaning.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const handleSaveObservation = () => {
    if (!observationSlug || !observationNote.trim()) return;
    addSymbolObservation({
      symbolSlug: observationSlug,
      note: observationNote.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    addToast({
      title: "Наблюдение сохранено",
      description: "Запись добавлена в ваш архив знаков",
      variant: "success",
    });
    setObservationNote("");
    setObservationSlug("");
    setDialogOpen(false);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Символы" }]} />
      <PageHeader
        title="Архив символов"
        description="Справочник знаков и образов для размышления и самопознания"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Eye className="h-4 w-4" />
              Я заметил этот знак
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Записать наблюдение</DialogTitle>
              <DialogDescription>
                Зафиксируйте знак, который заметили в жизни или во сне
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="symbol-select">Символ</Label>
                <select
                  id="symbol-select"
                  value={observationSlug}
                  onChange={(e) => setObservationSlug(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
                >
                  <option value="">Выберите символ</option>
                  {symbols.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="observation-note">Заметка</Label>
                <Textarea
                  id="observation-note"
                  value={observationNote}
                  onChange={(e) => setObservationNote(e.target.value)}
                  placeholder="Где и когда вы заметили этот знак?"
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleSaveObservation}
                disabled={!observationSlug || !observationNote.trim()}
                className="w-full"
              >
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Поиск символов..."
        className="mb-6 max-w-md"
      />

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[36px]",
            category === "all"
              ? "border-gold/40 bg-burgundy/20 text-gold"
              : "border-border text-muted-foreground hover:border-gold/20"
          )}
        >
          Все
        </button>
        {symbolCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[36px]",
              category === cat.id
                ? "border-gold/40 bg-burgundy/20 text-gold"
                : "border-border text-muted-foreground hover:border-gold/20"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {popularSymbols.length > 0 && category === "all" && !search && (
        <section className="mb-10">
          <SectionHeader title="Популярные" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularSymbols.map((s) => (
              <SymbolCard key={s.id} symbol={s} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && category === "all" && !search && (
        <section className="mb-10">
          <SectionHeader title="Недавно просмотренные" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewed.map((s) => s && <SymbolCard key={s.id} symbol={s} />)}
          </div>
        </section>
      )}

      <SectionHeader
        title={search || category !== "all" ? "Результаты" : "Все символы"}
        description={`${filteredSymbols.length} символов`}
      />

      {filteredSymbols.length === 0 ? (
        <EmptyState
          title="Символы не найдены"
          description="Попробуйте изменить запрос или категорию"
          action={
            <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); }}>
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSymbols.map((s) => (
            <SymbolCard key={s.id} symbol={s} />
          ))}
        </div>
      )}

    </>
  );
}
