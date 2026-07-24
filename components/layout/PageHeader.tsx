import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-7 sm:mb-10", className)}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-medium tracking-[0.04em] text-cream leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
      <div className="decorative-line mt-5 sm:mt-8 opacity-60" />
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between mb-4 sm:mb-5 gap-2 sm:gap-4", className)}>
      <div className="min-w-0">
        <h2 className="font-serif text-base sm:text-lg md:text-xl tracking-[0.12em] sm:tracking-[0.18em] uppercase text-gold/90 font-medium leading-snug">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
