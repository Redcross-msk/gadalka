"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart } from "lucide-react";
import { TAROT_SECTIONS, tarotCards } from "@/data/tarotCards";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { useMemo } from "react";

export default function TarotHubPage() {
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

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Таро" }]} />
      <PageHeader
        title="Колода Таро"
        description="78 карт — Старшие и Младшие Арканы. Выберите раздел, чтобы листать без бесконечной прокрутки."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/platform/spreads">Расклады</Link>
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card/50 p-5 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="min-w-0">
            <p className="font-serif text-lg">Коллекция</p>
            <p className="text-sm text-muted-foreground">
              {collectionSlugs.size} из {tarotCards.length} карт
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TAROT_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={`/platform/tarot/section/${section.id}`}
            className="rounded-xl border border-border bg-card/50 p-5 sm:p-6 hover:border-gold/35 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-serif text-xl group-hover:text-gold transition-colors">
                {section.title}
              </h2>
              <Badge variant="outline">{section.count}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.description}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gold/55">
              Открыть раздел
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
