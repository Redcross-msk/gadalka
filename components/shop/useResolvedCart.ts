"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useHydration } from "@/hooks/useHydration";
import { useAppStore } from "@/store/useAppStore";
import {
  getShopCatalogSnapshot,
  publishShopCatalog,
  subscribeShopCatalog,
} from "@/components/shop/ShopCartSync";
import {
  clearCartAction,
  listShopProductsMappedAction,
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/features/shop/actions";
import type { Product } from "@/types";

export type ResolvedCartLine = {
  productSlug: string;
  productId?: string;
  quantity: number;
  product: Product;
};

export function useResolvedCart() {
  const hydrated = useHydration();
  const cart = useAppStore((s) => s.cart);
  const [catalog, setCatalog] = useState<Map<string, Product>>(() => getShopCatalogSnapshot());
  const [catalogReady, setCatalogReady] = useState(() => getShopCatalogSnapshot().size > 0);

  useEffect(() => {
    return subscribeShopCatalog((next) => {
      setCatalog(new Map(next));
      if (next.size > 0) setCatalogReady(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || catalogReady) return;
    let cancelled = false;
    (async () => {
      try {
        const products = await listShopProductsMappedAction();
        if (cancelled) return;
        publishShopCatalog(products);
        setCatalogReady(true);
      } catch {
        if (!cancelled) setCatalogReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, catalogReady]);

  const items = useMemo(() => {
    const out: ResolvedCartLine[] = [];
    for (const item of cart) {
      const product =
        catalog.get(item.productSlug) ||
        [...catalog.values()].find((p) => p.id === item.productId);
      if (!product) continue;
      out.push({
        productSlug: product.slug,
        productId: item.productId ?? product.id,
        quantity: item.quantity,
        product,
      });
    }
    return out;
  }, [cart, catalog]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const ready = hydrated && catalogReady;

  return { items, subtotal, ready, cartCount: cart.length };
}

export function useCartMutations() {
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const clearCart = useAppStore((s) => s.clearCart);
  const setAppliedPromo = useAppStore((s) => s.setAppliedPromo);
  const [pending, startTransition] = useTransition();

  const changeQty = (line: ResolvedCartLine, quantity: number) => {
    updateCartQuantity(line.productSlug, quantity);
    const productId = line.productId ?? line.product.id;
    startTransition(async () => {
      await updateCartQuantityAction(productId, quantity).catch(() => undefined);
    });
  };

  const remove = (line: ResolvedCartLine) => {
    removeFromCart(line.productSlug);
    const productId = line.productId ?? line.product.id;
    startTransition(async () => {
      await removeFromCartAction(productId).catch(() => undefined);
    });
  };

  const clear = () => {
    clearCart();
    setAppliedPromo(null);
    startTransition(async () => {
      await clearCartAction().catch(() => undefined);
    });
  };

  return { changeQty, remove, clear, pending };
}
