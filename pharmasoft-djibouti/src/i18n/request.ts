import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "./routing";

// PHARMASOFT — Chargement à la demande du bundle de traduction de la locale courante.
// Les fichiers JSON vivent dans /messages (messages/fr.json, ar.json, en.json).
// Si une locale inconnue est demandée, on renvoie un 404 propre.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await requestLocale) ?? routing.defaultLocale;
  const locale = routing.locales.includes(requested as (typeof routing.locales)[number])
    ? requested
    : null;
  if (!locale) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE ?? "Africa/Djibouti",
  };
});
