"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Grid3X3, Heart, List, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TarotCardComponent } from "@/components/tarot/TarotCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getCardsBySection,
  getTarotSection,
  type TarotSectionId,
} from "@/data/tarotCards";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";

type FilterType = "all" | "free" | "premium";
type SortType = "number" | "name" | "favorites";
type ViewType = "grid" | "list";

const PAGE_SIZE = 12;

export default function TarotSectionPage() {
  const params = useParams<{ section: string }>();
  const sectionMeta = getTarotSection(params.section);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("number");
  const [view, setView] = useState<ViewType>("grid");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);

  const favoriteCards = useAppStore((s) => s.favoriteCards);
  const { hydrated } = useAuth();

  const sectionCards = useMemo(
    () => (sectionMeta ? getCardsBySection(sectionMeta.id as TarotSectionId) : []),
    [sectionMeta]
  );

  const filteredCards = useMemo(() => {
    let result = [...sectionCards];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortMeaning.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filter === "free") result = result.filter((c) => !c.premium);
    if (filter === "premium") result = result.filter((c) => c.premium);

    if (favoritesOnly) {
      result = result.filter((c) => favoriteCards.includes(c.slug));
    }

    result.sort((a, b) => {
      if (sort === "favorites") {
        const aFav = favoriteCards.includes(a.slug) ? 0 : 1;
        const bFav = favoriteCards.includes(b.slug) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
      }
      if (sort === "name") return a.name.localeCompare(b.name, "ru");
      return a.number - b.number;
    });

    return result;
  }, [sectionCards, search, filter, sort, favoritesOnly, favoriteCards]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageCards = filteredCards.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  if (!sectionMeta) {
    return (
      <EmptyState
        icon="🎴"
        title="Раздел не найден"
        description="Выберите один из разделов колоды"
        action={
          <Button variant="outline" asChild>
            <Link href="/platform/tarot">К разделам</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Таро", href: "/platform/tarot" },
          { label: sectionMeta.title },
        ]}
      />
      <PageHeader title={sectionMeta.title} description={sectionMeta.description}>
        <Button variant="outline" size="sm" asChild>
          <Link href="/platform/tarot">Все разделы</Link>
        </Button>
      </PageHeader>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-none">
        {(["major", "wands", "cups", "swords", "pentacles"] as TarotSectionId[]).map((id) => {
          const active = id === sectionMeta.id;
          const label =
            id === "major"
              ? "Старшие"
              : id === "wands"
                ? "Жезлы"
                : id === "cups"
                  ? "Кубки"
                  : id === "swords"
                    ? "Мечи"
                    : "Пентакли";
          return (
            <Link
              key={id}
              href={`/platform/tarot/section/${id}`}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
                active
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/30"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Поиск в разделе..."
          className="flex-1"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={filter}
            onValueChange={(v) => {
              setFilter(v as FilterType);
              setPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="free">Бесплатные</TabsTrigger>
              <TabsTrigger value="premium">Премиум</TabsTrigger>
            </TabsList>
          </Tabs>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            aria-label="Сортировка"
          >
            <option value="number">По номеру</option>
            <option value="name">По названию</option>
            <option value="favorites">Избранное первым</option>
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-2 transition-colors",
                view === "grid" ? "bg-secondary text-gold" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Сетка"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-2 transition-colors",
                view === "list" ? "bg-secondary text-gold" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Список"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Switch
          id="favoritesOnly"
          checked={favoritesOnly}
          onCheckedChange={(v) => {
            setFavoritesOnly(v);
            setPage(1);
          }}
        />
        <Label htmlFor="favoritesOnly" className="flex items-center gap-2 cursor-pointer">
          <Heart className="h-4 w-4" />
          Только избранное
        </Label>
        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
          <SlidersHorizontal className="h-3 w-3" />
          {filteredCards.length} · стр. {safePage}/{totalPages}
        </span>
      </div>

      {pageCards.length > 0 ? (
        <>
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
                : "space-y-3"
            }
          >
            {pageCards.map((card) => (
              <TarotCardComponent key={card.id} card={card} variant={view} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Далее
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="🎴"
          title="Карты не найдены"
          description="Попробуйте изменить фильтры или поисковый запрос"
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setFavoritesOnly(false);
                setPage(1);
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      )}
    </>
  );
}
