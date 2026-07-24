"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AIChatWindow } from "@/components/platform/AIChatWindow";

export default function InterpreterPage() {
  return (
    <>
      <div className="hidden sm:block">
        <Breadcrumbs items={[{ label: "Толкователь" }]} />
      </div>
      <div className="mb-4 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-medium tracking-[0.04em] text-cream leading-tight">
          Толкователь
        </h1>
        <p className="mt-2 hidden sm:block text-muted-foreground text-base max-w-2xl leading-relaxed">
          Задайте вопрос о сне, раскладе, символе или карте — ответы носят развлекательный характер
        </p>
        <div className="decorative-line mt-4 sm:mt-6 opacity-60" />
      </div>
      <AIChatWindow />
    </>
  );
}
