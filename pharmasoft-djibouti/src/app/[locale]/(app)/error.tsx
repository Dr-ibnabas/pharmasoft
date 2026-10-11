"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// PHARMASOFT — Error boundary pour les routes (app).
// Capte les erreurs serveur ET client. Le shell (sidebar/topbar) reste affiché.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[App error boundary]", error);
  }, [error]);

  return (
    <Card className="p-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#FEE2E2] text-[#EF4444]">
          <AlertTriangle size={32} />
        </div>
        <h2 className="t-h2 mb-2">Une erreur est survenue</h2>
        <p className="t-muted mb-2">
          Quelque chose s'est mal passé pendant le chargement de cette page.
        </p>
        {error.digest ? (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            Réf. erreur : <span className="select-all">{error.digest}</span>
          </p>
        ) : null}
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCw size={14} /> Réessayer
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
        </div>
      </div>
    </Card>
  );
}
