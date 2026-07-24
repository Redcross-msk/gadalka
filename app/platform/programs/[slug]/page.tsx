"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Check, Lock, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { LockedContent } from "@/components/shared/LockedContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getProgramBySlug } from "@/data/programs";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ProgramDetailPage() {
  const params = useParams<{ slug: string }>();
  const program = getProgramBySlug(params.slug);
  const { isPremium, hydrated } = useAuth();

  const programProgress = useAppStore((s) => s.programProgress);
  const startProgram = useAppStore((s) => s.startProgram);
  const completeProgramStage = useAppStore((s) => s.completeProgramStage);
  const addToast = useAppStore((s) => s.addToast);

  if (!program) notFound();

  const progress = programProgress.find((p) => p.programSlug === program.slug);
  const completedStages = progress?.completedStages ?? [];
  const isStarted = !!progress;
  const isCompleted = completedStages.length >= program.stages.length;
  const progressPercent =
    program.stages.length > 0
      ? (completedStages.length / program.stages.length) * 100
      : 0;

  const isLocked = program.premium && !isPremium;

  const handleStart = () => {
    startProgram(program.slug);
    addToast({
      title: "Программа начата",
      description: program.name,
      variant: "success",
    });
  };

  const handleCompleteStage = (stageId: string) => {
    if (!isStarted) {
      startProgram(program.slug);
    }
    completeProgramStage(program.slug, stageId);
    const stage = program.stages.find((s) => s.id === stageId);
    addToast({
      title: "Этап завершён",
      description: stage?.title,
      variant: "success",
    });
  };

  if (!hydrated) {
    return <div className="h-64 rounded-xl bg-card/30 animate-pulse" />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Программы", href: "/platform/programs" },
          { label: program.name },
        ]}
      />

      <PageHeader title={program.name} description={program.description}>
        <div className="flex items-center gap-2">
          {program.premium ? (
            <Badge variant="premium"><Lock className="h-3 w-3 mr-1" />Премиум</Badge>
          ) : (
            <Badge variant="free">Бесплатно</Badge>
          )}
          <Badge variant="secondary">
            <Calendar className="h-3 w-3 mr-1" />
            {program.duration}
          </Badge>
        </div>
      </PageHeader>

      {isLocked ? (
        <LockedContent
          title="Премиум-программа"
          description={`Программа «${program.name}» доступна по подписке Гадалка+`}
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card/30 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isCompleted
                    ? "Программа завершена"
                    : isStarted
                      ? `День ${progress?.currentDay ?? 1} · ${completedStages.length} из ${program.stages.length} этапов`
                      : "Программа не начата"}
                </p>
                {progress?.startedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Начата {formatDate(progress.startedAt)}
                  </p>
                )}
              </div>
              {!isStarted && !isCompleted && (
                <Button onClick={handleStart}>Начать программу</Button>
              )}
              {isCompleted && (
                <Badge className="self-start">
                  <Check className="h-3 w-3 mr-1" />
                  Завершено
                </Badge>
              )}
            </div>
            <Progress value={progressPercent} />
          </div>

          <SectionHeader title="Этапы программы" />
          <div className="space-y-3">
            {program.stages.map((stage) => {
              const isStageCompleted = completedStages.includes(stage.id);
              const prevCompleted =
                stage.day === 1 ||
                completedStages.includes(
                  program.stages.find((s) => s.day === stage.day - 1)?.id ?? ""
                );
              const canComplete = isStarted && prevCompleted && !isStageCompleted;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "rounded-xl border p-5 transition-colors",
                    isStageCompleted
                      ? "border-gold/30 bg-burgundy/10"
                      : "border-border bg-card/30"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                          isStageCompleted
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {isStageCompleted ? <Check className="h-4 w-4" /> : stage.day}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg">{stage.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                      </div>
                    </div>
                    {!isStageCompleted && (
                      <Button
                        size="sm"
                        variant={canComplete ? "default" : "outline"}
                        disabled={!canComplete && isStarted}
                        onClick={() => {
                          if (!isStarted) handleStart();
                          handleCompleteStage(stage.id);
                        }}
                      >
                        {isStarted && !prevCompleted ? "Сначала предыдущий этап" : "Завершить этап"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Button variant="ghost" className="mt-8" asChild>
        <Link href="/platform/programs">← К каталогу</Link>
      </Button>

    </>
  );
}
