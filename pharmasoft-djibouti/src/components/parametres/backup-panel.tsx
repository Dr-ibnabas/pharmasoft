"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DatabaseBackup,
  Download,
  HardDriveDownload,
  RotateCcw,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface BackupFile {
  name: string;
  sizeBytes: number;
  createdAt: string;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function BackupPanel() {
  const [dir, setDir] = useState<string>("");
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<BackupFile | null>(null);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backup", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Échec");
      const data = await res.json();
      setDir(data.dir ?? "");
      setBackups(Array.isArray(data.backups) ? data.backups : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de charger les sauvegardes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleBackupNow() {
    setBusy(true);
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Échec de la sauvegarde");
      toast.success(`Sauvegarde créée : ${data.name}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: restoreTarget.name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Échec de la restauration");
      toast.success("Base restaurée. Rechargez l'application.");
      setRestoreTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setRestoring(false);
    }
  }

  async function handleDelete(name: string) {
    if (!window.confirm(`Supprimer la sauvegarde « ${name} » ?`)) return;
    try {
      const res = await fetch(`/api/backup?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Échec");
      toast.success("Sauvegarde supprimée");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="t-h4 flex items-center gap-2">
            <DatabaseBackup size={18} /> Sauvegarde de la base
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sauvegardes PostgreSQL locales (aucun cloud). Dossier :{" "}
            <code className="rounded bg-muted px-1 py-0.5">{dir || "…"}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Rafraîchir
          </Button>
          <Button size="sm" onClick={handleBackupNow} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <HardDriveDownload size={14} />}
            {busy ? "Sauvegarde…" : "Sauvegarder maintenant"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : backups.length === 0 ? (
        <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          Aucune sauvegarde pour le moment. Cliquez sur « Sauvegarder maintenant ».
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Fichier</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Taille</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.name} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{b.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(b.createdAt)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatBytes(b.sizeBytes)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Télécharger (clé USB)">
                        <a href={`/api/backup/download?name=${encodeURIComponent(b.name)}`}>
                          <Download size={15} />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Restaurer cette sauvegarde"
                        onClick={() => setRestoreTarget(b)}
                      >
                        <RotateCcw size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Supprimer"
                        onClick={() => void handleDelete(b.name)}
                      >
                        <Trash2 size={15} className="text-[#EF4444]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Astuce : pointez <code className="rounded bg-muted px-1">BACKUP_DIR</code> vers un disque
        externe / une clé USB pour une copie hors du serveur. Une sauvegarde automatique quotidienne
        peut être planifiée (voir <code className="rounded bg-muted px-1">scripts/register-backup-task.ps1</code>).
      </p>

      {/* Confirmation de restauration (destructif). */}
      <Dialog open={restoreTarget !== null} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer la base de données ?</DialogTitle>
            <DialogDescription>
              Cette opération <strong>remplace toutes les données actuelles</strong> par le contenu
              de la sauvegarde&nbsp;:
              <br />
              <code className="mt-2 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {restoreTarget?.name}
              </code>
              <br />
              <span className="mt-2 inline-block text-[#EF4444]">
                Action irréversible. Faites d&apos;abord une sauvegarde si nécessaire.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={restoring}>
                Annuler
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRestore} disabled={restoring}>
              {restoring ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              {restoring ? "Restauration…" : "Restaurer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
