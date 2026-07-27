import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { isPremiumSubscription } from "@/lib/mappers/user";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const PREMIUM_REFRESH_MS = 60_000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
        });
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { profile: true, subscription: true },
        });
        if (!user || user.status !== "ACTIVE") return null;

        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const isPremium = isPremiumSubscription(user.subscription);

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName ?? user.email,
          displayName: user.profile?.displayName ?? user.email,
          role: user.role as UserRole,
          isPremium,
          onboardingComplete: user.profile?.onboardingComplete ?? false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: UserRole }).role;
        token.email = user.email ?? undefined;
        const u = user as {
          displayName?: string | null;
          isPremium?: boolean;
          onboardingComplete?: boolean;
        };
        token.displayName = (u.displayName ?? user.name ?? user.email)?.trim() || null;
        token.isPremium = Boolean(u.isPremium);
        token.onboardingComplete = Boolean(u.onboardingComplete);
        token.premiumCheckedAt = Date.now();
      }
      if (trigger === "update" && session) {
        const s = session as {
          displayName?: string;
          isPremium?: boolean;
          onboardingComplete?: boolean;
        };
        if (s.displayName !== undefined) token.displayName = s.displayName;
        if (s.isPremium !== undefined) {
          token.isPremium = s.isPremium;
          token.premiumCheckedAt = Date.now();
        }
        if (s.onboardingComplete !== undefined) token.onboardingComplete = s.onboardingComplete;
      }

      // Подтягиваем план из БД (админ / оплата) без перелогина
      const userId = token.id as string | undefined;
      const last = (token.premiumCheckedAt as number | undefined) ?? 0;
      if (userId && Date.now() - last > PREMIUM_REFRESH_MS) {
        try {
          const row = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true, status: true },
          });
          if (row?.status === "ACTIVE") {
            token.isPremium = isPremiumSubscription(row.subscription);
          }
        } catch {
          /* ignore */
        }
        token.premiumCheckedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = (token.email as string) ?? session.user.email;
        const dn = (token.displayName as string | null | undefined)?.trim();
        session.user.displayName = dn || null;
        session.user.name = dn || session.user.email || session.user.name;
        session.user.isPremium = Boolean(token.isPremium);
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
      }
      return session;
    },
  },
});
