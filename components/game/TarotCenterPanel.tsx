"use client";

import { useEffect, useState, useTransition } from "react";
import { useIdleGameStore } from "@/store/gameStore";
import {
  TAROT_CENTERS,
  MAX_TAROT_CENTER,
  getNextTarotCenter,
  getTarotCenterBonuses,
} from "@/game/data/tarotCenters";
import { formatGameNumber } from "@/game/formulas";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ensureTarotCenterPromosAction,
  grantTarotCenterPromoAction,
  listMyShopPromosAction,
} from "@/features/shop/actions";

export function TarotCenterPanel() {
  const energy = useIdleGameStore((s) => s.energy);
  const level = useIdleGameStore((s) => s.tarotCenterLevel ?? 0);
  const unlockTarotCenter = useIdleGameStore((s) => s.unlockTarotCenter);
  const [promos, setPromos] = useState<Array<{ code: string; percent: number; source: string | null }>>(
    []
  );
  const [pending, startTransition] = useTransition();
  const next = getNextTarotCenter(level);
  const bonuses = getTarotCenterBonuses(level);
  const maxed = level >= MAX_TAROT_CENTER;
  const canBuy = !!next && energy >= next.cost;
  const progressToNext = next ? Math.min(100, (energy / next.cost) * 100) : 100;

  useEffect(() => {
    if (level < 1) return;
    let cancelled = false;
    (async () => {
      try {
        await ensureTarotCenterPromosAction(level);
        const list = await listMyShopPromosAction();
        if (!cancelled) setPromos(list);
      } catch {
        /* не авторизован / офлайн */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [level]);

  const onUnlock = () => {
    const ok = unlockTarotCenter();
    if (!ok) return;
    const newLevel = useIdleGameStore.getState().tarotCenterLevel ?? 0;
    startTransition(async () => {
      try {
        const res = await grantTarotCenterPromoAction(newLevel);
        if (res.ok) {
          useIdleGameStore.setState((s) => ({
            pendingReveal: s.pendingReveal
              ? {
                  ...s.pendingReveal,
                  description: `${s.pendingReveal.description} Промокод в магазин: ${res.code} (−${res.percent}%).`,
                }
              : s.pendingReveal,
          }));
          const list = await listMyShopPromosAction();
          setPromos(list);
        }
      } catch {
        /* ignore */
      }
    });
  };

  return (
    <section className="glass-card rounded-2xl border border-gold/15 p-3.5 sm:p-4 md:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.22em] uppercase text-gold/60">Долгосрочная цель</p>
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl mt-1 text-cream leading-tight">
            Открытие Таро-центра
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
            Накопите энергию и откройте до пяти Таро-центров. Каждый даёт множители и промокод на скидку
            в магазине (1%…5%).
          </p>
          {level > 0 && (
            <p className="text-[11px] sm:text-xs text-gold/80 mt-2">
              Сейчас: центр {level}/{MAX_TAROT_CENTER} · клик ×{bonuses.clickMult.toFixed(1)} · авто ×
              {bonuses.passiveMult.toFixed(1)}
            </p>
          )}
        </div>

        {!maxed && next ? (
          <div className="shrink-0 text-left sm:text-right w-full sm:w-auto">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Следующий</p>
            <p className="font-serif text-base sm:text-lg text-gold">{next.name}</p>
            <p className="text-sm text-cream mt-1">{formatGameNumber(next.cost)} энергии</p>
            <p className="text-[10px] text-gold/70 mt-1">+ промокод −{next.level}%</p>
            <Button
              className="mt-3 w-full sm:w-auto min-w-[160px]"
              disabled={!canBuy || pending}
              onClick={onUnlock}
            >
              {canBuy ? "Открыть центр" : "Недостаточно"}
            </Button>
          </div>
        ) : (
          <div className="shrink-0 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center">
            <p className="font-serif text-gold">Все 5 центров открыты</p>
            <p className="text-xs text-muted-foreground mt-1">Максимум скидки: 5%</p>
          </div>
        )}
      </div>

      {!maxed && next && (
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1 gap-2">
            <span className="truncate">Прогресс к {next.name}</span>
            <span className="shrink-0 tabular-nums">
              {formatGameNumber(energy)} / {formatGameNumber(next.cost)}
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-1.5 hidden sm:block">
            Бонус центра: клик ×{next.clickMult} · авто ×{next.passiveMult}
          </p>
        </div>
      )}

      <div className="mt-4 sm:mt-5 -mx-1 px-1 overflow-x-auto scrollbar-hide">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 min-w-[280px]">
          {TAROT_CENTERS.map((tier) => {
            const opened = level >= tier.level;
            const isNext = next?.level === tier.level;
            const promo = promos.find((p) => p.source === `tarot_center:${tier.level}`);
            return (
              <div
                key={tier.level}
                className={cn(
                  "rounded-lg border p-1.5 sm:p-3 text-center transition-colors min-w-0",
                  opened
                    ? "border-gold/40 bg-gold/10"
                    : isNext
                      ? "border-gold/25 bg-card/40"
                      : "border-border/40 bg-black/20 opacity-60"
                )}
                title={
                  promo
                    ? `${tier.name}: ${promo.code} (−${promo.percent}%)`
                    : `${tier.name}: ${formatGameNumber(tier.cost)}`
                }
              >
                <div className="mx-auto mb-1 sm:mb-1.5 flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center">
                  <TarotGlyph level={tier.level} active={opened} />
                </div>
                <p className="text-[8px] sm:text-[10px] font-serif text-cream/90 leading-tight truncate">
                  {tier.name.replace("Таро-центр ", "")}
                </p>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground mt-0.5 truncate">
                  {opened ? `−${tier.level}%` : formatGameNumber(tier.cost)}
                </p>
                {promo && (
                  <p className="mt-0.5 hidden sm:block text-[8px] font-mono text-gold/80 truncate">
                    {promo.code}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {promos.length > 0 && (
        <div className="mt-4 rounded-xl border border-gold/15 bg-black/20 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-gold/70">Ваши промокоды магазина</p>
          <ul className="space-y-1.5">
            {promos.map((p) => (
              <li
                key={p.code}
                className="flex items-center justify-between gap-2 text-xs sm:text-sm"
              >
                <code className="font-mono text-gold tracking-wide truncate">{p.code}</code>
                <span className="shrink-0 text-muted-foreground">−{p.percent}%</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground">
            Введите код в корзине магазина. Максимум скидки — 5% (все центры).
          </p>
        </div>
      )}
    </section>
  );
}

function TarotGlyph({ level, active }: { level: number; active: boolean }) {
  const opacity = active ? 0.95 : 0.35;
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden>
      <rect
        x="8"
        y="4"
        width="24"
        height="32"
        rx="2"
        fill="none"
        stroke="#d8bc78"
        strokeWidth="1.2"
        opacity={opacity}
      />
      <circle cx="20" cy="18" r={4 + level * 0.6} fill="none" stroke="#d8bc78" strokeWidth="0.9" opacity={opacity} />
      {level >= 3 && (
        <line x1="20" y1="10" x2="20" y2="26" stroke="#d8bc78" strokeWidth="0.7" opacity={opacity * 0.8} />
      )}
      {level >= 5 && (
        <circle cx="20" cy="18" r="10" fill="none" stroke="#d8bc78" strokeWidth="0.5" opacity={opacity * 0.5} />
      )}
    </svg>
  );
}
