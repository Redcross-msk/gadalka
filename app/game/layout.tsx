import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Кабинет Гадалки",
  description: "Idle-игра Архива Гадалки — развивайте кабинет, собирайте карты и знаки",
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
