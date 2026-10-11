import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, requireResource } from "@/lib/api-helpers";
import {
  createBackup,
  listBackups,
  deleteBackup,
  getBackupDir,
  BackupError,
} from "@/lib/backup";

// Routes de sauvegarde — réservées à la ressource "settings"
// (SUPER_ADMIN + TITULAIRE, cf. lib/permissions.ts).
// Node runtime obligatoire (child_process / fs) — jamais Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(e: unknown) {
  if (e instanceof BackupError) return jsonError(e.status, e.message);
  if (typeof e === "object" && e !== null && "status" in e) {
    const { status, message } = e as { status: number; message?: string };
    return jsonError(status, message ?? "Erreur");
  }
  console.error("[API/backup]", e);
  return jsonError(500, "Erreur serveur lors de la sauvegarde.");
}

// GET /api/backup → { dir, backups: [...] }
export async function GET() {
  try {
    await requireResource("settings");
    const [dir, backups] = await Promise.all([getBackupDir(), listBackups()]);
    return jsonOk({ dir, backups });
  } catch (e) {
    return fail(e);
  }
}

// POST /api/backup → lance une sauvegarde immédiate
export async function POST() {
  try {
    const session = await requireResource("settings");
    const file = await createBackup();

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "BACKUP_CREATE",
        resource: "Backup",
        resourceId: file.name,
        details: { sizeBytes: file.sizeBytes },
      },
    });

    // Notification globale (centre de notifications).
    await prisma.notification
      .create({
        data: {
          type: "BACKUP_DONE",
          title: "Sauvegarde effectuée",
          message: `Sauvegarde « ${file.name} » créée avec succès.`,
        },
      })
      .catch(() => {});

    return jsonOk(file);
  } catch (e) {
    return fail(e);
  }
}

// DELETE /api/backup?name=... → supprime une sauvegarde
export async function DELETE(req: Request) {
  try {
    const session = await requireResource("settings");
    const name = new URL(req.url).searchParams.get("name") ?? "";
    await deleteBackup(name);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        resource: "Backup",
        resourceId: name,
      },
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
