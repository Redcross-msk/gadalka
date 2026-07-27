"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { useIdleGameStore, useIdleHydrated } from "@/store/gameStore";
import { CabinetScene } from "@/components/game/CabinetScene";
import { UpgradeShop } from "@/components/game/UpgradeShop";
import { TarotCenterPanel } from "@/components/game/TarotCenterPanel";
import { formatGameNumber, getRankLabel } from "@/game/formulas";
import { Button } from "@/components/ui/button";
import { GameCardFace, GameCardBack } from "@/components/game/cards/GameCardViews";
import { GeneratedSymbol } from "@/components/game/symbols/GeneratedSymbol";
import { ScrollAtmosphere } from "@/components/platform/ScrollAtmosphere";
import { DeckBackButton } from "@/components/layout/DeckBackButton";
import { useGameDbSync } from "@/hooks/useGameDbSync";
import { cn } from "@/lib/utils";

export function IdleGameScreen() {
  const hydrated = useIdleHydrated();
  const store = useIdleGameStore();
  const [showPrestige, setShowPrestige] = useState(false);
  const [now, setNow] = useState(Date.now());

  useGameDbSync(hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const t = setInterval(() => {
      useIdleGameStore.getState().tickSecond();
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
        e.preventDefault();
        store.clickBook();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  if (!hydrated) {
    return (
      <div className="min-h-screen card-back-surface flex items-center justify-center text-muted-foreground">
        Открытие кабинета…
      </div>
    );
  }

  const epc = store.getEnergyPerClick();
  const eps = store.getEnergyPerSecond();
  const prestigeCheck = store.openPrestige();

  return (
    <div
      className={cn(
        "relative min-h-dvh min-w-0 overflow-x-clip card-back-surface text-cream game-touch-lock",
        "select-none [-webkit-user-select:none] [-webkit-touch-callout:none]"
      )}
      onContextMenu={(e) => {
        // Не мешаем полям ввода, если появятся; блокируем выделение на игровом экране
        const t = e.target as HTMLElement;
        if (t.closest("input, textarea, a, button")) return;
        e.preventDefault();
      }}
    >
      <ScrollAtmosphere />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-5 sm:py-6 lg:px-10 lg:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-2">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.22em] uppercase text-gold/60">Игра</p>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl mt-1 leading-tight">
              Кабинет Гадалки
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              {getRankLabel(store.level)} · ур. {store.level} · серия {store.loginStreak} дн.
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <DeckBackButton compact />
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/platform/subscription">
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                Гадалка+
              </Link>
            </Button>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3 sm:mb-6">
          <Stat label="Энергия" value={formatGameNumber(store.energy)} highlight />
          <Stat label="За клик" value={`+${formatGameNumber(epc)}`} />
          <Stat label="В секунду" value={`+${formatGameNumber(eps)}`} />
        </div>

        {/* Комбо перенесено в оверлей на книге — здесь только бонусы */}
        {store.activeBonuses.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-3 sm:mb-4 min-h-0">
            {store.activeBonuses.map((b) => (
              <span
                key={b.id}
                className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] text-gold"
              >
                {b.label} · {Math.max(0, Math.ceil((b.endsAt - now) / 1000))}с
              </span>
            ))}
          </div>
        )}

        {/* Book only */}
        <CabinetScene />

        {/* Tarot centers — long-term goal */}
        <TarotCenterPanel />

        {/* Upgrades below */}
        <section className="section-mobile">
          <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
            <div className="min-w-0">
              <h2 className="font-serif text-lg sm:text-xl tracking-wide text-gold/90">Улучшения</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                Книга усиливает клик · свеча даёт автодоход
              </p>
            </div>
            <Button
              size="sm"
              variant={prestigeCheck.ok ? "default" : "outline"}
              disabled={!prestigeCheck.ok}
              onClick={() => setShowPrestige(true)}
              className="shrink-0 text-xs sm:text-sm"
            >
              Новая глава
            </Button>
          </div>
          <UpgradeShop />
        </section>

        <p className="mt-8 sm:mt-10 text-center text-[10px] text-muted-foreground/60 leading-relaxed px-2">
          Игра является развлекательным продуктом. Игровые карты, знаки и обращения не являются
          реальными предсказаниями или профессиональными рекомендациями.
        </p>
      </div>

      {store.offline.pending && (
        <Modal onClose={() => store.claimOffline()}>
          <h3 className="font-serif text-xl">Пока вас не было</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Кабинет накопил {formatGameNumber(store.offline.amount)} энергии (
            {Math.floor(store.offline.secondsAway / 60)} мин.)
          </p>
          <Button className="mt-4 w-full" onClick={() => store.claimOffline()}>
            Забрать
          </Button>
        </Modal>
      )}

      {store.pendingReveal && (
        <Modal onClose={() => store.dismissReveal()}>
          {store.pendingReveal.type === "card" && store.pendingReveal.cardId && (
            <div className="flex flex-col items-center gap-4">
              <GameCardBack />
              <GameCardFace cardId={store.pendingReveal.cardId} />
              <p className="font-serif text-lg">{store.pendingReveal.title}</p>
            </div>
          )}
          {store.pendingReveal.type === "symbol" && store.pendingReveal.symbol && (
            <div className="flex flex-col items-center gap-3">
              <GeneratedSymbol seed={store.pendingReveal.symbol.seed} size={96} animate />
              <p className="font-serif text-lg">{store.pendingReveal.title}</p>
            </div>
          )}
          {store.pendingReveal.type === "reward" && (
            <div className="text-center">
              <p className="font-serif text-xl">{store.pendingReveal.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{store.pendingReveal.description}</p>
            </div>
          )}
          <Button className="mt-4 w-full" onClick={() => store.dismissReveal()}>
            Продолжить
          </Button>
        </Modal>
      )}

      {showPrestige && (
        <Modal onClose={() => setShowPrestige(false)}>
          <h3 className="font-serif text-xl">Новая глава архива</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Сбросятся энергия и уровни предметов. Сохранятся карты, знаки, достижения и Печати.
          </p>
          <p className="text-sm text-gold mt-2">Награда: Печать архива (+12% ко всему доходу).</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowPrestige(false)}>
              Отмена
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                store.confirmPrestige();
                setShowPrestige(false);
              }}
            >
              Открыть
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="glass-card rounded-xl border border-gold/10 px-1.5 py-2.5 sm:px-3 sm:py-3 text-center min-w-0">
      <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground truncate">
        {label}
      </p>
      <p
        className={`font-serif text-sm sm:text-lg mt-0.5 tabular-nums truncate ${
          highlight ? "text-gold" : "text-cream"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70">
      <button type="button" className="absolute inset-0" aria-label="Закрыть" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-gold/20 bg-[#302a30] p-5 sm:p-6 shadow-2xl max-h-[85dvh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
