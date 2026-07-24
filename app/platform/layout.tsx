import { PlatformNav } from "@/components/layout/PlatformNav";
import { ScrollAtmosphere } from "@/components/platform/ScrollAtmosphere";
import { LEGAL_DISCLAIMER } from "@/lib/utils";
import { requireUser } from "@/lib/require-user";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/platform");

  return (
    <div className="relative min-h-dvh min-w-0 overflow-x-clip card-back-surface">
      <ScrollAtmosphere />
      <PlatformNav />

      <main className="relative z-10 min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10">
        <div className="lg:pl-[200px]">
          <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-5xl flex-col px-4 pt-14 pb-5 sm:px-5 sm:py-6 lg:min-h-[calc(100dvh-2.5rem)] lg:px-10 lg:pt-8 lg:pb-8">
            <div className="flex-1 min-w-0">{children}</div>
            <p className="mt-auto border-t border-gold/10 pt-6 sm:pt-8 text-center text-[10px] sm:text-xs leading-relaxed text-muted-foreground">
              {LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
