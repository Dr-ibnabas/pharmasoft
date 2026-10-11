import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

// PHARMASOFT — Config NextAuth v5 complète (Node runtime).
// Le middleware (Edge) utilise auth.config.ts allégé.

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) {
          // Trace l'échec de login (sans exposer si l'email existe).
          await prisma.auditLog.create({
            data: {
              action: "LOGIN_FAILED",
              details: { email: email.toLowerCase() },
            },
          });
          return null;
        }

        // Met à jour la date de dernière connexion + audit log.
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
            },
          }),
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          locale: user.locale,
          avatarColor: user.avatarColor,
        };
      },
    }),
  ],
});
