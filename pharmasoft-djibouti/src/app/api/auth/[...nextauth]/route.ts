import { handlers } from "@/lib/auth";

// PHARMASOFT — Route catch-all NextAuth v5.
// La config complète vit dans src/lib/auth.ts.
export const { GET, POST } = handlers;
export const runtime = "nodejs";
