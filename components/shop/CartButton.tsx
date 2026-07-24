"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useAppStore((s) => s.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={cn(
          "relative flex h-11 min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border px-3 sm:px-4 transition-colors",
          cartCount > 0
            ? "border-gold/40 bg-gold/10 text-gold"
            : "border-border/60 hover:border-gold/30 text-cream/80",
          className
        )}
        aria-label={`Корзина, ${cartCount} товаров`}
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">Корзина</span>
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-graphite px-1">
            {cartCount}
          </span>
        )}
      </button>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
