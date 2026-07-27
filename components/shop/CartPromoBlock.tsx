"use client";

import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { applyShopPromoAction } from "@/features/shop/actions";
import { formatPrice } from "@/lib/utils";

export function CartPromoBlock({ subtotal }: { subtotal: number }) {
  const appliedPromo = useAppStore((s) => s.appliedPromo);
  const setAppliedPromo = useAppStore((s) => s.setAppliedPromo);
  const addToast = useAppStore((s) => s.addToast);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const discount = appliedPromo
    ? Math.round(((subtotal * appliedPromo.percent) / 100) * 100) / 100
    : 0;
  const total = Math.max(0, subtotal - discount);

  const apply = () => {
    setError(null);
    startTransition(async () => {
      const res = await applyShopPromoAction(code);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAppliedPromo(res.promo);
      setCode("");
      addToast({
        title: "Промокод применён",
        description: res.promo.label,
        variant: "success",
      });
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Сумма</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-gold">
            <span className="flex items-center gap-1.5 min-w-0">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {appliedPromo.code} (−{appliedPromo.percent}%)
              </span>
            </span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-serif text-xl text-gold pt-2 border-t border-gold/10">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {appliedPromo ? (
        <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-3 py-2">
          <p className="flex-1 text-xs text-gold min-w-0 truncate">
            {appliedPromo.label}
          </p>
          <button
            type="button"
            onClick={() => setAppliedPromo(null)}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive"
            aria-label="Убрать промокод"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="promo-code">
            Промокод на скидку
          </label>
          <div className="flex gap-2">
            <Input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="TAROT1-…"
              className="uppercase tracking-wide"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="outline"
              disabled={pending || !code.trim()}
              onClick={apply}
              className="shrink-0"
            >
              {pending ? "…" : "ОК"}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
