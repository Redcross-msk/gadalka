"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { CartPromoBlock } from "@/components/shop/CartPromoBlock";
import { useCartMutations, useResolvedCart } from "@/components/shop/useResolvedCart";

export default function CartPage() {
  const { items, subtotal, ready } = useResolvedCart();
  const { changeQty, remove, clear } = useCartMutations();

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4 mr-1" />
          К каталогу
        </Link>
      </Button>

      {!ready ? (
        <div className="glass-card rounded-2xl p-12 text-center text-sm text-muted-foreground">
          Загрузка корзины…
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="font-serif text-xl">Корзина пуста</p>
          <p className="text-sm text-muted-foreground mt-2">Добавьте товары из каталога</p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Перейти в магазин</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((line) => {
              const { product, quantity } = line;
              return (
                <div key={product.slug} className="glass-card flex gap-4 rounded-xl p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/20 sm:h-20 sm:w-20">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-2">
                        <ProductVisual category={product.category} size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="font-serif hover:text-gold transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-gold mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => changeQty(line, quantity - 1)}
                        className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"
                        aria-label="Уменьшить"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(line, quantity + 1)}
                        className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"
                        aria-label="Увеличить"
                      >
                        <Plus className="h-4 w-4" />
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
                  <p className="font-serif text-gold shrink-0 hidden sm:block">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          <aside className="glass-card rounded-2xl p-5 h-fit lg:sticky lg:top-20">
            <h2 className="font-serif text-lg mb-4">Итого</h2>
            <div className="mb-2 text-sm text-muted-foreground flex justify-between">
              <span>Товаров</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <CartPromoBlock subtotal={subtotal} />
            <Button className="w-full mt-6" size="lg" disabled>
              Оформить заказ
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              Оплата будет доступна в следующей версии
            </p>
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={clear}>
              Очистить корзину
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}
