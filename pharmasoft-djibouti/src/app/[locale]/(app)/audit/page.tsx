import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { fmtDateTime } from "@/lib/utils";

const ACTION_VARIANT: Record<string, "success" | "warning" | "destructive" | "primary" | "neutral"> = {
  LOGIN: "success",
  LOGIN_FAILED: "destructive",
  LOGOUT: "neutral",
  CREATE: "primary",
  UPDATE: "neutral",
  DELETE: "destructive",
  STOCK_ADJUST: "warning",
  SALE_COMPLETE: "success",
  SALE_CANCEL: "destructive",
  PRESCRIPTION_VALIDATE: "primary",
  PRESCRIPTION_REJECT: "destructive",
  PRICE_CHANGE: "warning",
  REPORT_VIEW: "neutral",
  BACKUP_CREATE: "primary",
  SETTINGS_UPDATE: "warning",
};

const ACTION_LABEL: Record<string, string> = {
  LOGIN: "Connexion",
  LOGIN_FAILED: "Échec connexion",
  LOGOUT: "Déconnexion",
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  STOCK_ADJUST: "Ajustement stock",
  SALE_COMPLETE: "Vente",
  SALE_CANCEL: "Annulation vente",
  PRESCRIPTION_VALIDATE: "Validation Rx",
  PRESCRIPTION_REJECT: "Rejet Rx",
  PRICE_CHANGE: "Changement prix",
  REPORT_VIEW: "Consult. rapport",
  BACKUP_CREATE: "Sauvegarde",
  SETTINGS_UPDATE: "Paramètres",
};

const PAGE_SIZE = 50;

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { action?: string; user?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user) return null;

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const where = {
    ...(searchParams.action ? { action: searchParams.action as never } : {}),
    ...(searchParams.user ? { userId: searchParams.user } : {}),
  };

  const [items, total, distinctActions, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: true }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paramSuffix =
    (searchParams.action ? `&action=${searchParams.action}` : "") +
    (searchParams.user ? `&user=${searchParams.user}` : "");

  return (
    <div>
      <PageHeader
        title="Audit & journaux"
        description={`${total.toLocaleString("fr-FR")} entrées enregistrées · Page ${page}/${totalPages}`}
      />

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Action</label>
            <select name="action" defaultValue={searchParams.action ?? ""} className="h-9 rounded-md border bg-card px-3 text-sm">
              <option value="">Toutes</option>
              {distinctActions.map((a) => (
                <option key={a.action} value={a.action}>
                  {ACTION_LABEL[a.action] ?? a.action} ({a._count})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Utilisateur</label>
            <select name="user" defaultValue={searchParams.user ?? ""} className="h-9 rounded-md border bg-card px-3 text-sm">
              <option value="">Tous</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Filtrer
          </button>
          {searchParams.action || searchParams.user ? (
            <Link href={`/${params.locale}/audit`} className="text-sm text-muted-foreground hover:text-foreground">
              Réinitialiser
            </Link>
          ) : null}
        </form>
      </Card>

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <Th>Date</Th>
              <Th>Action</Th>
              <Th>Utilisateur</Th>
              <Th>Ressource</Th>
              <Th>Détails</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Aucune entrée pour ce filtre.
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr key={e.id} className="border-t align-top last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {fmtDateTime(e.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ACTION_VARIANT[e.action] ?? "neutral"}>
                      {ACTION_LABEL[e.action] ?? e.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{e.user?.name ?? <em className="text-muted-foreground">Système</em>}</td>
                  <td className="px-4 py-3 text-xs">
                    {e.resource ? (
                      <span className="font-mono">
                        {e.resource}
                        {e.resourceId ? <span className="text-muted-foreground">#{e.resourceId.slice(0, 8)}</span> : null}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {e.details ? (
                      <details>
                        <summary className="cursor-pointer hover:text-foreground">Voir JSON</summary>
                        <pre className="mt-1 max-w-xl overflow-auto rounded bg-muted p-2 font-mono text-[10px]">
                          {JSON.stringify(e.details, null, 2)}
                        </pre>
                      </details>
                    ) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} sur {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/${params.locale}/audit?page=${page - 1}${paramSuffix}`}
                className="rounded-md border bg-card px-3 py-1.5 hover:bg-muted"
              >
                ← Précédent
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/${params.locale}/audit?page=${page + 1}${paramSuffix}`}
                className="rounded-md border bg-card px-3 py-1.5 hover:bg-muted"
              >
                Suivant →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}
