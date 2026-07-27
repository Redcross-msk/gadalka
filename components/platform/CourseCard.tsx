"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { AccessBadge } from "@/components/shared/AccessBadge";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const courseProgress = useAppStore((s) => s.courseProgress);
  const progress = courseProgress.find((p) => p.courseSlug === course.slug);
  const completedCount = progress?.completedLessons.length ?? 0;
  const progressPercent = course.lessonCount > 0 ? (completedCount / course.lessonCount) * 100 : 0;

  return (
    <Link
      href={`/platform/learning/${course.slug}`}
      className="group block rounded-xl border border-border hover:border-gold/30 bg-card/50 p-6 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-burgundy/20 text-xl">📖</div>
        <AccessBadge requiresPremium={course.premium} freeLabel="Бесплатно" />
      </div>
      <h3 className="font-serif text-xl group-hover:text-gold transition-colors">{course.name}</h3>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{course.lessonCount} уроков</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} />
      </div>
    </Link>
  );
}
