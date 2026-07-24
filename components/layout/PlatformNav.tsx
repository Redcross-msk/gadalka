"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DeckBackButton } from "@/components/layout/DeckBackButton";

const navItems = [
  { href: "/platform", label: "Главная" },
  { href: "/platform/today", label: "Сегодня" },
  { href: "/platform/tarot", label: "Таро" },
  { href: "/platform/symbols", label: "Знаки" },
  { href: "/platform/dreams", label: "Сны" },
  { href: "/platform/interpreter", label: "Толкователь" },
  { href: "/platform/my-book", label: "Книга" },
  { href: "/platform/profile", label: "Профиль" },
  { href: "/platform/learning", label: "Обучение" },
  { href: "/platform/programs", label: "Программы" },
];

const mobileItems = navItems.slice(0, 5);

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <>
      <aside
        aria-label="Навигация платформы"
        className="hidden lg:flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 200,
          zIndex: 50,
          padding: "40px 8px 24px 24px",
          overflowY: "auto",
          background: "transparent",
        }}
      >
        <DeckBackButton className="mb-6 self-start" />
        <nav className="flex flex-col gap-0.5 my-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/platform" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive}
                className="nav-link"
              >
                <span className="nav-link-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex justify-end px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pointer-events-none">
        <DeckBackButton className="pointer-events-auto bg-[#2e282c]/85 backdrop-blur-md" compact />
      </div>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#2e282c] via-[#2e282c]/90 to-transparent pt-8 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
        aria-label="Мобильная навигация"
      >
        <div className="flex items-center justify-around px-1 sm:px-2">
          {mobileItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/platform" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive}
                className="nav-link justify-center min-w-0 flex-1 max-w-[72px] min-h-[48px] px-0.5"
                aria-label={item.label}
              >
                <span
                  className={cn(
                    "nav-link-text !text-[9px] !tracking-[0.08em] !transform-none text-center leading-tight",
                    isActive && "!opacity-100 !text-[#f0d9a0]"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
