import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      displayName: string | null;
      isPremium: boolean;
      onboardingComplete: boolean;
    };
  }

  interface User {
    role?: UserRole;
    displayName?: string | null;
    isPremium?: boolean;
    onboardingComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    displayName?: string | null;
    isPremium?: boolean;
    onboardingComplete?: boolean;
  }
}
