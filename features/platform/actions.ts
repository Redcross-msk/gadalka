"use server";

import { z } from "zod";
import { DreamMood } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { analyzeDreamContent } from "@/server/services/dream-analysis";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

const dreamSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(20000),
  dreamDate: z.string(), // ISO date
  mood: z.nativeEnum(DreamMood),
  characters: z.array(z.string()).default([]),
  places: z.array(z.string()).default([]),
  symbols: z.array(z.string()).default([]),
  recurring: z.boolean().default(false),
  personalNote: z.string().default(""),
});

export async function createDreamAction(raw: z.infer<typeof dreamSchema>) {
  const userId = await requireUserId();
  const data = dreamSchema.parse(raw);

  const analysis = analyzeDreamContent({
    title: data.title,
    description: data.description,
    mood: data.mood,
    characters: data.characters,
    places: data.places,
    symbols: data.symbols,
    recurring: data.recurring,
    personalNote: data.personalNote,
  });

  const dream = await prisma.dream.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      dreamDate: new Date(data.dreamDate),
      mood: data.mood,
      characters: data.characters,
      places: data.places,
      symbols: data.symbols,
      recurring: data.recurring,
      personalNote: data.personalNote,
      analysis: {
        create: {
          summary: analysis.summary,
          emotions: analysis.emotions,
          foundSymbols: analysis.foundSymbols,
          themes: analysis.themes,
          questions: analysis.questions,
          toneScore: analysis.toneScore,
          rawMeta: analysis.rawMeta as object,
        },
      },
    },
    include: { analysis: true },
  });

  return dream;
}

export async function listDreamsAction() {
  const userId = await requireUserId();
  return prisma.dream.findMany({
    where: { userId },
    include: { analysis: true },
    orderBy: { dreamDate: "desc" },
  });
}

export async function getDreamAction(id: string) {
  const userId = await requireUserId();
  return prisma.dream.findFirst({
    where: { id, userId },
    include: { analysis: true },
  });
}

export async function saveSpreadAction(input: {
  spreadSlug: string;
  question: string;
  cards: { positionId: string; cardSlug: string }[];
  interpretation: string;
  isFree?: boolean;
}) {
  const userId = await requireUserId();
  const session = await prisma.spreadSession.create({
    data: {
      userId,
      spreadSlug: input.spreadSlug,
      question: input.question,
      cards: input.cards,
      interpretation: input.interpretation,
      isFree: Boolean(input.isFree),
    },
  });

  if (input.isFree) {
    await prisma.freeSpreadCooldown.upsert({
      where: { userId },
      create: { userId, lastAt: new Date() },
      update: { lastAt: new Date() },
    });
  }

  return session;
}

export async function updateProfileAction(input: {
  displayName?: string;
  zodiacSign?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  interests?: string[];
  theme?: "DARK" | "WARM" | "MYSTIC";
  onboardingComplete?: boolean;
}) {
  const userId = await requireUserId();
  return prisma.profile.update({
    where: { userId },
    data: {
      displayName: input.displayName,
      zodiacSign: input.zodiacSign as never,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      birthTime: input.birthTime ?? undefined,
      birthPlace: input.birthPlace ?? undefined,
      interests: input.interests,
      theme: input.theme,
      onboardingComplete: input.onboardingComplete,
    },
  });
}

export async function getMeAction() {
  const userId = await requireUserId();
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: { include: { avatarMedia: true } },
      subscription: true,
      gameSave: true,
    },
  });
}
