"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getMeAction } from "@/features/platform/actions";
import { mapMeToAppUser, isPremiumSubscription } from "@/lib/mappers/user";
import { useAppStore } from "@/store/useAppStore";

/**
 * Подтягивает профиль из БД в zustand после входа,
 * чтобы гороскоп / натал / интересы сразу были «своими».
 */
export function SessionProfileSync() {
  const { data: session, status } = useSession();
  const syncKey = useRef<string | null>(null);
  const updateUser = useAppStore((s) => s.updateUser);
  const setPremium = useAppStore((s) => s.setPremium);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (status === "unauthenticated") {
      syncKey.current = null;
      const localAuth = useAppStore.getState().isAuthenticated;
      if (localAuth) logout();
      return;
    }

    if (status !== "authenticated" || !session?.user?.id) return;

    const key = session.user.id;
    if (syncKey.current === key) return;
    syncKey.current = key;

    let cancelled = false;
    (async () => {
      try {
        const me = await getMeAction();
        if (cancelled || !me) return;
        const user = mapMeToAppUser(me);
        useAppStore.setState({
          user,
          isAuthenticated: true,
          isPremium: isPremiumSubscription(me.subscription),
        });
      } catch {
        // сессия есть, но getMe упал — хотя бы базовая отметка
        if (!cancelled) {
          useAppStore.setState({
            isAuthenticated: true,
            isPremium: Boolean(session.user.isPremium),
            user: {
              id: session.user.id,
              name: session.user.displayName || session.user.email || "Гость",
              email: session.user.email ?? "",
              level: 1,
              interests: [],
              direction: "platform",
              theme: "dark",
              onboardingComplete: Boolean(session.user.onboardingComplete),
            },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, session?.user?.displayName, session?.user?.email, session?.user?.isPremium, session?.user?.onboardingComplete, logout, updateUser, setPremium]);

  return null;
}
