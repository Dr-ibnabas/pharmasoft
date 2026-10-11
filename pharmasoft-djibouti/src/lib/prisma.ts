import { PrismaClient } from "@prisma/client";

// PHARMASOFT — Client Prisma singleton.
// En dev (HMR Next), on conserve le client sur globalThis pour éviter
// d'épuiser les connexions PostgreSQL à chaque rechargement.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
