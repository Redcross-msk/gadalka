"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { LockedContent } from "@/components/shared/LockedContent";
import { AccessBadge } from "@/components/shared/AccessBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourseBySlug } from "@/data/courses";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const course = getCourseBySlug(params.slug);
  const { isPremium, hydrated } = useAuth();

  const courseProgress = useAppStore((s) => s.courseProgress);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const addToast = useAppStore((s) => s.addToast);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  if (!course) notFound();

  const progress = courseProgress.find((p) => p.courseSlug === course.slug);
  const completedLessons = progress?.completedLessons ?? [];
  const progressPercent =
    course.lessonCount > 0
      ? (completedLessons.length / course.lessonCount) * 100
      : 0;

  const isLocked = course.premium && !isPremium;
  const activeLesson =
    course.lessons.find((l) => l.id === activeLessonId) ?? course.lessons[0];

  const handleCompleteLesson = (lessonId: string) => {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    const quizCorrect = lesson.quiz.every(
      (q) => quizAnswers[`${lessonId}-${q.id}`] === q.correctIndex
    );

    if (lesson.quiz.length > 0 && !quizCorrect) {
      addToast({
        title: "Проверьте ответы",
        description: "Не все ответы в викторине верны",
        variant: "error",
      });
      return;
    }

    completeLesson(course.slug, lessonId);
    addToast({
      title: "Урок завершён",
      description: lesson.title,
      variant: "success",
    });

    const nextLesson = course.lessons.find(
      (l) => !completedLessons.includes(l.id) && l.id !== lessonId
    );
    if (nextLesson) setActiveLessonId(nextLesson.id);
  };

  if (!hydrated) {
    return <div className="h-64 rounded-xl bg-card/30 animate-pulse" />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Обучение", href: "/platform/learning" },
          { label: course.name },
        ]}
      />

      <PageHeader title={course.name} description={course.description}>
        <AccessBadge requiresPremium={course.premium} freeLabel="Бесплатно" />
      </PageHeader>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{completedLessons.length} из {course.lessonCount} уроков</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} />
      </div>

      {isLocked ? (
        <LockedContent
          title="Премиум-курс"
          description={`Курс «${course.name}» доступен по подписке Гадалка+`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="space-y-2">
            <SectionHeader title="Уроки" />
            {course.lessons.map((lesson, i) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isActive = activeLesson.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-colors min-h-[44px]",
                    isActive
                      ? "border-gold/40 bg-burgundy/20 text-gold"
                      : "border-border hover:border-gold/20 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-gold shrink-0" />
                    ) : (
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    )}
                    <span className="text-sm truncate">{lesson.title}</span>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="lg:col-span-2">
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Материал</TabsTrigger>
                <TabsTrigger value="exercise">Упражнение</TabsTrigger>
                <TabsTrigger value="quiz">Викторина</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="rounded-xl border border-border bg-card/30 p-6">
                <h2 className="font-serif text-2xl mb-4">{activeLesson.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{activeLesson.content}</p>
              </TabsContent>

              <TabsContent value="exercise" className="rounded-xl border border-border bg-card/30 p-6">
                <h2 className="font-serif text-xl mb-4">Упражнение</h2>
                <p className="text-muted-foreground leading-relaxed">{activeLesson.exercise}</p>
              </TabsContent>

              <TabsContent value="quiz" className="rounded-xl border border-border bg-card/30 p-6 space-y-6">
                {activeLesson.quiz.map((q) => (
                  <div key={q.id}>
                    <p className="font-medium mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors min-h-[44px]",
                            quizAnswers[`${activeLesson.id}-${q.id}`] === i
                              ? "border-gold/40 bg-burgundy/10"
                              : "border-border hover:border-gold/20"
                          )}
                        >
                          <input
                            type="radio"
                            name={`${activeLesson.id}-${q.id}`}
                            checked={quizAnswers[`${activeLesson.id}-${q.id}`] === i}
                            onChange={() =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [`${activeLesson.id}-${q.id}`]: i,
                              }))
                            }
                            className="accent-gold"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => handleCompleteLesson(activeLesson.id)}
                disabled={completedLessons.includes(activeLesson.id)}
              >
                {completedLessons.includes(activeLesson.id) ? (
                  <>
                    <Check className="h-4 w-4" />
                    Урок завершён
                  </>
                ) : (
                  "Завершить урок"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button variant="ghost" className="mt-8" asChild>
        <Link href="/platform/learning">← К каталогу</Link>
      </Button>

    </>
  );
}
