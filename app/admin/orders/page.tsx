import { prisma } from "@/lib/db";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: { include: { profile: true } },
      items: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Заказы</h2>
        <p className="text-sm text-muted-foreground mt-1">Последние заказы магазина</p>
      </div>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-gold/15 bg-card/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-serif text-lg">
                  {o.user.profile?.displayName ?? o.user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.status} · {o.items.length} поз. · {o.createdAt.toLocaleString("ru-RU")}
                </p>
              </div>
              <p className="font-serif text-gold">
                {(o.totalCents / 100).toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} × {i.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Заказов пока нет</p>
        )}
      </div>
    </div>
  );
}
