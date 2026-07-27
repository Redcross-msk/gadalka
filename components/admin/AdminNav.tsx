"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Сводка" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/products", label: "Магазин" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/dreams", label: "Сны" },
  { href: "/admin/game", label: "Игра" },
  { href: "/admin/activations", label: "Промокоды" },
  { href: "/admin/media", label: "Медиа" },
  { href: "/admin/audit", label: "Журнал" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto max-w-6xl px-3 sm:px-6 pb-3 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1.5 min-w-max">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] sm:text-xs tracking-wide touch-manipulation min-h-[36px] inline-flex items-center",
                active
                  ? "border-gold/45 bg-gold/10 text-gold"
                  : "border-gold/20 text-gold/80 hover:bg-gold/10"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
