import { prisma } from "@/lib/db";

export default async function AdminDreamsPage() {
  const dreams = await prisma.dream.findMany({
    take: 40,
    orderBy: { createdAt: "desc" },
    include: {
      user: { include: { profile: true } },
      analysis: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Сны</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Последние записи и автоанализ (модерация контента)
        </p>
      </div>
      <div className="space-y-3">
        {dreams.map((d) => (
          <div key={d.id} className="rounded-xl border border-gold/15 bg-card/30 p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-serif text-lg">{d.title}</p>
              <span className="text-[10px] uppercase tracking-wide text-gold/60">{d.mood}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {d.user.profile?.displayName ?? d.user.email} ·{" "}
              {d.dreamDate.toLocaleDateString("ru-RU")}
            </p>
            <p className="text-sm text-cream-muted mt-2 line-clamp-3">{d.description}</p>
            {d.analysis && (
              <p className="text-xs text-gold/70 mt-2 line-clamp-2 border-l-2 border-gold/25 pl-2">
                {d.analysis.summary}
              </p>
            )}
          </div>
        ))}
        {dreams.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Снов пока нет</p>
        )}
      </div>
    </div>
  );
}
