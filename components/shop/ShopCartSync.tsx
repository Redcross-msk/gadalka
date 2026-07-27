"use client";

import { useEffect, useRef } from "react";
import { useHydration } from "@/hooks/useHydration";
import { useAppStore } from "@/store/useAppStore";
import {
  getResolvedCartAction,
  listShopProductsMappedAction,
  replaceCartAction,
} from "@/features/shop/actions";
import type { CartItem, Product } from "@/types";

type CatalogListener = (catalog: Map<string, Product>) => void;

let sharedCatalog = new Map<string, Product>();
const catalogListeners = new Set<CatalogListener>();

export function getShopCatalogSnapshot() {
  return sharedCatalog;
}

export function subscribeShopCatalog(listener: CatalogListener) {
  catalogListeners.add(listener);
  listener(sharedCatalog);
  return () => {
    catalogListeners.delete(listener);
  };
}

export function publishShopCatalog(products: Product[]) {
  setSharedCatalog(products);
}

function setSharedCatalog(products: Product[]) {
  sharedCatalog = new Map(products.map((p) => [p.slug, p]));
  for (const listener of catalogListeners) listener(sharedCatalog);
}

/**
 * Синхронизация корзины с PostgreSQL + каталог для отображения.
 * Сервер — источник истины после первой загрузки (кросс-устройство).
 */
export function ShopCartSync() {
  const hydrated = useHydration();
  const ranRef = useRef(false);
  const setCart = useAppStore((s) => s.setCart);

  useEffect(() => {
    if (!hydrated || ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const [catalog, serverLines] = await Promise.all([
          listShopProductsMappedAction(),
          getResolvedCartAction(),
        ]);
        setSharedCatalog(catalog);

        if (serverLines.length > 0) {
          setCart(
            serverLines.map((l) => ({
              productSlug: l.productSlug,
              productId: l.productId,
              quantity: l.quantity,
            }))
          );
          return;
        }

        // Сервер пуст — залить локальную корзину (если slug есть в каталоге)
        const local = useAppStore.getState().cart;
        const payload: Array<{ productId: string; quantity: number }> = [];
        const nextLocal: CartItem[] = [];

        for (const item of local) {
          const product =
            (item.productId && catalog.find((p) => p.id === item.productId)) ||
            catalog.find((p) => p.slug === item.productSlug);
          if (!product) continue;
          payload.push({ productId: product.id, quantity: item.quantity });
          nextLocal.push({
            productSlug: product.slug,
            productId: product.id,
            quantity: item.quantity,
          });
        }

        // Убрать «битые» slug из старого static-каталога
        setCart(nextLocal);
        if (payload.length > 0) {
          const synced = await replaceCartAction(payload);
          const mapped = synced
            .map((row) => {
              const product = catalog.find((p) => p.id === row.productId);
              if (!product) return null;
              return {
                productSlug: product.slug,
                productId: row.productId,
                quantity: row.quantity,
              };
            })
            .filter(Boolean) as CartItem[];
          if (mapped.length) setCart(mapped);
        }
      } catch {
        // офлайн — пытаемся хотя бы подтянуть каталог для отображения
        try {
          const catalog = await listShopProductsMappedAction();
          setSharedCatalog(catalog);
        } catch {
          /* ignore */
        }
      }
    })();
  }, [hydrated, setCart]);

  return null;
}
