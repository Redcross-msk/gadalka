"use client";

import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

type AccessBadgeProps = {
  /** Контент из каталога помечен как премиум */
  requiresPremium: boolean;
  /** Подпись для бесплатного контента */
  freeLabel?: string;
  className?: string;
  showLock?: boolean;
};

/**
 * Премиум без подписки → «Премиум» (золото).
 * Премиум с подпиской / бесплатное → зелёное «Доступно» / freeLabel.
 */
export function AccessBadge({
  requiresPremium,
  freeLabel = "Бесплатно",
  className,
  showLock = true,
}: AccessBadgeProps) {
  const isPremium = useAppStore((s) => s.isPremium);
  const locked = requiresPremium && !isPremium;

  if (locked) {
    return (
      <Badge variant="premium" className={cn(className)}>
        {showLock && <Lock className="h-3 w-3 mr-1" />}
        Премиум
      </Badge>
    );
  }

  if (requiresPremium) {
    return (
      <Badge variant="free" className={cn(className)}>
        Доступно
      </Badge>
    );
  }

  return (
    <Badge variant="free" className={cn(className)}>
      {freeLabel}
    </Badge>
  );
}

export function useContentLocked(requiresPremium: boolean) {
  const isPremium = useAppStore((s) => s.isPremium);
  return requiresPremium && !isPremium;
}
