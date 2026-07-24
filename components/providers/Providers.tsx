"use client";

import { SessionProvider } from "next-auth/react";
import { SessionProfileSync } from "@/components/providers/SessionProfileSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionProfileSync />
      {children}
    </SessionProvider>
  );
}
