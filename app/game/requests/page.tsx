"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useIdleGameStore, useIdleHydrated } from "@/store/gameStore";
import { TOOL_LABELS, getRequestDef } from "@/game/data/requests";
import { requestSlots } from "@/game/engine/economy";
import { Button } from "@/components/ui/button";
import type { RequestTool } from "@/types/game";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const hydrated = useIdleHydrated();
  const store = useIdleGameStore();
  const [toolPick, setToolPick] = useState<Record<string, RequestTool>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!hydrated) return <div className="p-12 text-center">Загрузка…</div>;

  const available = store.getAvailableRequests();
  const active = store.activeRequests.filter((r) => !r.claimed);
  const done = store.activeRequests.filter((r) => r.claimed).slice(-10);

  return (
    <div className="min-h-screen card-back-surface">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/game"><ArrowLeft className="h-4 w-4 mr-1" /> К кабинету</Link>
        </Button>
        <h1 className="font-serif text-3xl">Обращения</h1>
        <p className="text-sm text-muted-foreground mt-1">Слоты: {active.length}/{requestSlots(store)}</p>

        <h2 className="font-serif text-lg mt-8 mb-3">Активные</h2>
        {active.length === 0 && <p className="text-sm text-muted-foreground">Нет активных обращений</p>}
        {active.map((r) => {
          const def = getRequestDef(r.requestId);
          const ready = now >= r.completesAt;
          return (
            <div key={r.instanceId} className="rounded-xl border border-gold/15 bg-card/30 p-4 mb-3">
              <p className="font-serif">{def?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{def?.situation}</p>
              <p className="text-xs text-gold/70 mt-2">
                {TOOL_LABELS[r.selectedTool]} · {ready ? "Готово" : `${Math.ceil((r.completesAt - now) / 1000)}с`}
              </p>
              {ready && (
                <Button className="mt-3" size="sm" onClick={() => store.claimRequest(r.instanceId)}>
                  Получить результат
                </Button>
              )}
            </div>
          );
        })}

        <h2 className="font-serif text-lg mt-8 mb-3">Доступные</h2>
        {available.map((req) => (
          <div key={req.id} className="rounded-xl border border-border/50 bg-card/20 p-4 mb-3">
            <p className="font-serif">{req.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{req.situation}</p>
            <p className="text-[10px] text-muted-foreground mt-2">Длительность {req.durationSec}с · награда ~{req.baseReward}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[req.bestTool, ...req.okTools].filter((v, i, a) => a.indexOf(v) === i).map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => setToolPick((p) => ({ ...p, [req.id]: tool }))}
                  className={cn(
                    "rounded-lg border px-2 py-1 text-xs",
                    (toolPick[req.id] ?? req.bestTool) === tool ? "border-gold/40 text-gold" : "border-border text-muted-foreground"
                  )}
                >
                  {TOOL_LABELS[tool]}{tool === req.bestTool ? " ★" : ""}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              className="mt-3"
              disabled={active.length >= requestSlots(store)}
              onClick={() => store.startRequest(req.id, toolPick[req.id] ?? req.bestTool)}
            >
              Принять
            </Button>
          </div>
        ))}

        {done.length > 0 && (
          <>
            <h2 className="font-serif text-lg mt-8 mb-3">Завершённые</h2>
            {done.map((r) => (
              <p key={r.instanceId} className="text-sm text-muted-foreground mb-1">
                {getRequestDef(r.requestId)?.name} — завершено
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
