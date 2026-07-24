import Link from "next/link";
import { getAdminDashboardStats, type StatsPeriod } from "@/server/services/admin.service";
import { cn } from "@/lib/utils";

const periods: { id: StatsPeriod; label: string }[] = [
  { id: "day", label: "Сутки" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "year", label: "Год" },
  { id: "all", label: "Всё" },
];

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gold/15 bg-card/40 p-4 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55">{label}</p>
      <p className="font-serif text-2xl sm:text-3xl text-gold-light mt-1 tabular-nums break-all">
        {value}
      </p>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = (periods.find((p) => p.id === sp.period)?.id ?? "month") as StatsPeriod;
  const stats = await getAdminDashboardStats(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-gold-light">Аналитика</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Сводка по платформе, игре, магазину и операциям
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {periods.map((p) => (
            <Link
              key={p.id}
              href={`/admin?period=${p.id}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs",
                period === p.id
                  ? "border-gold/45 bg-gold/10 text-gold"
                  : "border-border/50 text-muted-foreground"
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <section>
        <h3 className="font-serif text-lg text-gold/90 mb-3">Пользователи</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Всего" value={stats.users.total} />
          <StatCard label="Новые" value={stats.users.new} hint="за период" />
          <StatCard label="Активные" value={stats.users.active} />
          <StatCard label="Заблок." value={stats.users.suspended} />
          <StatCard label="Premium" value={stats.users.premium} />
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-gold/90 mb-3">Платформа</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Сны всего" value={stats.platform.dreamsTotal} />
          <StatCard label="Сны новые" value={stats.platform.dreamsNew} />
          <StatCard label="Расклады" value={stats.platform.spreadsTotal} />
          <StatCard label="Чаты" value={stats.platform.chatsTotal} />
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gold/15 bg-card/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-2">Сны по настроению</p>
            <ul className="space-y-1 text-sm">
              {stats.platform.dreamsByMood.map((row) => (
                <li key={row.mood} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{row.mood}</span>
                  <span className="tabular-nums text-cream">{row._count}</span>
                </li>
              ))}
              {stats.platform.dreamsByMood.length === 0 && (
                <li className="text-muted-foreground text-xs">Пока нет данных</li>
              )}
            </ul>
          </div>
          <div className="rounded-xl border border-gold/15 bg-card/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-2">Знаки зодиака</p>
            <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
              {stats.platform.usersByZodiac
                .filter((r) => r.zodiacSign)
                .map((row) => (
                  <li key={String(row.zodiacSign)} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{row.zodiacSign}</span>
                    <span className="tabular-nums">{row._count}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-gold/90 mb-3">Магазин</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Товары" value={stats.shop.productsTotal} />
          <StatCard label="В продаже" value={stats.shop.productsLive} />
          <StatCard label="Заказы" value={stats.shop.ordersTotal} />
          <StatCard
            label="Выручка"
            value={`${(stats.shop.revenueCents / 100).toLocaleString("ru-RU")} ₽`}
            hint={`оплачено: ${stats.shop.ordersPaid}`}
          />
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-gold/90 mb-3">Игра</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <StatCard label="Сейвы" value={stats.game.saves} />
          <StatCard label="Ср. уровень" value={Number(stats.game.avgLevel).toFixed(1)} />
          <StatCard label="Ср. энергия" value={Math.round(Number(stats.game.avgEnergy))} />
        </div>
        <div className="rounded-xl border border-gold/15 bg-card/30 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-3">Топ игроков</p>
          <div className="space-y-2">
            {stats.game.topPlayers.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 text-sm border-b border-border/40 pb-2 last:border-0"
              >
                <span className="truncate">
                  <span className="text-gold/60 mr-2">{i + 1}.</span>
                  {p.user.profile?.displayName ?? p.user.email}
                </span>
                <span className="tabular-nums text-gold shrink-0">
                  ур.{p.level} · {Math.round(p.energy)}
                </span>
              </div>
            ))}
            {stats.game.topPlayers.length === 0 && (
              <p className="text-xs text-muted-foreground">Пока нет прогресса</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-gold/15 bg-card/30 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-2">Подписки</p>
          <ul className="space-y-1 text-sm">
            {stats.ops.subscriptionsByPlan.map((row) => (
              <li key={row.plan} className="flex justify-between">
                <span className="text-muted-foreground">{row.plan}</span>
                <span className="tabular-nums">{row._count}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Активаций кодов за период: {stats.ops.activations} · Медиафайлов: {stats.ops.mediaCount}
          </p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-card/30 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-2">Журнал</p>
          <ul className="space-y-2 text-xs max-h-48 overflow-y-auto">
            {stats.ops.auditRecent.map((a) => (
              <li key={a.id} className="border-b border-border/30 pb-1.5">
                <span className="text-gold/80">{a.action}</span>
                <span className="text-muted-foreground"> · {a.user?.profile?.displayName ?? "—"}</span>
                <div className="text-muted-foreground/70">
                  {a.createdAt.toLocaleString("ru-RU")}
                </div>
              </li>
            ))}
          </ul>
          <Link href="/admin/audit" className="inline-block mt-3 text-xs text-gold underline-offset-2 hover:underline">
            Весь журнал →
          </Link>
        </div>
      </section>
    </div>
  );
}
