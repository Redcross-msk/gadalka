"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useFreeSpreadCooldown() {
  const isPremium = useAppStore((s) => s.isPremium);
  const canDoFreeSpread = useAppStore((s) => s.canDoFreeSpread);
  const getFreeSpreadCooldownMs = useAppStore((s) => s.getFreeSpreadCooldownMs);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => setRemaining(getFreeSpreadCooldownMs());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [getFreeSpreadCooldownMs]);

  const available = isPremium || canDoFreeSpread();

  return { isPremium, available, remaining };
}
