import fs from "node:fs/promises";
import { jsonError, requireResource } from "@/lib/api-helpers";
import { resolveBackupPath, BackupError } from "@/lib/backup";

// GET /api/backup/download?name=... — télécharge un fichier de sauvegarde
// (permet d'enregistrer une copie sur clé USB depuis n'importe quel poste).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireResource("settings");
    const name = new URL(req.url).searchParams.get("name") ?? "";
    const full = await resolveBackupPath(name); // valide + anti path-traversal
    const data = await fs.readFile(full);

    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(data.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof BackupError) return jsonError(e.status, e.message);
    if (typeof e === "object" && e !== null && "status" in e) {
      const { status, message } = e as { status: number; message?: string };
      return jsonError(status, message ?? "Erreur");
    }
    console.error("[API/backup/download]", e);
    return jsonError(500, "Erreur serveur.");
  }
}
