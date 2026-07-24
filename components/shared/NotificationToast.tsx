"use client";

import { useAppStore } from "@/store/useAppStore";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationToast() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in slide-in-from-right",
            toast.variant === "success" && "border-green-500/30",
            toast.variant === "error" && "border-destructive/30"
          )}
        >
          {toast.variant === "success" && <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />}
          {toast.variant === "error" && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded hover:bg-secondary shrink-0"
            aria-label="Закрыть уведомление"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
