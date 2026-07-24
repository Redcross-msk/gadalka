import { prisma } from "@/lib/db";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    take: 80,
    orderBy: { createdAt: "desc" },
    include: { user: { include: { profile: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Журнал действий</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Аудит админ-операций и важных событий
        </p>
      </div>

      <div className="space-y-2">
        {logs.map((l) => (
          <div
            key={l.id}
            className="rounded-xl border border-gold/15 bg-card/30 p-3 sm:p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-sm text-gold/90 truncate">{l.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {l.user?.profile?.displayName ?? l.user?.email ?? "система"}
                  {l.entity ? ` · ${l.entity}` : ""}
                  {l.entityId ? ` · ${l.entityId.slice(0, 8)}…` : ""}
                </p>
              </div>
              <p className="text-[10px] text-mist/50 shrink-0">
                {l.createdAt.toLocaleString("ru-RU")}
              </p>
            </div>
            {l.meta != null && (
              <pre className="mt-2 text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(l.meta, null, 0)}
              </pre>
            )}
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Журнал пуст</p>
        )}
      </div>
    </div>
  );
}
