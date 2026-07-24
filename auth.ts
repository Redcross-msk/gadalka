import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

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

        const isPremium =
          user.subscription?.plan !== "FREE" &&
          user.subscription?.status === "ACTIVE" &&
          (!user.subscription.endsAt || user.subscription.endsAt > new Date());

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName ?? user.email,
          displayName: user.profile?.displayName ?? user.email,
          role: user.role as UserRole,
          isPremium: Boolean(isPremium),
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
      }
      if (trigger === "update" && session) {
        const s = session as {
          displayName?: string;
          isPremium?: boolean;
          onboardingComplete?: boolean;
        };
        if (s.displayName !== undefined) token.displayName = s.displayName;
        if (s.isPremium !== undefined) token.isPremium = s.isPremium;
        if (s.onboardingComplete !== undefined) token.onboardingComplete = s.onboardingComplete;
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
