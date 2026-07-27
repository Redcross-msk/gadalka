import type { Metadata } from "next";
import { requireUser } from "@/lib/require-user";
import { GameShell } from "@/components/game/GameShell";

export const metadata: Metadata = {
  title: "Кабинет Гадалки",
  description: "Idle-игра Архива Гадалки — развивайте кабинет, собирайте карты и знаки",
};

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/game");
  return <GameShell>{children}</GameShell>;
}
