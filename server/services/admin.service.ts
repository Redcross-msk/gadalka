import "server-only";

import { prisma } from "@/lib/db";

export type StatsPeriod = "day" | "week" | "month" | "year" | "all";

function periodStart(period: StatsPeriod): Date | null {
  if (period === "all") return null;
  const d = new Date();
  if (period === "day") d.setHours(0, 0, 0, 0);
  if (period === "week") d.setDate(d.getDate() - 7);
  if (period === "month") d.setDate(d.getDate() - 30);
  if (period === "year") d.setFullYear(d.getFullYear() - 1);
  return d;
}

export async function getAdminDashboardStats(period: StatsPeriod = "month") {
  const since = periodStart(period);
  const createdFilter = since ? { gte: since } : undefined;

  const [
    usersTotal,
    usersNew,
    usersActive,
    usersSuspended,
    premiumActive,
    dreamsTotal,
    dreamsNew,
    spreadsTotal,
    spreadsNew,
    chatsTotal,
    productsTotal,
    productsLive,
    ordersTotal,
    ordersPaid,
    ordersRevenue,
    gameSaves,
    topPlayers,
    activations,
    mediaCount,
    auditRecent,
    dreamsByMood,
    usersByZodiac,
    subscriptionsByPlan,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: createdFilter ? { createdAt: createdFilter } : undefined }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        plan: { not: "FREE" },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
    }),
    prisma.dream.count(),
    prisma.dream.count({ where: createdFilter ? { createdAt: createdFilter } : undefined }),
    prisma.spreadSession.count(),
    prisma.spreadSession.count({
      where: createdFilter ? { createdAt: createdFilter } : undefined,
    }),
    prisma.chatSession.count(),
    prisma.product.count(),
    prisma.product.count({
      where: { status: { in: ["IN_STOCK", "PREORDER", "DIGITAL"] } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PAID", "FULFILLED"] } } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "FULFILLED"] } },
      _sum: { totalCents: true },
    }),
    prisma.gameSave.count(),
    prisma.gameSave.findMany({
      take: 10,
      orderBy: [{ level: "desc" }, { energy: "desc" }],
      include: { user: { include: { profile: true } } },
    }),
    prisma.activationRedemption.count({
      where: createdFilter ? { createdAt: createdFilter } : undefined,
    }),
    prisma.mediaAsset.count(),
    prisma.auditLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { user: { include: { profile: true } } },
    }),
    prisma.dream.groupBy({ by: ["mood"], _count: true }),
    prisma.profile.groupBy({ by: ["zodiacSign"], _count: true }),
    prisma.subscription.groupBy({ by: ["plan"], _count: true }),
  ]);

  const avgGameLevel = await prisma.gameSave.aggregate({ _avg: { level: true, energy: true } });

  return {
    period,
    users: {
      total: usersTotal,
      new: usersNew,
      active: usersActive,
      suspended: usersSuspended,
      premium: premiumActive,
    },
    platform: {
      dreamsTotal,
      dreamsNew,
      spreadsTotal,
      spreadsNew,
      chatsTotal,
      dreamsByMood,
      usersByZodiac,
    },
    shop: {
      productsTotal,
      productsLive,
      ordersTotal,
      ordersPaid,
      revenueCents: ordersRevenue._sum.totalCents ?? 0,
    },
    game: {
      saves: gameSaves,
      avgLevel: avgGameLevel._avg.level ?? 0,
      avgEnergy: avgGameLevel._avg.energy ?? 0,
      topPlayers,
    },
    ops: {
      activations,
      mediaCount,
      auditRecent,
      subscriptionsByPlan,
    },
  };
}

export async function logAdminAction(input: {
  adminId: string;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.adminId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      meta: input.meta as never,
    },
  });
}
