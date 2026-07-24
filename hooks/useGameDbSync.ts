"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useIdleGameStore } from "@/store/gameStore";
import { loadGameProgressAction, saveGameProgressAction } from "@/features/game/actions";
import { migrateSave } from "@/game/storage/migration";

function snapshotGameState(): Record<string, unknown> {
  const s = useIdleGameStore.getState() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(s)) {
    if (key.startsWith("_")) continue;
    if (typeof value === "function") continue;
    out[key] = value;
  }
  return out;
}

/**
 * Синхронизация idle-сейва с PostgreSQL.
 */
export function useGameDbSync(hydrated: boolean) {
  const { status } = useSession();
  const loadedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hydrated || status !== "authenticated" || loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      try {
        const { save } = await loadGameProgressAction();
        if (!save?.state || typeof save.state !== "object") return;

        const remote = migrateSave(save.state as Record<string, unknown>);
        const local = useIdleGameStore.getState();
        const remoteWins =
          remote.level > local.level ||
          (remote.level === local.level && remote.energy > local.energy + 1);

        if (remoteWins) {
          useIdleGameStore.setState({
            ...remote,
            _hasHydrated: true,
          });
        }
      } catch {
        // офлайн — localStorage
      }
    })();
  }, [hydrated, status]);

  useEffect(() => {
    if (!hydrated || status !== "authenticated") return;

    const push = () => {
      const s = useIdleGameStore.getState();
      void saveGameProgressAction({
        level: s.level,
        energy: s.energy,
        prestigeCount: s.prestigeLevel ?? 0,
        tarotCenterLevel: s.tarotCenterLevel ?? 0,
        loginStreak: s.loginStreak ?? 1,
        state: snapshotGameState(),
        achievements: (s.achievements ?? [])
          .filter((a) => a.completed)
          .map((a) => ({
            achievementId: a.id,
            claimed: Boolean(a.claimed),
          })),
      }).catch(() => undefined);
    };

    timerRef.current = setInterval(push, 20000);
    const onHide = () => {
      if (document.visibilityState === "hidden") push();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", push);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", push);
      push();
    };
  }, [hydrated, status]);
}
