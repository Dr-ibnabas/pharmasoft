import type { NextAuthConfig } from "next-auth";
import type { Role, Locale } from "@prisma/client";

// PHARMASOFT — Config NextAuth **edge-safe** (utilisée par le middleware).
// Ne doit PAS importer Prisma ni bcrypt (incompatibles Edge Runtime).
// La config complète (avec Credentials provider) vit dans src/lib/auth.ts.
//
// Convention NextAuth v5 : on définit ici le minimum dont le middleware a besoin
// (sessions, callbacks de redirection) puis on l'étend dans auth.ts avec les providers.
export const authConfig = {
  // DÉPLOIEMENT LOCAL HORS-LIGNE : l'app est servie sur une IP LAN
  // (ex: http://192.168.1.10:3000) et non sur localhost/Vercel.
  // Sans trustHost, NextAuth v5 rejette l'hôte ("UntrustedHost") et le login
  // échoue depuis les autres postes. On fait confiance à l'hôte du réseau local.
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    // Credentials provider impose JWT (cf. DECISIONS.md D-041 ajusté).
    strategy: "jwt",
    maxAge: 60 * 60 * 12, // 12h — adapté au shift d'une pharmacie
  },
  callbacks: {
    // Propage role/locale dans le JWT à la connexion, puis dans la session côté client.
    jwt({ token, user }) {
      if (user) {
        // `user` provient du provider Credentials (cf. auth.ts). Selon la version
        // de @auth/core, son type peut être large : on le restreint explicitement.
        const u = user as { id: string; role: Role; locale: Locale; avatarColor?: string | null };
        token.id = u.id;
        token.role = u.role;
        token.locale = u.locale;
        token.avatarColor = u.avatarColor ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        // Idem que dans jwt() : on restreint le type du token selon nos augmentations.
        const t = token as { id: string; role: Role; locale: Locale; avatarColor?: string | null };
        session.user.id = t.id;
        session.user.role = t.role;
        session.user.locale = t.locale;
        session.user.avatarColor = t.avatarColor ?? null;
      }
      return session;
    },
    // Gardien de routes (combiné avec l'i18n middleware dans middleware.ts).
    authorized({ auth, request: { nextUrl } }) {
      const isAuth = !!auth?.user;
      const path = nextUrl.pathname;
      const isOnLogin = /^\/(fr|ar|en)?\/?login(\/.*)?$/.test(path);
      const isPublicRoot = /^\/(fr|ar|en)?\/?$/.test(path);
      const isApiAuth = path.startsWith("/api/auth");
      const isStatic = path.startsWith("/_next") || path.startsWith("/api") || /\.\w+$/.test(path);

      if (isApiAuth || isStatic) return true;
      if (isOnLogin) return true;
      if (isPublicRoot) return true; // P0 page d'accueil — sera supprimée en P2
      return isAuth;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
