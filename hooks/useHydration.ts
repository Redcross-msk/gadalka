"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useHydration() {
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && hasHydrated;
}

export function useAuth() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const isPremium = useAppStore((s) => s.isPremium);
  const hydrated = useHydration();

  return { isAuthenticated, user, isPremium, hydrated };
}
