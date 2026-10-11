import { cn } from "@/lib/utils";

// PHARMASOFT — Touche de clavier (style raccourci).
export function Kbd({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-semibold text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
