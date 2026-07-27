import { ScrollAtmosphere } from "@/components/platform/ScrollAtmosphere";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { ShopCartSync } from "@/components/shop/ShopCartSync";
import { DeckBackButton } from "@/components/layout/DeckBackButton";

export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh min-w-0 overflow-x-clip card-back-surface">
      <ScrollAtmosphere />
      <ShopCartSync />

      <main className="relative z-10 min-w-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:py-6 lg:px-10 lg:py-8">
          <div className="mb-4 flex justify-end">
            <DeckBackButton />
          </div>
          {children}
          <ShopFooter />
        </div>
      </main>
    </div>
  );
}
