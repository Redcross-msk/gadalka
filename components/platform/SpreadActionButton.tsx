"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFreeSpreadCooldown } from "@/hooks/useFreeSpreadCooldown";
import { formatCooldown } from "@/data/daily";
import { cn } from "@/lib/utils";

interface SpreadActionButtonProps {
  href: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

export function SpreadActionButton({
  href,
  className,
  size = "default",
  fullWidth,
}: SpreadActionButtonProps) {
  const { available, remaining } = useFreeSpreadCooldown();

  if (available) {
    return (
      <Button size={size} className={cn(fullWidth && "w-full", className)} asChild>
        <Link href={href}>Сделать расклад</Link>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      disabled
      className={cn(fullWidth && "w-full", "min-w-[200px]", className)}
    >
      Через {formatCooldown(remaining)}
    </Button>
  );
}
