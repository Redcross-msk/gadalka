import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Серверная проверка сессии (читает cookie правильно, в отличие от старого getToken в middleware). */
export async function requireUser(fromPath: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?auth=required&from=${encodeURIComponent(fromPath)}`);
  }
  return session;
}
