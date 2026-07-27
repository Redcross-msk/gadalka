"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "./ProductVisual";
import { CartPromoBlock } from "./CartPromoBlock";
import { useCartMutations, useResolvedCart } from "./useResolvedCart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, ready } = useResolvedCart();
  const { changeQty, remove, clear } = useCartMutations();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть корзину"
      />
      <aside
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#302a30] border-l border-gold/15 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        aria-label="Корзина"
      >
        <div className="flex items-center justify-between border-b border-gold/10 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-lg">Корзина</h2>
            {items.length > 0 && (
              <span className="text-xs text-muted-foreground">({items.length})</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/5 transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!ready ? (
            <p className="text-center py-16 text-sm text-muted-foreground">Загрузка…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Корзина пуста</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
                К каталогу
              </Button>
            </div>
          ) : (
            items.map((line) => {
              const { product, quantity } = line;
              return (
                <div
                  key={product.slug}
                  className="flex gap-3 rounded-xl border border-border/60 bg-card/30 p-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/20">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-1.5">
                        <ProductVisual category={product.category} size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${product.slug}`}
                      onClick={onClose}
                      className="font-serif text-sm hover:text-gold transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-gold text-sm mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => changeQty(line, quantity - 1)}
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:border-gold/30"
                        aria-label="Уменьшить"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm w-6 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(line, quantity + 1)}
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:border-gold/30"
                        aria-label="Увеличить"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(line)}
                        className="ml-auto p-2 text-muted-foreground hover:text-destructive"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {ready && items.length > 0 && (
          <div className="border-t border-gold/10 p-4 space-y-3">
            <CartPromoBlock subtotal={subtotal} />
            <Button className="w-full" size="lg" disabled>
              Оформить заказ
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Оплата будет доступна в следующей версии
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/shop/cart" onClick={onClose}>
                  Открыть корзину
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Очистить
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
