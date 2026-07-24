"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriptionCard } from "@/components/platform/SubscriptionCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { subscriptionPlans } from "@/data/user";
import { CreditCard } from "lucide-react";

export default function SubscriptionPage() {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelect = (planId: string) => {
    if (planId === "free") return;
    setSelectedPlan(planId);
    setPaymentOpen(true);
  };

  const selectedPlanName = subscriptionPlans.find((p) => p.id === selectedPlan)?.name;

  return (
    <div>
      <PageHeader
        title="Подписка"
        description="Выберите тариф и получите полный доступ к возможностям Архива Гадалки"
      />

      {/* Period toggle */}
      <div className="flex items-center justify-center gap-4 mb-10 p-4 rounded-xl border border-border bg-card/30 max-w-sm mx-auto">
        <Label
          htmlFor="period-toggle"
          className={period === "month" ? "text-foreground font-medium" : "text-muted-foreground"}
        >
          Месяц
        </Label>
        <Switch
          id="period-toggle"
          checked={period === "year"}
          onCheckedChange={(checked) => setPeriod(checked ? "year" : "month")}
        />
        <Label
          htmlFor="period-toggle"
          className={period === "year" ? "text-foreground font-medium" : "text-muted-foreground"}
        >
          Год
          <span className="ml-1 text-xs text-gold">(выгоднее)</span>
        </Label>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {subscriptionPlans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            period={period}
            highlighted={plan.premium}
            onSelect={() => handleSelect(plan.id)}
          />
        ))}
      </div>

      {/* Comparison note */}
      <div className="mt-12 rounded-xl border border-border bg-card/20 p-6 md:p-8 max-w-4xl mx-auto">
        <h3 className="font-serif text-xl mb-4">Что даёт подписка Гадалка+</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>✦ Все расклады без ограничений</li>
            <li>✦ Расширенный AI-толкователь с памятью</li>
            <li>✦ Полный дневник снов и анализ</li>
            <li>✦ Все курсы и программы</li>
          </ul>
          <ul className="space-y-2">
            <li>✦ Эксклюзивные цифровые колоды</li>
            <li>✦ Аудио-функции и медитации</li>
            <li>✦ Бонусы в магазине</li>
            <li>✦ Без рекламы</li>
          </ul>
        </div>
      </div>

      {/* Payment modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" />
              Оформление подписки
            </DialogTitle>
            <DialogDescription>
              {selectedPlanName && `Тариф «${selectedPlanName}» — ${period === "month" ? "ежемесячно" : "ежегодно"}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-burgundy/20 border border-gold/20 mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gold" />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Платежная система будет подключена на следующем этапе.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Сейчас вы можете активировать пробный период с помощью кода GADALKA-GIFT-2026
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
