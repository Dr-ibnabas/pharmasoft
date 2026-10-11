"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// PHARMASOFT — Toggle clair/sombre (next-themes).
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const label = isDark ? t("theme_light") : t("theme_dark");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="grid h-[38px] w-[38px] place-items-center rounded-md text-foreground transition-colors hover:bg-muted"
          aria-label={label}
        >
          {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
