"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

const saveSchema = z.object({
  level: z.number().int().min(1),
  energy: z.number().min(0),
  prestigeCount: z.number().int().min(0).optional(),
  tarotCenterLevel: z.number().int().min(0).optional(),
  loginStreak: z.number().int().min(0).optional(),
  state: z.record(z.any()),
  achievements: z
    .array(
      z.object({
        achievementId: z.string(),
        claimed: z.boolean().optional(),
      })
    )
    .optional(),
});

/** Сохранить прогресс idle-игры в БД (debounce на клиенте) */
export async function saveGameProgressAction(raw: z.infer<typeof saveSchema>) {
  const userId = await requireUserId();
  const data = saveSchema.parse(raw);

  const save = await prisma.gameSave.upsert({
    where: { userId },
    create: {
      userId,
      level: data.level,
      energy: data.energy,
      prestigeCount: data.prestigeCount ?? 0,
      tarotCenterLevel: data.tarotCenterLevel ?? 0,
      loginStreak: data.loginStreak ?? 1,
      state: data.state,
      lastTickAt: new Date(),
    },
    update: {
      level: data.level,
      energy: data.energy,
      prestigeCount: data.prestigeCount ?? 0,
      tarotCenterLevel: data.tarotCenterLevel ?? 0,
      loginStreak: data.loginStreak ?? 1,
      state: data.state,
      lastTickAt: new Date(),
    },
  });

  if (data.achievements?.length) {
    for (const a of data.achievements) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: a.achievementId },
        },
        create: {
          userId,
          achievementId: a.achievementId,
          claimed: Boolean(a.claimed),
        },
        update: {
          claimed: Boolean(a.claimed),
        },
      });
    }
  }

  return { ok: true as const, updatedAt: save.updatedAt };
}

export async function loadGameProgressAction() {
  const userId = await requireUserId();
  const [save, achievements] = await Promise.all([
    prisma.gameSave.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);
  return { save, achievements };
}
