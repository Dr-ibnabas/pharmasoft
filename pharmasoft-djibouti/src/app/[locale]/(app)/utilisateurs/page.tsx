import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/common/page-header";
import { UserCreateDialog } from "@/components/utilisateurs/user-form-dialog";
import { UserRowActions } from "@/components/utilisateurs/user-row-actions";
import { ROLE_THEME } from "@/lib/permissions";
import { initials, fmtDateTime } from "@/lib/utils";

export default async function UtilisateursPage() {
  const session = await auth();
  if (!session?.user) return null;

  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, avatarColor: true,
    },
  });

  const canCreateAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description={`${users.filter((u) => u.isActive).length} comptes actifs sur ${users.length}`}
        actions={
          <UserCreateDialog
            canCreateAdmin={canCreateAdmin}
            trigger={<Button><Plus size={14} /> Nouveau compte</Button>}
          />
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <Th>Utilisateur</Th>
              <Th>Rôle</Th>
              <Th>Email</Th>
              <Th>Dernière connexion</Th>
              <Th>Statut</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const theme = ROLE_THEME[u.role];
              return (
                <tr key={u.id} className="border-t last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar style={{ background: u.avatarColor ?? theme.color }}>
                        <AvatarFallback className="text-xs" style={{ background: u.avatarColor ?? theme.color }}>
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {u.name}
                          {u.id === session.user.id ? (
                            <span className="ms-2 text-[10px] text-muted-foreground">(vous)</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="neutral"
                      style={{ background: `${theme.color}20`, color: theme.color, borderColor: "transparent" }}
                    >
                      {theme.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "Jamais"}
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <Badge variant="success" dot>Actif</Badge>
                    ) : (
                      <Badge variant="neutral">Désactivé</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserRowActions
                      user={{ id: u.id, name: u.name, role: u.role, isActive: u.isActive }}
                      currentUserId={session.user.id}
                      currentRole={session.user.role}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Matrice des permissions */}
      <Card className="mt-6 p-5">
        <h3 className="t-h4 mb-3">Matrice des permissions</h3>
        <p className="t-muted mb-4 text-sm">
          Cf. DECISIONS.md D-010 à D-014 — les 4 rôles sont strictement scopés selon le brief client.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["SUPER_ADMIN", "TITULAIRE", "VENDEUR", "CAISSIER"] as const).map((r) => {
            const theme = ROLE_THEME[r];
            return (
              <div key={r} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: theme.color }} />
                  <strong className="text-sm" style={{ color: theme.color }}>{theme.label}</strong>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[r].map((desc) => (
                    <li key={desc}>• {desc}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

const ROLE_DESCRIPTIONS: Record<"SUPER_ADMIN" | "TITULAIRE" | "VENDEUR" | "CAISSIER", string[]> = {
  SUPER_ADMIN: [
    "Gestion utilisateurs",
    "Paramètres pharmacie",
    "Sauvegardes et audit log",
    "Pas d'accès financier ni opérationnel",
  ],
  TITULAIRE: [
    "Tout l'opérationnel",
    "Voit prix d'achat et marges",
    "Valide les ordonnances",
    "Gère les utilisateurs (sauf admin)",
  ],
  VENDEUR: [
    "Ventes libres au POS",
    "Consultation catalogue / stock",
    "Pas de prix d'achat (D-013)",
    "PIN requis pour ordonnance",
  ],
  CAISSIER: [
    "POS uniquement",
    "Ouverture / clôture caisse",
    "PIN Titulaire pour Rx (D-014)",
    "Pas d'accès aux fiches médicaments",
  ],
};

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
