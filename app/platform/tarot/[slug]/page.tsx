"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Heart, Lock, Tv } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TarotCardFlip } from "@/components/tarot/TarotCardFlip";
import { LockedContent } from "@/components/shared/LockedContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTarotCardBySlug } from "@/data/tarotCards";
import { episodes } from "@/data/episodes";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";
import type { TarotSymbol } from "@/types";
import { notFound } from "next/navigation";

function SymbolHotspots({
  symbols,
  cardNumber,
  cardName,
}: {
  symbols: TarotSymbol[];
  cardNumber: number;
  cardName: string;
}) {
  const [activeSymbol, setActiveSymbol] = useState<TarotSymbol | null>(null);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[2/3] max-w-xs mx-auto rounded-xl bg-gradient-to-br from-burgundy/30 to-purple-deep/30 border-2 border-gold/30 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-serif text-gold/40">{cardNumber}</span>
          <p className="text-sm font-serif text-muted-foreground mt-2">{cardName}</p>
        </div>
        {symbols.map((symbol) => (
          <button
            key={symbol.id}
            onClick={() => setActiveSymbol(activeSymbol?.id === symbol.id ? null : symbol)}
            className={cn(
              "absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 transition-all flex items-center justify-center text-xs font-medium",
              activeSymbol?.id === symbol.id
                ? "border-gold bg-gold/30 text-gold scale-125 z-10"
                : "border-gold/50 bg-burgundy/50 text-gold/80 hover:scale-110 hover:border-gold"
            )}
            style={{ left: `${symbol.x}%`, top: `${symbol.y}%` }}
            aria-label={`Символ: ${symbol.name}`}
          >
            ✦
          </button>
        ))}
      </div>

      {activeSymbol ? (
        <div className="rounded-lg border border-gold/30 bg-burgundy/10 p-4 text-center animate-in fade-in">
          <p className="font-serif text-lg text-gold">{activeSymbol.name}</p>
          <p className="text-sm text-muted-foreground mt-2">{activeSymbol.description}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Нажмите на точки, чтобы изучить символы карты
        </p>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {symbols.map((symbol) => (
          <Badge
            key={symbol.id}
            variant={activeSymbol?.id === symbol.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveSymbol(activeSymbol?.id === symbol.id ? null : symbol)}
          >
            {symbol.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function TarotCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const card = getTarotCardBySlug(slug);

  const favoriteCards = useAppStore((s) => s.favoriteCards);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addToast = useAppStore((s) => s.addToast);
  const { isPremium, hydrated } = useAuth();

  if (!card) notFound();

  const isLocked = card.premium && !isPremium;
  const isFavorite = favoriteCards.includes(card.slug);

  const relatedCards = card.relatedCards
    .map((s) => getTarotCardBySlug(s))
    .filter(Boolean);
  const relatedEpisode = card.relatedEpisode
    ? episodes.find((e) => e.slug === card.relatedEpisode)
    : episodes.find((e) => e.relatedCards.includes(card.slug));

  const handleFavorite = () => {
    toggleFavorite(card.slug);
    addToast({
      title: isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
      variant: "success",
    });
  };

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Таро", href: "/platform/tarot" },
          { label: card.name },
        ]}
      />

      <PageHeader title={card.name} description={card.shortMeaning}>
        <div className="flex items-center gap-2">
          {card.premium ? (
            <Badge variant="premium">
              <Lock className="h-3 w-3 mr-1" />
              Премиум
            </Badge>
          ) : (
            <Badge variant="free">Доступно</Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleFavorite}>
            <Heart className={cn("h-4 w-4 mr-1", isFavorite && "fill-gold text-gold")} />
            {isFavorite ? "В избранном" : "В избранное"}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col items-center gap-4">
          <TarotCardFlip card={card} flipped size="lg" />
          <span className="text-sm text-muted-foreground">#{card.number} Старший Аркан</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {card.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {isLocked ? (
            <LockedContent
              title={`${card.name} — премиум-карта`}
              description="Полное описание, символы и контексты доступны по подписке Гадалка+"
            />
          ) : (
            <>
              <Tabs defaultValue="meaning">
                <TabsList className="flex-wrap h-auto">
                  <TabsTrigger value="meaning">Значение</TabsTrigger>
                  <TabsTrigger value="symbols">Символы</TabsTrigger>
                  <TabsTrigger value="context">Контексты</TabsTrigger>
                  <TabsTrigger value="sides">Стороны</TabsTrigger>
                </TabsList>

                <TabsContent value="meaning" className="mt-6">
                  <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
                    <div>
                      <h3 className="font-serif text-lg mb-2">Полное значение</h3>
                      <p className="text-muted-foreground leading-relaxed">{card.fullMeaning}</p>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg mb-2">Краткое послание</h3>
                      <p className="text-gold italic">&ldquo;{card.decisionMeaning}&rdquo;</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="symbols" className="mt-6">
                  <SectionHeader
                    title="Символы на карте"
                    description="Интерактивная карта символов"
                  />
                  <SymbolHotspots
                    symbols={card.symbols}
                    cardNumber={card.number}
                    cardName={card.name}
                  />
                </TabsContent>

                <TabsContent value="context" className="mt-6">
                  <div className="space-y-4">
                    {[
                      { title: "Отношения", text: card.relationshipsMeaning },
                      { title: "Работа и карьера", text: card.workMeaning },
                      { title: "Принятие решений", text: card.decisionMeaning },
                    ].map((section) => (
                      <div
                        key={section.title}
                        className="rounded-xl border border-border bg-card/50 p-5"
                      >
                        <h3 className="font-serif text-lg mb-2">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">{section.text}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="sides" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gold/20 bg-burgundy/10 p-5">
                      <h3 className="font-serif text-lg text-gold mb-2">Светлая сторона</h3>
                      <p className="text-sm text-muted-foreground">{card.lightSide}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/50 p-5">
                      <h3 className="font-serif text-lg mb-2">Теневая сторона</h3>
                      <p className="text-sm text-muted-foreground">{card.shadowSide}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Related content */}
      {!isLocked && (
        <div className="mt-12 space-y-10">
          {relatedCards.length > 0 && (
            <section>
              <SectionHeader title="Связанные карты" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {relatedCards.map(
                  (c) =>
                    c && (
                      <Link
                        key={c.id}
                        href={`/platform/tarot/${c.slug}`}
                        className="rounded-xl border border-border bg-card/50 p-4 hover:border-gold/30 transition-all text-center group"
                      >
                        <span className="text-2xl font-serif text-gold/60">{c.number}</span>
                        <p className="font-serif mt-2 group-hover:text-gold transition-colors">
                          {c.name}
                        </p>
                      </Link>
                    )
                )}
              </div>
            </section>
          )}

          {relatedEpisode && (
            <section>
              <SectionHeader title="В сериале" />
              <div className="rounded-xl border border-border bg-card/50 p-6 flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-burgundy/20">
                  <Tv className="h-7 w-7 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Сезон {relatedEpisode.season}, эпизод {relatedEpisode.episode}
                  </p>
                  <h3 className="font-serif text-xl">{relatedEpisode.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {relatedEpisode.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {relatedEpisode.themes.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

    </>
  );
}
