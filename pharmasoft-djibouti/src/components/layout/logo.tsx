import { Pill } from "lucide-react";
import { cn } from "@/lib/utils";

// PHARMASOFT — Logo dégradé sky→émeraude.
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#10B981] text-white shadow-p-md",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Pill size={size * 0.55} strokeWidth={2.4} />
    </div>
  );
}
