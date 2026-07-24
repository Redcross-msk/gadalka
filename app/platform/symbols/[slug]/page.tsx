"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { TarotCardComponent } from "@/components/tarot/TarotCard";
import { SymbolCard } from "@/components/platform/SymbolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getSymbolBySlug, symbolCategories, symbols } from "@/data/symbols";
import { getTarotCardBySlug } from "@/data/tarotCards";
import { useAppStore } from "@/store/useAppStore";

const meaningSections = [
  { key: "culturalMeaning" as const, title: "Культурное значение" },
  { key: "symbolicMeaning" as const, title: "Символическое значение" },
  { key: "psychologicalMeaning" as const, title: "Психологическое значение" },
  { key: "everydayMeaning" as const, title: "Значение в повседневной жизни" },
];

export default function SymbolDetailPage() {
  const params = useParams<{ slug: string }>();
  const symbol = getSymbolBySlug(params.slug);
  const [observationNote, setObservationNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const addRecentlyViewedSymbol = useAppStore((s) => s.addRecentlyViewedSymbol);
  const addSymbolObservation = useAppStore((s) => s.addSymbolObservation);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    if (symbol) addRecentlyViewedSymbol(symbol.slug);
  }, [symbol, addRecentlyViewedSymbol]);

  if (!symbol) notFound();

  const categoryName = symbolCategories.find((c) => c.id === symbol.category)?.name;
  const relatedCards = symbol.relatedCards
    .map((slug) => getTarotCardBySlug(slug))
    .filter(Boolean);
  const relatedSymbols = symbols
    .filter((s) => s.slug !== symbol.slug && s.category === symbol.category)
    .slice(0, 3);

  const handleSaveObservation = () => {
    if (!observationNote.trim()) return;
    addSymbolObservation({
      symbolSlug: symbol.slug,
      note: observationNote.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    addToast({
      title: "Наблюдение сохранено",
      variant: "success",
    });
    setObservationNote("");
    setDialogOpen(false);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Символы", href: "/platform/symbols" },
          { label: symbol.name },
        ]}
      />

      <PageHeader title={symbol.name} description={symbol.shortMeaning}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Eye className="h-4 w-4" />
              Я заметил этот знак
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Наблюдение: {symbol.name}</DialogTitle>
              <DialogDescription>
                Запишите, где и когда вы заметили этот знак
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="observation">Ваша заметка</Label>
                <Textarea
                  id="observation"
                  value={observationNote}
                  onChange={(e) => setObservationNote(e.target.value)}
                  placeholder="Опишите контекст наблюдения..."
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleSaveObservation}
                disabled={!observationNote.trim()}
                className="w-full"
              >
                Сохранить наблюдение
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-8">
        {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
        {symbol.popular && <Badge>Популярный</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {meaningSections.map((section) => (
            <section key={section.key} className="rounded-xl border border-border bg-card/30 p-6">
              <h2 className="font-serif text-xl font-semibold mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{symbol[section.key]}</p>
            </section>
          ))}

          <section className="rounded-xl border border-border bg-card/30 p-6">
            <SectionHeader title="Вопросы для размышления" />
            <ul className="space-y-3">
              {symbol.reflectionQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <span className="text-gold shrink-0">✦</span>
                  {q}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-purple-deep/30 border border-gold/10 text-5xl font-serif text-gold/60 mx-auto lg:mx-0">
            {symbol.name.charAt(0)}
          </div>
        </aside>
      </div>

      {relatedCards.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Связанные карты Таро" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedCards.map((card) => card && (
              <TarotCardComponent key={card.id} card={card} showFavorite={false} />
            ))}
          </div>
        </section>
      )}

      {relatedSymbols.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Похожие символы" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedSymbols.map((s) => (
              <SymbolCard key={s.id} symbol={s} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Button variant="ghost" asChild>
          <Link href="/platform/symbols">← К каталогу</Link>
        </Button>
      </div>

    </>
  );
}
