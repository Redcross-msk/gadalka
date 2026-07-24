"use client";

import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  period: "month" | "year";
  onSelect: () => void;
  highlighted?: boolean;
}

export function SubscriptionCard({ plan, period, onSelect, highlighted }: SubscriptionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-8 transition-all",
        highlighted
          ? "border-gold/50 bg-gradient-to-br from-burgundy/20 to-purple-deep/20 glow-gold"
          : "border-border bg-card/50"
      )}
    >
      {highlighted && (
        <Badge variant="premium" className="mb-4">
          <Crown className="h-3 w-3 mr-1" />
          Рекомендуем
        </Badge>
      )}
      <h3 className="font-serif text-2xl font-semibold">{plan.name}</h3>
      <p className="text-3xl font-serif text-gold mt-4">{plan.price[period]}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {period === "month" ? "в месяц" : "в год"}
      </p>
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={highlighted ? "default" : "outline"}
        className="w-full mt-8"
        onClick={onSelect}
      >
        {plan.premium ? "Оформить подписку" : "Текущий тариф"}
      </Button>
    </div>
  );
}
