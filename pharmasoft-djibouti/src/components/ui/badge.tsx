import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// PHARMASOFT — Variantes badge calquées sur la maquette (.badge-*).
const badgeVariants = cva(
  "inline-flex items-center gap-1 h-[22px] rounded-full border px-2 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-muted text-foreground",
        primary: "border-transparent bg-[#E0F2FE] text-[#0284C7] dark:bg-primary/15 dark:text-primary",
        success: "border-transparent bg-[#DCFCE7] text-[#22C55E] dark:bg-[#22C55E]/15",
        warning: "border-transparent bg-[#FEF3C7] text-[#F59E0B] dark:bg-[#F59E0B]/15",
        destructive: "border-transparent bg-[#FEE2E2] text-[#EF4444] dark:bg-[#EF4444]/15",
        neutral: "bg-muted text-muted-foreground border-border",
        outline: "bg-transparent text-foreground border-border",
      },
      dot: {
        true: "before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current",
        false: "",
      },
    },
    defaultVariants: { variant: "default", dot: false },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, dot, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, dot }), className)} {...props} />;
}

export { Badge, badgeVariants };
