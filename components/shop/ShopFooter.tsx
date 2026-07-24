import Link from "next/link";
import { LEGAL_DISCLAIMER } from "@/lib/utils";

export function ShopFooter() {
  return (
    <footer className="mt-12 border-t border-gold/10 pt-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
        <Link href="/" className="font-serif tracking-[0.2em] uppercase text-gold/70 hover:text-gold transition-colors">
          Гадалка
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/platform" className="hover:text-cream transition-colors">Платформа</Link>
          <Link href="/activate" className="hover:text-cream transition-colors">Активация</Link>
          <Link href="/legal" className="hover:text-cream transition-colors">Правовая информация</Link>
        </nav>
        <p className="text-muted-foreground/70">© 2026</p>
      </div>
      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/60 line-clamp-2 sm:line-clamp-none">
        {LEGAL_DISCLAIMER}
      </p>
    </footer>
  );
}
