import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeckBackButton } from "@/components/layout/DeckBackButton";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/?auth=required&from=/admin");
  }

  return (
    <div className="min-h-dvh card-back-surface text-cream">
      <header className="sticky top-0 z-40 border-b border-gold/15 bg-[#2e282c]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold/55">Админ-панель</p>
            <h1 className="font-serif text-lg sm:text-xl text-gold-light truncate">Архив Гадалки</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[140px]">
              {session.user.displayName || session.user.email}
            </span>
            <DeckBackButton compact />
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-6xl px-3 sm:px-6 py-5 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
