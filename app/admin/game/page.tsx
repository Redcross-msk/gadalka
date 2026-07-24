import { prisma } from "@/lib/db";

export default async function AdminGamePage() {
  const saves = await prisma.gameSave.findMany({
    take: 50,
    orderBy: [{ level: "desc" }, { energy: "desc" }],
    include: { user: { include: { profile: true } } },
  });

  const achievements = await prisma.userAchievement.groupBy({
    by: ["achievementId"],
    _count: true,
    orderBy: { _count: { achievementId: "desc" } },
    take: 15,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Игра · рейтинг</h2>
        <p className="text-sm text-muted-foreground mt-1">Прогресс idle и популярные ачивки</p>
      </div>

      <div className="rounded-xl border border-gold/15 bg-card/30 p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55 mb-3">Топ достижений</p>
        <ul className="space-y-1 text-sm">
          {achievements.map((a) => (
            <li key={a.achievementId} className="flex justify-between gap-2">
              <span className="truncate text-muted-foreground">{a.achievementId}</span>
              <span className="tabular-nums">{a._count}</span>
            </li>
          ))}
          {achievements.length === 0 && (
            <li className="text-xs text-muted-foreground">Пока пусто</li>
          )}
        </ul>
      </div>

      <div className="space-y-2">
        {saves.map((s, i) => (
          <div
            key={s.id}
            className="rounded-xl border border-gold/15 bg-card/30 p-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-serif truncate">
                <span className="text-gold/50 mr-2">{i + 1}.</span>
                {s.user.profile?.displayName ?? s.user.email}
              </p>
              <p className="text-[11px] text-muted-foreground">
                серия {s.loginStreak} · таро-центр {s.tarotCenterLevel} · престиж {s.prestigeCount}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-serif text-gold">ур. {s.level}</p>
              <p className="text-xs tabular-nums text-muted-foreground">{Math.round(s.energy)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
