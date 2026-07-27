"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AIChatWindow } from "@/components/platform/AIChatWindow";
import { InterpreterImmersiveBodyLock } from "@/components/platform/InterpreterImmersiveBodyLock";

export default function InterpreterPage() {
  return (
    <>
      <InterpreterImmersiveBodyLock />

      <div className="hidden lg:block">
        <Breadcrumbs items={[{ label: "Толкователь" }]} />
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-[0.04em] text-cream leading-tight">
            Толкователь
          </h1>
          <p className="mt-2 text-muted-foreground text-base max-w-2xl leading-relaxed">
            Задайте вопрос о сне, раскладе, символе или карте — ответы носят развлекательный характер
          </p>
          <div className="decorative-line mt-6 opacity-60" />
        </div>
      </div>

      {/* На мобилке чат fixed — этот блок только держит flex-цепочку */}
      <div className="lg:contents min-h-0 flex-1">
        <AIChatWindow />
      </div>
    </>
  );
}
