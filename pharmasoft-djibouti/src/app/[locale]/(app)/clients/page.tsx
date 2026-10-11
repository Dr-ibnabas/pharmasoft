import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientsTable, type ClientRow } from "@/components/clients/clients-table";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const rows: ClientRow[] = clients.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    phone: c.phone,
    quarter: c.quarter,
    tier: c.tier,
    points: c.points,
    totalSpent: c.totalSpent,
    lastVisit: c.lastVisit?.toISOString() ?? null,
    allergiesCount: c.allergies.length,
  }));

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${rows.length} clients enregistrés`}
        actions={
          <ClientFormDialog
            mode="create"
            trigger={
              <Button>
                <Plus size={14} />
                Nouveau client
              </Button>
            }
          />
        }
      />
      <ClientsTable data={rows} />
    </div>
  );
}
