import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LEGAL_DISCLAIMER } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-graphite/50 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy/30 border border-gold/20">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <span className="font-serif text-base font-semibold text-gradient-gold tracking-widest uppercase">Гадалка</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Цифровая экосистема по мотивам телесериала «Гадалка».
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold mb-3 text-gold">Экосистема</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/platform" className="hover:text-foreground transition-colors">Платформа</Link></li>
              <li><Link href="/game" className="hover:text-foreground transition-colors">Онлайн-игра</Link></li>
              <li><Link href="/shop" className="hover:text-foreground transition-colors">Магазин</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold mb-3 text-gold">Аккаунт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Вход</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Регистрация</Link></li>
              <li><Link href="/activate" className="hover:text-foreground transition-colors">Активация кода</Link></li>
              <li><Link href="/platform/subscription" className="hover:text-foreground transition-colors">Подписка</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold mb-3 text-gold">Информация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">О проекте</Link></li>
              <li><Link href="/legal" className="hover:text-foreground transition-colors">Правовая информация</Link></li>
            </ul>
          </div>
        </div>

        <div className="decorative-line my-8" />

        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
          {LEGAL_DISCLAIMER}
        </p>

        <p className="text-xs text-muted-foreground mt-4">
          © 2026 Гадалка. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
