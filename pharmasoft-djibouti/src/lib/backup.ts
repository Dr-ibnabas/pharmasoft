import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

// PHARMASOFT — Sauvegarde / restauration de la base PostgreSQL en LOCAL.
//
// 100% hors-ligne : on appelle directement les binaires `pg_dump` / `pg_restore`
// installés avec PostgreSQL sur le serveur de la pharmacie. Aucun cloud.
//
// Format de dump : « custom » (-Fc) → compressé + restaurable avec --clean.
// Dossier de destination : variable d'env BACKUP_DIR (ex: un disque externe /
// une clé USB : D:\PHARMASOFT-BACKUPS), sinon ./backups dans le projet.
//
// Localisation des binaires : variable PG_BIN_DIR
//   (Windows ex: "C:\Program Files\PostgreSQL\16\bin"), sinon on suppose le PATH.

const execFileAsync = promisify(execFile);

/** Erreur métier de sauvegarde, porte un code HTTP pour la couche API. */
export class BackupError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BackupError";
  }
}

export interface BackupFile {
  name: string;
  sizeBytes: number;
  createdAt: string; // ISO
}

interface PgConnection {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

/** Préfixe du nom de fichier + extension custom-format. */
const PREFIX = "pharmasoft-";
const EXT = ".dump";
// Sécurité : on n'accepte QUE des noms de fichiers de sauvegarde bien formés
// (anti path-traversal). Pas de "/", "\", ".." possibles.
const SAFE_NAME = /^pharmasoft-\d{8}-\d{6}\.dump$/;

/** Analyse DATABASE_URL → composants de connexion PostgreSQL. */
function parseDatabaseUrl(): PgConnection {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new BackupError(500, "DATABASE_URL non défini : impossible de sauvegarder.");
  }
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new BackupError(500, "DATABASE_URL est mal formé.");
  }
  const database = decodeURIComponent(u.pathname.replace(/^\//, ""));
  if (!database) {
    throw new BackupError(500, "Nom de base introuvable dans DATABASE_URL.");
  }
  return {
    host: u.hostname || "localhost",
    port: u.port || "5432",
    user: decodeURIComponent(u.username || "postgres"),
    password: decodeURIComponent(u.password || ""),
    database,
  };
}

/** Chemin absolu d'un binaire PostgreSQL (pg_dump / pg_restore / psql). */
function pgBinary(name: "pg_dump" | "pg_restore" | "psql"): string {
  const binDir = process.env.PG_BIN_DIR?.trim();
  const exe = process.platform === "win32" ? `${name}.exe` : name;
  return binDir ? path.join(binDir, exe) : exe; // sinon on s'appuie sur le PATH
}

/** Dossier de sauvegarde (créé si absent). */
export async function getBackupDir(): Promise<string> {
  const dir = process.env.BACKUP_DIR?.trim() || path.join(process.cwd(), "backups");
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Horodatage compact YYYYMMDD-HHmmss (heure locale du serveur). */
function timestamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

/** Mappe une erreur d'exécution (binaire manquant, etc.) en BackupError lisible. */
function toBackupError(err: unknown, action: string): BackupError {
  const e = err as { code?: string; stderr?: string; message?: string };
  if (e?.code === "ENOENT") {
    return new BackupError(
      500,
      "Binaire PostgreSQL introuvable (pg_dump/pg_restore). " +
        "Vérifiez l'installation de PostgreSQL et la variable PG_BIN_DIR.",
    );
  }
  const detail = (e?.stderr || e?.message || "").toString().trim().slice(0, 500);
  return new BackupError(500, `Échec ${action}${detail ? " : " + detail : ""}`);
}

/** Lance une sauvegarde immédiate. Retourne le fichier créé. */
export async function createBackup(): Promise<BackupFile> {
  const conn = parseDatabaseUrl();
  const dir = await getBackupDir();
  const name = `${PREFIX}${timestamp(new Date())}${EXT}`;
  const target = path.join(dir, name);

  const args = [
    "-h", conn.host,
    "-p", conn.port,
    "-U", conn.user,
    "-d", conn.database,
    "-Fc", // format custom (compressé, restaurable avec --clean)
    "-f", target,
  ];

  try {
    await execFileAsync(pgBinary("pg_dump"), args, {
      env: { ...process.env, PGPASSWORD: conn.password },
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 64,
    });
  } catch (err) {
    // Nettoyage d'un éventuel fichier partiel.
    await fs.rm(target, { force: true }).catch(() => {});
    throw toBackupError(err, "de la sauvegarde");
  }

  const stat = await fs.stat(target);
  if (stat.size === 0) {
    await fs.rm(target, { force: true }).catch(() => {});
    throw new BackupError(500, "Sauvegarde vide : aucune donnée écrite.");
  }
  return { name, sizeBytes: stat.size, createdAt: stat.mtime.toISOString() };
}

/** Liste les sauvegardes existantes (plus récentes en premier). */
export async function listBackups(): Promise<BackupFile[]> {
  const dir = await getBackupDir();
  const entries = await fs.readdir(dir).catch(() => [] as string[]);
  const files: BackupFile[] = [];
  for (const name of entries) {
    if (!SAFE_NAME.test(name)) continue;
    try {
      const stat = await fs.stat(path.join(dir, name));
      files.push({ name, sizeBytes: stat.size, createdAt: stat.mtime.toISOString() });
    } catch {
      // ignore fichiers illisibles
    }
  }
  files.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return files;
}

/** Résout + valide un nom de sauvegarde en chemin absolu (anti path-traversal). */
export async function resolveBackupPath(name: string): Promise<string> {
  if (!SAFE_NAME.test(name)) {
    throw new BackupError(400, "Nom de sauvegarde invalide.");
  }
  const dir = await getBackupDir();
  const full = path.join(dir, name);
  // Double garde : le chemin résolu doit rester dans le dossier de backup.
  if (path.dirname(full) !== path.resolve(dir)) {
    throw new BackupError(400, "Chemin de sauvegarde refusé.");
  }
  try {
    await fs.access(full);
  } catch {
    throw new BackupError(404, "Sauvegarde introuvable.");
  }
  return full;
}

/**
 * Restaure la base à partir d'une sauvegarde existante.
 * ATTENTION : --clean --if-exists écrase les données actuelles.
 */
export async function restoreBackup(name: string): Promise<void> {
  const conn = parseDatabaseUrl();
  const source = await resolveBackupPath(name);

  const args = [
    "-h", conn.host,
    "-p", conn.port,
    "-U", conn.user,
    "-d", conn.database,
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-privileges",
    "--single-transaction",
    source,
  ];

  try {
    await execFileAsync(pgBinary("pg_restore"), args, {
      env: { ...process.env, PGPASSWORD: conn.password },
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 64,
    });
  } catch (err) {
    throw toBackupError(err, "de la restauration");
  }
}

/** Supprime une sauvegarde (rotation manuelle). */
export async function deleteBackup(name: string): Promise<void> {
  const full = await resolveBackupPath(name);
  await fs.rm(full, { force: true });
}
