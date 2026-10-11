import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { canAccess, type AppResource } from "@/lib/permissions";

// PHARMASOFT — Helpers communs pour les routes API.

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly issues?: unknown) {
    super(message);
  }
}

/** Réponse JSON standard. */
export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, { status: 200, ...init });
}

/** Réponse JSON 4xx/5xx. */
export function jsonError(status: number, message: string, issues?: unknown): NextResponse {
  return NextResponse.json({ error: message, issues }, { status });
}

/** Convertit toute exception (incl. ZodError) en réponse propre. */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return jsonError(err.status, err.message, err.issues);
  }
  // ZodError check par "shape" pour ne pas importer zod ici
  if (typeof err === "object" && err !== null && "issues" in err && Array.isArray((err as { issues: unknown[] }).issues)) {
    return jsonError(400, "Validation failed", (err as { issues: unknown[] }).issues);
  }
  console.error("[API] Unhandled error", err);
  return jsonError(500, "Erreur serveur");
}

/** Garde-fou : exige une session NextAuth, sinon 401. */
export async function requireSession(): Promise<Session & { user: NonNullable<Session["user"]> }> {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "Non authentifié");
  }
  return session as Session & { user: NonNullable<Session["user"]> };
}

/** Garde-fou : exige une session ET l'accès à la ressource demandée. */
export async function requireResource(resource: AppResource) {
  const session = await requireSession();
  if (!canAccess(session.user.role, resource)) {
    throw new ApiError(403, "Accès refusé");
  }
  return session;
}

/** Parse + valide les query params (URL search) avec un schema zod. */
export function parseQuery<T>(req: Request, schema: { parse: (v: unknown) => T }): T {
  const url = new URL(req.url);
  const obj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  return schema.parse(obj);
}

/** Parse + valide le body JSON avec un schema zod. */
export async function parseBody<T>(req: Request, schema: { parse: (v: unknown) => T }): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "Corps de requête JSON invalide");
  }
  return schema.parse(raw);
}
