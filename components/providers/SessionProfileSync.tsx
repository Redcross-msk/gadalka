"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getMeAction } from "@/features/platform/actions";
import { mapMeToAppUser, isPremiumSubscription } from "@/lib/mappers/user";
import { useAppStore } from "@/store/useAppStore";

const REFRESH_MS = 45_000;

/**
 * Держит zustand.isPremium в синхроне с подпиской в БД
 * (админ сменил план / оплата / истечение срока).
 */
export function SessionProfileSync() {
  const { data: session, status, update } = useSession();
  const logout = useAppStore((s) => s.logout);
  const lastUserId = useRef<string | null>(null);
  const inFlight = useRef(false);

  const syncFromDb = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const me = await getMeAction();
      if (!me) return;
      const premium = isPremiumSubscription(me.subscription);
      const user = mapMeToAppUser(me);
      useAppStore.setState({
        user,
        isAuthenticated: true,
        isPremium: premium,
      });
      if (Boolean(session.user.isPremium) !== premium) {
        await update({ isPremium: premium }).catch(() => undefined);
      }
    } catch {
      if (session.user) {
        useAppStore.setState({
          isAuthenticated: true,
          isPremium: Boolean(session.user.isPremium),
        });
      }
    } finally {
      inFlight.current = false;
    }
  }, [status, session?.user, update]);

  useEffect(() => {
    if (status === "unauthenticated") {
      lastUserId.current = null;
      if (useAppStore.getState().isAuthenticated) logout();
      return;
    }
    if (status !== "authenticated" || !session?.user?.id) return;

    const userChanged = lastUserId.current !== session.user.id;
    lastUserId.current = session.user.id;
    if (userChanged) {
      void syncFromDb();
    }
  }, [status, session?.user?.id, syncFromDb, logout]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const onVisible = () => {
      if (document.visibilityState === "visible") void syncFromDb();
    };
    const onFocus = () => void syncFromDb();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => void syncFromDb(), REFRESH_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [status, syncFromDb]);

  return null;
}
