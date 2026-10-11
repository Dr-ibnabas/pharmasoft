"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇩🇯" },
] as const;

// PHARMASOFT — Sélecteur de langue. Change l'URL en remplaçant le préfixe locale.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: string) => {
    // Remplace le préfixe /fr|/ar|/en par /{next}
    const newPath = pathname.replace(/^\/(fr|ar|en)(?=\/|$)/, `/${next}`);
    router.push(newPath);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative grid h-[38px] w-[38px] place-items-center rounded-md text-foreground transition-colors hover:bg-muted">
        <Globe size={18} />
        <span className="absolute bottom-1 right-1 rounded-sm bg-primary px-[3px] text-[9px] font-bold leading-[1.2] tracking-wider text-white">
          {locale.toUpperCase()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => switchTo(l.code)} className="cursor-pointer">
            <span className="mr-2">{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {locale === l.code ? <Check size={14} className="text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
