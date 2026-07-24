"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useHydration";

const navLinks = [
  { href: "/platform", label: "Платформа" },
  { href: "/game", label: "Игра" },
  { href: "/shop", label: "Магазин" },
  { href: "/about", label: "О проекте" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const isPlatform = pathname.startsWith("/platform");
  const isShop = pathname.startsWith("/shop");
  const isGame = pathname.startsWith("/game");

  if (isPlatform || isShop || isGame) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Гадалка — главная">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-burgundy/30 border border-gold/20 group-hover:border-gold/40 transition-colors">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <span className="font-serif text-lg font-semibold text-gradient-gold hidden sm:block tracking-widest uppercase">
            Гадалка
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Основная навигация">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-gold",
                pathname.startsWith(link.href) ? "text-gold" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/activate">Активировать код</Link>
          </Button>
          {isAuthenticated ? (
            <Button size="sm" asChild>
              <Link href="/platform">Мой архив</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Создать профиль</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2" aria-label="Мобильная навигация">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 px-2 text-sm hover:text-gold transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
              <Button variant="ghost" asChild>
                <Link href="/activate" onClick={() => setMobileOpen(false)}>Активировать код</Link>
              </Button>
              {isAuthenticated ? (
                <Button asChild>
                  <Link href="/platform" onClick={() => setMobileOpen(false)}>Мой архив</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>Войти</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>Создать профиль</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
