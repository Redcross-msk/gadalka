import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LockedContentProps {
  title?: string;
  description?: string;
}

export function LockedContent({
  title = "Премиум-контент",
  description = "Этот раздел доступен по подписке Гадалка+",
}: LockedContentProps) {
  return (
    <div className="relative rounded-xl border border-gold/20 bg-burgundy/10 p-8 text-center">
      <div className="absolute inset-0 backdrop-blur-[2px] rounded-xl" />
      <div className="relative">
        <Lock className="h-8 w-8 text-gold mx-auto mb-4" />
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>
        <Button variant="premium" className="mt-6" asChild>
          <Link href="/platform/subscription">Узнать о подписке</Link>
        </Button>
      </div>
    </div>
  );
}

export function PremiumBadge({ unlocked = false }: { unlocked?: boolean }) {
  if (unlocked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        Доступно
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-burgundy/30 px-2.5 py-0.5 text-xs font-medium text-gold-light">
      <Lock className="h-3 w-3" />
      Премиум
    </span>
  );
}
