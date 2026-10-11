import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// PHARMASOFT — Définition centrale des locales supportées.
// Le français est la locale par défaut (marché djiboutien).
// L'arabe déclenche un layout RTL automatique (cf. app/[locale]/layout.tsx).
export const routing = defineRouting({
  locales: ["fr", "ar", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
