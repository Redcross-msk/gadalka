import { prisma } from "@/lib/db";
import { adminCreateActivationCodeAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivationBonusType } from "@prisma/client";

export default async function AdminActivationsPage() {
  const codes = await prisma.activationCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Коды активации</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Промокоды и бонусы для пользователей
        </p>
      </div>

      <form
        action={adminCreateActivationCodeAction}
        className="rounded-2xl border border-gold/20 bg-card/40 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Код</Label>
          <Input name="code" placeholder="WELCOME7" required className="uppercase" />
        </div>
        <div className="space-y-1.5">
          <Label>Тип бонуса</Label>
          <select
            name="bonusType"
            defaultValue="PREMIUM_DAYS"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {Object.values(ActivationBonusType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Значение</Label>
          <Input name="bonusValue" defaultValue="7" placeholder="7" required />
        </div>
        <div className="space-y-1.5">
          <Label>Макс. использований</Label>
          <Input name="maxUses" type="number" min={1} defaultValue={100} />
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
            <div>
              <p className="font-mono text-gold tracking-wider">{c.code}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {c.bonusType} · {c.bonusValue} · {c.usedCount}/{c.maxUses} ·{" "}
                {c.active ? "активен" : "выкл"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
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
