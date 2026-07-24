"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Grid3X3, Heart, List, SlidersHorizontal } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TarotCardComponent } from "@/components/tarot/TarotCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { tarotCards } from "@/data/tarotCards";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";

type FilterType = "all" | "free" | "premium";
type SortType = "number" | "name" | "favorites";
type ViewType = "grid" | "list";

export default function TarotCatalogPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("number");
  const [view, setView] = useState<ViewType>("grid");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const favoriteCards = useAppStore((s) => s.favoriteCards);
  const savedDailyCards = useAppStore((s) => s.savedDailyCards);
  const { isPremium, hydrated } = useAuth();

  const collectionSlugs = useMemo(
    () => new Set([...favoriteCards, ...savedDailyCards]),
    [favoriteCards, savedDailyCards]
  );

  const accessibleCount = useMemo(
    () => tarotCards.filter((c) => !c.premium || isPremium).length,
    [isPremium]
  );

  const progressPercent = Math.round((collectionSlugs.size / tarotCards.length) * 100);

  const filteredCards = useMemo(() => {
    let result = [...tarotCards];

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
  }, [search, filter, sort, favoritesOnly, favoriteCards]);

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Таро" }]} />
      <PageHeader
        title="Каталог карт"
        description="22 карты Старших Арканов — ваш путеводитель по символам и архетипам"
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/platform/spreads">Расклады</Link>
        </Button>
      </PageHeader>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-serif text-lg">Коллекция</p>
            <p className="text-sm text-muted-foreground">
              {collectionSlugs.size} из {tarotCards.length} карт в вашем архиве
              {!isPremium && ` · ${accessibleCount} доступно`}
            </p>
          </div>
          <Badge variant="secondary">{progressPercent}%</Badge>
        </div>
        <Progress value={progressPercent} />
        {favoriteCards.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Heart className="h-3 w-3 fill-gold text-gold" />
            {favoriteCards.length} в избранном
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск по названию, значению или тегам..."
          className="flex-1"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
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
          onCheckedChange={setFavoritesOnly}
        />
        <Label htmlFor="favoritesOnly" className="flex items-center gap-2 cursor-pointer">
          <Heart className="h-4 w-4" />
          Только избранное
        </Label>
        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
          <SlidersHorizontal className="h-3 w-3" />
          Найдено: {filteredCards.length}
        </span>
      </div>

      {/* Grid / List */}
      {filteredCards.length > 0 ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              : "space-y-3"
          }
        >
          {filteredCards.map((card) => (
            <TarotCardComponent key={card.id} card={card} variant={view} />
          ))}
        </div>
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
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      )}

      {!isPremium && filter !== "free" && (
        <section className="mt-10">
          <SectionHeader title="Премиум-карты" description="Доступны по подписке Гадалка+" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
            {tarotCards
              .filter((c) => c.premium)
              .slice(0, 4)
              .map((card) => (
                <TarotCardComponent key={card.id} card={card} showFavorite={false} />
              ))}
          </div>
          <div className="text-center mt-4">
            <Button variant="premium" asChild>
              <Link href="/platform/subscription">Открыть все карты</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
