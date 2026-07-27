"use client";

import { GamePremiumSync } from "@/components/game/GamePremiumSync";

/** Обёртка layout игры: синхронизация премиума на всех страницах /game/* */
export function GameShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GamePremiumSync />
      {children}
    </>
  );
}
