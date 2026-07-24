import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] min-w-[44px] touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary shadow-[0_8px_24px_rgba(212,181,106,0.2)] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_12px_32px_rgba(212,181,106,0.28)] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-gold/20 bg-white/[0.03] hover:bg-white/[0.06] hover:border-gold/40 hover:text-gold-light",
        secondary: "bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        ghost: "hover:bg-white/[0.04] hover:text-gold-light",
        link: "text-primary underline-offset-4 hover:underline min-h-0 min-w-0",
        premium: "bg-gradient-to-br from-burgundy-light/80 to-burgundy text-cream border border-gold/25 hover:border-gold/50 shadow-[0_12px_32px_rgba(92,42,58,0.35)]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
