"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useIdleGameStore, useIdleHydrated } from "@/store/gameStore";
import { DAILY_TASK_POOL, ACHIEVEMENTS } from "@/game/data/achievements";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function TasksPage() {
  const hydrated = useIdleHydrated();
  const { dailyTasks, achievements, claimDaily, claimAchievement } = useIdleGameStore();
  const [tab, setTab] = useState<"today" | "achievements">("today");

  if (!hydrated) return <div className="p-12 text-center">Загрузка…</div>;

  return (
    <div className="min-h-screen card-back-surface">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/game"><ArrowLeft className="h-4 w-4 mr-1" /> К кабинету</Link>
        </Button>
        <h1 className="font-serif text-3xl">Задания</h1>

        <div className="flex gap-2 mt-4 mb-6">
          <button type="button" onClick={() => setTab("today")} className={`rounded-full border px-4 py-2 text-sm ${tab === "today" ? "border-gold/40 text-gold bg-gold/10" : "border-border text-muted-foreground"}`}>Сегодня</button>
          <button type="button" onClick={() => setTab("achievements")} className={`rounded-full border px-4 py-2 text-sm ${tab === "achievements" ? "border-gold/40 text-gold bg-gold/10" : "border-border text-muted-foreground"}`}>Достижения</button>
        </div>

        {tab === "today" && dailyTasks.map((t) => {
          const def = DAILY_TASK_POOL.find((d) => d.id === t.id);
          if (!def) return null;
          return (
            <div key={t.id} className="rounded-xl border border-border/50 bg-card/20 p-4 mb-3">
              <div className="flex justify-between">
                <p className="font-serif">{def.title}</p>
                <span className="text-xs text-muted-foreground">{t.current} / {def.target}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{def.description}</p>
              <Progress value={(t.current / def.target) * 100} className="h-1.5 mt-3" />
              {t.completed && !t.claimed && (
                <Button size="sm" className="mt-3" onClick={() => claimDaily(t.id)}>Забрать награду</Button>
              )}
              {t.claimed && <p className="text-xs text-gold/70 mt-2">Получено</p>}
            </div>
          );
        })}

        {tab === "achievements" && achievements.map((a) => {
          const def = ACHIEVEMENTS.find((d) => d.id === a.id);
          if (!def) return null;
          return (
            <div key={a.id} className="rounded-xl border border-border/50 bg-card/20 p-4 mb-3">
              <div className="flex justify-between">
                <p className="font-serif">{def.title}</p>
                <span className="text-xs text-muted-foreground">{a.current} / {def.target}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{def.description}</p>
              <Progress value={(a.current / def.target) * 100} className="h-1.5 mt-3" />
              {a.completed && !a.claimed && (
                <Button size="sm" className="mt-3" onClick={() => claimAchievement(a.id)}>Забрать</Button>
              )}
              {a.claimed && <p className="text-xs text-gold/70 mt-2">Получено</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
