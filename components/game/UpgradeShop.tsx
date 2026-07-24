"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { useIdleGameStore } from "@/store/gameStore";
import { GAME_OBJECTS, getObjectDef } from "@/game/data/objects";
import { calculateUpgradeCost, formatGameNumber } from "@/game/formulas";
import { canUnlockObject } from "@/game/engine/economy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GameBook,
  GameCandle,
  GameDeck,
  GameMirror,
  GameClock,
  DreamBook,
  ArchiveCabinet,
  VisitorDoor,
  GameWindow,
} from "@/components/game/objects/GameObjects";

function UpgradeIcon({ id, level, locked }: { id: string; level: number; locked: boolean }) {
  const props = { level, locked, className: "w-10 h-10" };
  switch (id) {
    case "sign_book":
      return <GameBook {...props} />;
    case "candle":
      return <GameCandle {...props} />;
    case "deck":
      return <GameDeck {...props} />;
    case "mirror":
      return <GameMirror {...props} />;
    case "clock":
      return <GameClock {...props} />;
    case "dream_book":
      return <DreamBook {...props} />;
    case "cabinet":
      return <ArchiveCabinet {...props} />;
    case "door":
      return <VisitorDoor {...props} />;
    case "window":
      return <GameWindow {...props} />;
    case "premium_flame":
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden>
          <path d="M20 6 C14 16 10 18 10 26 a10 10 0 0 0 20 0 C30 18 26 14 20 6 Z" fill="none" stroke="#d8bc78" strokeWidth="1.2" opacity={locked ? 0.35 : 0.9} />
        </svg>
      );
    case "premium_seal":
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden>
          <circle cx="20" cy="18" r="10" fill="none" stroke="#d8bc78" strokeWidth="1.2" opacity={locked ? 0.35 : 0.9} />
          <path d="M14 28 L20 34 L26 28" fill="none" stroke="#d8bc78" strokeWidth="1" opacity={locked ? 0.3 : 0.7} />
        </svg>
      );
    case "premium_veil":
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden>
          <path d="M8 12 Q20 6 32 12 L30 30 Q20 36 10 30 Z" fill="none" stroke="#d8bc78" strokeWidth="1.1" opacity={locked ? 0.35 : 0.9} />
        </svg>
      );
    default:
      return <div className="w-10 h-10 rounded-lg border border-gold/20" />;
  }
}

function effectPreview(objId: string, level: number): string {
  const next = level + 1;
  if (objId === "sign_book") {
    const cur = 1 + Math.max(0, level - 1) * 0.55;
    const nxt = 1 + Math.max(0, next - 1) * 0.55;
    return `клик ×${cur.toFixed(2)} → ×${nxt.toFixed(2)}`;
  }
  if (objId === "deck") {
    return `клик +${(level * 12).toFixed(0)}% → +${(next * 12).toFixed(0)}%`;
  }
  if (objId === "candle") {
    const cur = level > 0 ? 1 + (level - 1) * 0.85 : 0;
    const nxt = 1 + (next - 1) * 0.85;
    return `${cur.toFixed(1)}/с → ${nxt.toFixed(1)}/с`;
  }
  return `ур. ${level} → ${next}`;
}

export function UpgradeShop() {
  const energy = useIdleGameStore((s) => s.energy);
  const objectLevels = useIdleGameStore((s) => s.objectLevels);
  const unlocked = useIdleGameStore((s) => s.unlockedObjects);
  const isPremiumDemo = useIdleGameStore((s) => s.isPremiumDemo);
  const buyUpgrade = useIdleGameStore((s) => s.buyUpgrade);
  const unlockObject = useIdleGameStore((s) => s.unlockObject);
  const state = useIdleGameStore();

  const regular = GAME_OBJECTS.filter((o) => !o.premiumOnly);
  const premium = GAME_OBJECTS.filter((o) => o.premiumOnly);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {regular.map((obj) => (
          <UpgradeCard
            key={obj.id}
            obj={obj}
            level={objectLevels[obj.id] ?? 0}
            isOpen={unlocked.includes(obj.id)}
            energy={energy}
            canOpen={canUnlockObject(state, obj.id)}
            onBuy={(n) => buyUpgrade(obj.id, n)}
            onUnlock={() => unlockObject(obj.id)}
          />
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg text-gold/90">Гадалка+</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {premium.map((obj) => {
            const isOpen = unlocked.includes(obj.id);
            const level = objectLevels[obj.id] ?? 0;
            if (!isPremiumDemo && !isOpen) {
              return (
                <div
                  key={obj.id}
                  className="glass-card rounded-xl border border-gold/20 p-4 relative overflow-hidden"
                >
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0 rounded-lg bg-black/20 p-1.5 opacity-50">
                      <UpgradeIcon id={obj.id} level={1} locked />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm flex items-center gap-1.5">
                        {obj.name}
                        <Crown className="h-3 w-3 text-gold" />
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{obj.description}</p>
                      <Button size="sm" className="mt-3 h-8 text-xs w-full" asChild>
                        <Link href="/platform/subscription">Открыть с подпиской</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <UpgradeCard
                key={obj.id}
                obj={obj}
                level={level}
                isOpen={isOpen}
                energy={energy}
                canOpen={canUnlockObject(state, obj.id)}
                onBuy={(n) => buyUpgrade(obj.id, n)}
                onUnlock={() => unlockObject(obj.id)}
                premium
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UpgradeCard({
  obj,
  level,
  isOpen,
  energy,
  canOpen,
  onBuy,
  onUnlock,
  premium,
}: {
  obj: (typeof GAME_OBJECTS)[number];
  level: number;
  isOpen: boolean;
  energy: number;
  canOpen: boolean;
  onBuy: (n: 1 | 5 | "max") => void;
  onUnlock: () => void;
  premium?: boolean;
}) {
  const cost = isOpen
    ? calculateUpgradeCost(obj.baseCost, obj.costGrowth, level)
    : obj.unlockCost;
  const canBuy = isOpen && energy >= cost && level < obj.maxLevel;
  const nextMilestone = obj.milestones.find((m) => m > level) ?? obj.maxLevel;
  const prevMilestone = [...obj.milestones].reverse().find((m) => m <= level) ?? 1;
  const progress = ((level - prevMilestone) / Math.max(1, nextMilestone - prevMilestone)) * 100;

  return (
    <div
      className={cn(
        "glass-card rounded-xl border p-4 transition-colors",
        isOpen ? "border-gold/20 hover:border-gold/35" : "border-border/40",
        premium && "border-gold/25"
      )}
    >
      <div className="flex gap-3">
        <div className="shrink-0 rounded-lg bg-black/25 p-1.5 border border-gold/10">
          <UpgradeIcon id={obj.id} level={Math.max(1, level)} locked={!isOpen} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-serif text-sm text-cream">{obj.name}</p>
            {isOpen && (
              <span className="text-[10px] text-gold/70 shrink-0">ур. {level}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{obj.description}</p>
          {obj.effectLabel && (
            <span className="inline-block mt-1.5 text-[9px] tracking-wide uppercase text-gold/60 border border-gold/15 rounded-full px-2 py-0.5">
              {obj.effectLabel}
            </span>
          )}
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="mt-3 h-1 rounded-full bg-black/30 overflow-hidden">
            <div className="h-full bg-gold/50" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {effectPreview(obj.id, level)} · {formatGameNumber(cost)}
          </p>
          <div className="flex gap-1.5 mt-2">
            <Button size="sm" disabled={!canBuy} onClick={() => onBuy(1)} className="flex-1 h-8 text-xs">
              +1
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={level >= obj.maxLevel || energy < cost}
              onClick={() => onBuy(5)}
              className="flex-1 h-8 text-xs"
            >
              +5
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={level >= obj.maxLevel || energy < cost}
              onClick={() => onBuy("max")}
              className="flex-1 h-8 text-xs"
            >
              MAX
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <p className="text-[11px] text-muted-foreground">
            {obj.premiumOnly
              ? "Открывается с подпиской"
              : `Открытие: ${formatGameNumber(obj.unlockCost)}`}
            {obj.unlockRequirement.objectId &&
              ` · ${getObjectDef(obj.unlockRequirement.objectId)?.name}`}
          </p>
          <Button size="sm" className="mt-2 w-full h-8 text-xs" disabled={!canOpen} onClick={onUnlock}>
            Открыть
          </Button>
        </div>
      )}
    </div>
  );
}
