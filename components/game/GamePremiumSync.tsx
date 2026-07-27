"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useIdleGameStore } from "@/store/gameStore";
import { useHydration } from "@/hooks/useHydration";

/**
 * Подписка Гадалка+ из платформы → премиум-функции idle-игры на всех устройствах.
 */
export function GamePremiumSync() {
  const hydrated = useHydration();
  const isPremium = useAppStore((s) => s.isPremium);

  useEffect(() => {
    if (!hydrated) return;
    useIdleGameStore.setState({ isPremiumDemo: isPremium });
  }, [hydrated, isPremium]);

  return null;
}
