import { prisma } from "@/lib/db";
import { UserStatus, SubscriptionPlan, ZodiacSign } from "@prisma/client";
import {
  adminDeleteUserAction,
  adminSetUserStatusAction,
  adminUpdateUserAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const statusFilter = sp.status as UserStatus | undefined;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        statusFilter && Object.values(UserStatus).includes(statusFilter)
          ? { status: statusFilter }
          : {},
        q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { profile: { displayName: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: { profile: true, subscription: true, gameSave: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const editing = sp.edit ? users.find((u) => u.id === sp.edit) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Пользователи</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Поиск, редактирование профиля, блокировка и удаление
        </p>
      </div>

      <form className="flex flex-col sm:flex-row gap-2" method="get">
        <Input name="q" placeholder="Email или имя" defaultValue={q} className="flex-1" />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Все статусы</option>
          {Object.values(UserStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Найти
        </Button>
      </form>

      {editing && (
        <div className="rounded-2xl border border-gold/20 bg-card/40 p-4 sm:p-6">
          <div className="flex justify-between gap-2 mb-4">
            <h3 className="font-serif text-lg">Редактирование</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">Закрыть</Link>
            </Button>
          </div>
          <form action={adminUpdateUserAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="hidden" name="userId" value={editing.id} />
            <div className="space-y-1.5">
              <Label>Имя</Label>
              <Input name="displayName" defaultValue={editing.profile?.displayName ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label>Статус</Label>
              <select
                name="status"
                defaultValue={editing.status}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                {Object.values(UserStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Подписка</Label>
              <select
                name="plan"
                defaultValue={editing.subscription?.plan ?? "FREE"}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                {Object.values(SubscriptionPlan).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Знак</Label>
              <select
                name="zodiacSign"
                defaultValue={editing.profile?.zodiacSign ?? ""}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                {Object.values(ZodiacSign).map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Дата рождения</Label>
              <Input
                name="birthDate"
                type="date"
                defaultValue={
                  editing.profile?.birthDate
                    ? editing.profile.birthDate.toISOString().slice(0, 10)
                    : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Время</Label>
              <Input name="birthTime" type="time" defaultValue={editing.profile?.birthTime ?? ""} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Город</Label>
              <Input name="birthPlace" defaultValue={editing.profile?.birthPlace ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-gold/15 bg-card/30 p-4 flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="font-serif text-lg truncate">
                  {u.profile?.displayName ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {u.role} · {u.status} · {u.subscription?.plan ?? "FREE"}
                  {u.profile?.zodiacSign ? ` · ${u.profile.zodiacSign}` : ""}
                  {u.gameSave ? ` · игра ур.${u.gameSave.level}` : ""}
                </p>
                <p className="text-[10px] text-mist/50 mt-0.5">
                  рег. {u.createdAt.toLocaleDateString("ru-RU")}
                </p>
              </div>
              <span
                className={cn(
                  "self-start rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                  u.status === "ACTIVE"
                    ? "border-emerald-500/40 text-emerald-300/90"
                    : "border-destructive/40 text-destructive"
                )}
              >
                {u.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/users?edit=${u.id}`}>Изменить</Link>
              </Button>
              {u.status === "ACTIVE" ? (
                <form
                  action={async () => {
                    "use server";
                    await adminSetUserStatusAction(u.id, "SUSPENDED");
                  }}
                >
                  <Button type="submit" size="sm" variant="outline">
                    Блок
                  </Button>
                </form>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    await adminSetUserStatusAction(u.id, "ACTIVE");
                  }}
                >
                  <Button type="submit" size="sm" variant="outline">
                    Разблок
                  </Button>
                </form>
              )}
              <form
                action={async () => {
                  "use server";
                  await adminDeleteUserAction(u.id);
                }}
              >
                <Button type="submit" size="sm" variant="destructive">
                  Удалить
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
