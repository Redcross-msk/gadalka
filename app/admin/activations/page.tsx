import { prisma } from "@/lib/db";
import { adminCreateActivationCodeAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivationBonusType } from "@prisma/client";

const bonusHints: Partial<Record<ActivationBonusType, string>> = {
  SHOP_DISCOUNT: "Процент скидки в магазине (1–100)",
  PREMIUM_DAYS: "Число дней премиума",
  ENERGY: "Кол-во энергии",
};

export default async function AdminActivationsPage() {
  const codes = await prisma.activationCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { redemptions: true } },
      assignedUser: { select: { email: true } },
    },
    take: 150,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Коды и промокоды</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Активации и скидки магазина (SHOP_DISCOUNT). Награды за Таро-центры создаются автоматически.
        </p>
      </div>

      <form
        action={adminCreateActivationCodeAction}
        className="rounded-2xl border border-gold/20 bg-card/40 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Код</Label>
          <Input name="code" placeholder="SALE5 или WELCOME7" required className="uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Тип бонуса</Label>
          <select
            name="bonusType"
            defaultValue="SHOP_DISCOUNT"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {Object.values(ActivationBonusType).map((t) => (
              <option key={t} value={t}>
                {t}
                {bonusHints[t] ? ` — ${bonusHints[t]}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Значение</Label>
          <Input name="bonusValue" defaultValue="5" placeholder="5 = скидка 5%" required />
        </div>
        <div className="space-y-1.5">
          <Label>Макс. использований</Label>
          <Input name="maxUses" type="number" min={1} defaultValue={100} />
        </div>
        <div className="space-y-1.5">
          <Label>Заметка (необяз.)</Label>
          <Input name="note" placeholder="Весенняя скидка" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Создать код</Button>
        </div>
      </form>

      <div className="space-y-2">
        {codes.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-gold/15 bg-card/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="font-mono text-gold tracking-wider">{c.code}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {c.bonusType} · {c.bonusValue}
                {c.bonusType === "SHOP_DISCOUNT" ? "%" : ""} · {c.usedCount}/{c.maxUses} ·{" "}
                {c.active ? "активен" : "выкл"}
                {c.source ? ` · ${c.source}` : ""}
                {c.assignedUser ? ` · ${c.assignedUser.email}` : ""}
              </p>
              {c.note && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{c.note}</p>}
            </div>
            <p className="text-xs text-muted-foreground shrink-0">
              гашений: {c._count.redemptions}
            </p>
          </div>
        ))}
        {codes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Кодов пока нет</p>
        )}
      </div>
    </div>
  );
}
