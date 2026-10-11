import type { DefaultSession } from "next-auth";
import type { Role, Locale } from "@prisma/client";

// PHARMASOFT — Augmentation des types NextAuth pour transporter
// le rôle et la locale dans la session et le JWT.

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    locale: Locale;
    avatarColor?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      locale: Locale;
      avatarColor?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    locale: Locale;
    avatarColor?: string | null;
  }
}
