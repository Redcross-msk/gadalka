"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getProductBySlug } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/shop/ProductVisual";

export default function CartPage() {
  const cart = useAppStore((s) => s.cart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const clearCart = useAppStore((s) => s.clearCart);

  const items = cart
    .map((item) => {
      const product = getProductBySlug(item.productSlug);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean) as Array<{
      productSlug: string;
      quantity: number;
      product: NonNullable<ReturnType<typeof getProductBySlug>>;
    }>;

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4 mr-1" />
          К каталогу
        </Link>
      </Button>

      {items.length === 0 ? (
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
            {items.map(({ product, quantity }) => (
              <div
                key={product.slug}
                className="glass-card flex gap-4 rounded-xl p-4"
              >
                <div className="shrink-0 rounded-lg bg-black/20 p-2">
                  <ProductVisual category={product.category} size="sm" />
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
                      onClick={() => updateCartQuantity(product.slug, quantity - 1)}
                      className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"
                      aria-label="Уменьшить"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(product.slug, quantity + 1)}
                      className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"
                      aria-label="Увеличить"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.slug)}
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
            ))}
          </div>

          <aside className="glass-card rounded-2xl p-5 h-fit lg:sticky lg:top-20">
            <h2 className="font-serif text-lg mb-4">Итого</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Товаров</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between font-serif text-xl text-gold pt-2 border-t border-gold/10">
                <span>Сумма</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg" disabled>
              Оформить заказ
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              Оплата будет доступна в следующей версии
            </p>
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={clearCart}>
              Очистить корзину
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}
