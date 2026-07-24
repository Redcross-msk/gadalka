"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useIdleGameStore, useIdleHydrated } from "@/store/gameStore";
import { GAME_CARDS, getCardDef } from "@/game/data/cards";
import { GameCardFace } from "@/components/game/cards/GameCardViews";
import { GeneratedSymbol } from "@/components/game/symbols/GeneratedSymbol";
import { FAMILY_LABELS } from "@/game/generators/symbols";
import { copiesNeededForNextLevel } from "@/game/formulas";
import { Button } from "@/components/ui/button";
import { GAME_OBJECTS } from "@/game/data/objects";

export default function CollectionPage() {
  const hydrated = useIdleHydrated();
  const { collectedCards, collectedSymbols, unlockedObjects, upgradeCard } = useIdleGameStore();
  const [tab, setTab] = useState<"cards" | "symbols" | "objects">("cards");

  if (!hydrated) return <div className="p-12 text-center text-muted-foreground">Загрузка…</div>;

  return (
    <div className="min-h-screen card-back-surface">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/game"><ArrowLeft className="h-4 w-4 mr-1" /> К кабинету</Link>
        </Button>
        <h1 className="font-serif text-3xl">Коллекция</h1>

        <div className="flex gap-2 mt-4 mb-6">
          {(["cards", "symbols", "objects"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-2 text-sm ${tab === t ? "border-gold/40 text-gold bg-gold/10" : "border-border text-muted-foreground"}`}
            >
              {t === "cards" ? "Карты" : t === "symbols" ? "Знаки" : "Предметы"}
            </button>
          ))}
        </div>

        {tab === "cards" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GAME_CARDS.map((card) => {
              const owned = collectedCards.find((c) => c.id === card.id);
              if (!owned) {
                return (
                  <div key={card.id} className="rounded-xl border border-border/40 bg-card/10 p-4 opacity-40 text-center">
                    <div className="h-32 border border-dashed border-gold/20 rounded-lg" />
                    <p className="font-serif mt-2 text-sm">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground">Не получена</p>
                  </div>
                );
              }
              const need = copiesNeededForNextLevel(owned.level);
              return (
                <div key={card.id} className="rounded-xl border border-gold/15 bg-card/30 p-3 text-center">
                  <GameCardFace cardId={card.id} compact className="mx-auto" />
                  <p className="text-xs mt-2">ур. {owned.level}/5 · копии {owned.copies}{need ? `/${need}` : ""}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{getCardDef(card.id)?.description}</p>
                  {owned.level < 5 && (
                    <Button size="sm" className="mt-2 h-8 text-xs" disabled={owned.copies < need} onClick={() => upgradeCard(card.id)}>
                      Повысить уровень
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "symbols" && (
          collectedSymbols.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Знаки появятся из обращений и событий</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {collectedSymbols.map((s) => (
                <div key={s.id} className="rounded-xl border border-gold/15 bg-card/30 p-4 text-center">
                  <GeneratedSymbol seed={s.seed} size={72} className="mx-auto" />
                  <p className="font-serif text-sm mt-2">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{FAMILY_LABELS[s.family]} · {s.rarity}</p>
                  <p className="text-[10px] text-gold/70 mt-1">+{(s.bonusValue * 100).toFixed(1)}% {s.passiveBonus}</p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "objects" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {GAME_OBJECTS.map((o) => (
              <div key={o.id} className={`rounded-xl border p-4 ${unlockedObjects.includes(o.id) ? "border-gold/15 bg-card/30" : "border-border/40 opacity-50"}`}>
                <p className="font-serif">{o.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{o.description}</p>
                <p className="text-[10px] text-gold/70 mt-2">
                  {unlockedObjects.includes(o.id) ? "Открыт" : "Закрыт"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
