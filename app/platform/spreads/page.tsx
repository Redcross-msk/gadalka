"use client";

import Link from "next/link";
import { Crown, Layers } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SpreadCard } from "@/components/platform/SpreadCard";
import { Button } from "@/components/ui/button";
import { freeSpreads, premiumSpreads } from "@/data/spreads";
import { useAuth } from "@/hooks/useHydration";

export default function SpreadsCatalogPage() {
  const { isPremium, hydrated } = useAuth();

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Расклады" }]} />
      <PageHeader
        title="Расклады"
        description="Интерактивные расклады для разных жизненных ситуаций"
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/platform/tarot">Каталог карт</Link>
        </Button>
      </PageHeader>

      <section className="mb-12">
        <SectionHeader
          title="Бесплатные расклады"
          description="Доступны всем пользователям"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeSpreads.map((spread) => (
            <SpreadCard key={spread.id} spread={spread} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Премиум-расклады"
          description={
            isPremium
              ? "Полный доступ по вашей подписке"
              : "Доступны по подписке Гадалка+"
          }
          action={
            !isPremium ? (
              <Button variant="premium" size="sm" asChild>
                <Link href="/platform/subscription">
                  <Crown className="h-4 w-4 mr-1" />
                  Подключить
                </Link>
              </Button>
            ) : undefined
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumSpreads.map((spread) => (
            <div key={spread.id} className={!isPremium ? "relative" : undefined}>
              {!isPremium && (
                <div className="absolute inset-0 z-10 rounded-xl bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="text-center p-4">
                    <Layers className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm font-medium">Требуется Гадалка+</p>
                    <Button variant="premium" size="sm" className="mt-3" asChild>
                      <Link href="/platform/subscription">Узнать больше</Link>
                    </Button>
                  </div>
                </div>
              )}
              <SpreadCard spread={spread} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
