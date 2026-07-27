"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { SymbolCard } from "@/components/platform/SymbolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dreamMoods } from "@/data/dreams";
import { getSymbolBySlug } from "@/data/symbols";
import { useAppStore } from "@/store/useAppStore";
import { useHydration } from "@/hooks/useHydration";
import { formatDate } from "@/lib/utils";

export default function DreamDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydration();
  const getDream = useAppStore((s) => s.getDream);
  const dream = hydrated ? getDream(params.id) : undefined;

  if (hydrated && !dream) notFound();

  const mood = dream ? dreamMoods.find((m) => m.id === dream.mood) : null;
  const symbolItems = dream
    ? dream.symbols.map((slug) => getSymbolBySlug(slug)).filter(Boolean)
    : [];

  if (!dream) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-card/30 rounded animate-pulse" />
        <div className="h-32 bg-card/30 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Дневник снов", href: "/platform/dreams" },
          { label: dream.title },
        ]}
      />

      <PageHeader title={dream.title} description={formatDate(dream.date)}>
        <Button variant="outline" asChild>
          <Link href="/platform/interpreter">Спросить толкователя</Link>
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-8">
        {mood && (
          <Badge variant="secondary">
            {mood.emoji} {mood.name}
          </Badge>
        )}
        {dream.recurring && <Badge variant="premium">Повторяющийся</Badge>}
      </div>

      <section className="rounded-xl border border-border bg-card/30 p-6 mb-8">
        <SectionHeader title="Описание" />
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{dream.description}</p>
      </section>

      {(dream.characters.length > 0 || dream.places.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {dream.characters.length > 0 && (
            <section className="rounded-xl border border-border bg-card/30 p-6">
              <h3 className="font-serif text-lg mb-3">Персонажи</h3>
              <div className="flex flex-wrap gap-2">
                {dream.characters.map((c) => (
                  <Badge key={c} variant="secondary">{c}</Badge>
                ))}
              </div>
            </section>
          )}
          {dream.places.length > 0 && (
            <section className="rounded-xl border border-border bg-card/30 p-6">
              <h3 className="font-serif text-lg mb-3">Места</h3>
              <div className="flex flex-wrap gap-2">
                {dream.places.map((p) => (
                  <Badge key={p} variant="secondary">{p}</Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {dream.personalNote && (
        <section className="rounded-xl border border-border bg-card/30 p-6 mb-8">
          <SectionHeader title="Личная заметка" />
          <p className="text-muted-foreground">{dream.personalNote}</p>
        </section>
      )}

      {dream.analysis && (
        <section className="rounded-xl border border-gold/20 bg-gradient-to-br from-burgundy/10 to-purple-deep/10 p-6 md:p-8 mb-8">
          <SectionHeader title="Толкование сна" description="Символическая интерпретация по описанию" />
          <p className="text-foreground leading-relaxed mb-6">{dream.analysis.summary}</p>

          {dream.analysis.symbolReadings && dream.analysis.symbolReadings.length > 0 && (
            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-medium text-gold mb-2">Найденные символы</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dream.analysis.symbolReadings.map((reading) => (
                  <div
                    key={reading.keyword}
                    className="rounded-xl border border-border/80 bg-card/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-gold/55">
                      {reading.keyword}
                    </p>
                    <p className="mt-1 font-serif text-lg text-gold-light">{reading.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {reading.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gold mb-2">Эмоции</h4>
              <div className="flex flex-wrap gap-2">
                {dream.analysis.emotions.map((e) => (
                  <Badge key={e} variant="outline">{e}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gold mb-2">Темы</h4>
              <div className="flex flex-wrap gap-2">
                {dream.analysis.themes.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gold mb-2">Вопросы для размышления</h4>
            <ul className="space-y-2">
              {dream.analysis.questions.map((q, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground text-sm">
                  <span className="text-gold shrink-0">✦</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {dream.analysis.disclaimer && (
            <p className="mt-6 text-xs text-muted-foreground/80 leading-relaxed">
              {dream.analysis.disclaimer}
            </p>
          )}
        </section>
      )}

      {symbolItems.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Символы в сне" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {symbolItems.map((s) => s && <SymbolCard key={s.id} symbol={s} />)}
          </div>
        </section>
      )}

      <Button variant="ghost" asChild>
        <Link href="/platform/dreams">← К дневнику</Link>
      </Button>

    </>
  );
}
