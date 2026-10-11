import { Construction, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";

// PHARMASOFT — Placeholder pour les modules non encore implémentés.
// Affiche les fonctionnalités prévues + le statut de livraison.
export function ScreenPlaceholder({
  title,
  description,
  phase,
  features,
}: {
  title: string;
  description?: string;
  phase?: string;
  features?: string[];
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          phase ? (
            <Badge variant="warning">À livrer en {phase}</Badge>
          ) : null
        }
      />

      <Card className="p-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Construction size={32} />
          </div>
          <h2 className="t-h3 mb-2">Module en cours de construction</h2>
          <p className="t-muted mb-6">
            Les fondations (schéma BDD, permissions, design system) sont en place.
            L'interface fonctionnelle de ce module sera livrée dans la phase suivante.
          </p>
        </div>

        {features && features.length > 0 ? (
          <div className="mx-auto max-w-xl">
            <div className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Fonctionnalités prévues
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-[#22C55E]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
