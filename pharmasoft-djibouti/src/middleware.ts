import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { authConfig } from "@/lib/auth.config";
import { canAccess, resourceFromPath, DEFAULT_HOME_BY_ROLE } from "@/lib/permissions";

// PHARMASOFT — Middleware combiné i18n + auth.
//
// Logique :
//  1. Routes API et statiques : laisser passer.
//  2. Toutes les autres routes passent d'abord par next-intl (résolution locale).
//  3. Si la route est publique (/login, /forgot-password, /), retour direct.
//  4. Sinon : on vérifie la session.
//     - Pas de session → redirection vers /{locale}/login
//     - Session sans accès à la ressource → redirection vers la home par défaut du rôle
const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

// Routes publiques (par "feuille" — testées après strip de la locale).
const PUBLIC_PATHS = ["/login", "/forgot-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1) On laisse passer les routes API et les assets.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    /\.(png|jpg|jpeg|svg|ico|gif|webp|css|js|woff|woff2|ttf|otf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2) Détection locale + path "logique" (sans préfixe locale).
  const locales = routing.locales as readonly string[];
  const localeMatch = pathname.match(/^\/(fr|ar|en)(?=\/|$)/);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const logicalPath = localeMatch ? pathname.slice(localeMatch[0].length) || "/" : pathname;

  const isPublic =
    logicalPath === "/" || PUBLIC_PATHS.some((p) => logicalPath === p || logicalPath.startsWith(`${p}/`));

  // 3) Routes publiques → laisser next-intl gérer.
  if (isPublic) {
    return intlMiddleware(req);
  }

  // 4) Vérification de la session.
  const user = req.auth?.user;
  if (!user) {
    // Pas connecté → redirection vers la page de login (avec locale courante).
    const target = locales.includes(locale) ? locale : routing.defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${target}/login`;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 5) Vérification de l'autorisation sur la ressource.
  const resource = resourceFromPath(pathname);
  if (resource && !canAccess(user.role, resource)) {
    const home = DEFAULT_HOME_BY_ROLE[user.role];
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/${
      home === "dashboard" ? "dashboard" :
      home === "pos" ? "pos" :
      home === "users" ? "utilisateurs" :
      home === "caisse" ? "caisse" : "dashboard"
    }`;
    return NextResponse.redirect(url);
  }

  // 6) Tout est OK → on délègue à next-intl pour la résolution finale.
  return intlMiddleware(req);
});

export const config = {
  // Le matcher exclut les fichiers statiques mais on garde l'app + api/auth.
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
