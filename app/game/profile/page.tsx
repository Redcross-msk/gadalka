"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useIdleGameStore, useIdleHydrated } from "@/store/gameStore";
import { getRankLabel, formatGameNumber } from "@/game/formulas";
import { GeneratedSymbol } from "@/components/game/symbols/GeneratedSymbol";
import { Button } from "@/components/ui/button";

export default function GameProfilePage() {
  const hydrated = useIdleHydrated();
  const s = useIdleGameStore();

  if (!hydrated) return <div className="p-12 text-center">Загрузка…</div>;

  const profileSeed = s.profileSymbolSeed ?? s.collectedSymbols[0]?.seed;

  return (
    <div className="min-h-screen card-back-surface">
      <div className="mx-auto max-w-lg px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/game"><ArrowLeft className="h-4 w-4 mr-1" /> К кабинету</Link>
        </Button>
        <div className="rounded-2xl border border-gold/15 bg-card/30 p-8 text-center">
          {profileSeed ? (
            <GeneratedSymbol seed={profileSeed} size={96} className="mx-auto" />
          ) : (
            <div className="h-24 w-24 mx-auto rounded-full border border-gold/20" />
          )}
          <h1 className="font-serif text-2xl mt-4">{s.displayName}</h1>
          <p className="text-muted-foreground">{getRankLabel(s.level)} · уровень {s.level}</p>
          <p className="text-xs text-gold/60 mt-1">{s.currentRoom === "archive" ? "Комната: Архив" : "Комната: Кабинет"}</p>

          <div className="grid grid-cols-2 gap-3 mt-6 text-left text-sm">
            <Stat label="Клики" value={formatGameNumber(s.totalClicks)} />
            <Stat label="Энергия всего" value={formatGameNumber(s.totalEnergyEarned)} />
            <Stat label="Обращения" value={String(s.completedRequests)} />
            <Stat label="Карты" value={String(s.collectedCards.length)} />
            <Stat label="Знаки" value={String(s.collectedSymbols.length)} />
            <Stat label="Печати" value={String(s.archiveSeals)} />
            <Stat label="Макс. комбо" value={String(s.maxClickCombo)} />
            <Stat label="Серия входов" value={`${s.loginStreak} дн.`} />
          </div>

          {s.collectedSymbols.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-2">Знак профиля</p>
              <div className="flex flex-wrap justify-center gap-2">
                {s.collectedSymbols.slice(0, 8).map((sym) => (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => s.setProfileSymbol(sym.seed)}
                    className={`rounded-lg border p-1 ${s.profileSymbolSeed === sym.seed ? "border-gold" : "border-border"}`}
                  >
                    <GeneratedSymbol seed={sym.seed} size={36} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/platform/subscription" className="text-gold/80 hover:text-gold">Гадалка+ · демо-бонусы</Link>
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-serif">{value}</p>
    </div>
  );
}
