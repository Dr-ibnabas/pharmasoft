import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, parseBody, requireResource } from "@/lib/api-helpers";
import { restoreBackup, BackupError } from "@/lib/backup";

// POST /api/backup/restore — restaure la base depuis une sauvegarde locale.
// DESTRUCTIF : écrase les données actuelles. Réservé à "settings".
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ name: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const session = await requireResource("settings");
    const { name } = await parseBody(req, bodySchema);

    await restoreBackup(name);

    await prisma.auditLog
      .create({
        data: {
          userId: session.user.id,
          action: "SETTINGS_UPDATE",
          resource: "Backup",
          resourceId: name,
          details: { operation: "restore" },
        },
      })
      .catch(() => {});

    return jsonOk({ ok: true });
  } catch (e) {
    if (e instanceof BackupError) return jsonError(e.status, e.message);
    if (typeof e === "object" && e !== null && "status" in e) {
      const { status, message } = e as { status: number; message?: string };
      return jsonError(status, message ?? "Erreur");
    }
    console.error("[API/backup/restore]", e);
    return jsonError(500, "Erreur serveur lors de la restauration.");
  }
}
