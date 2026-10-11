"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// PHARMASOFT — Error boundary pour les routes (auth) (page login).
export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#FEE2E2] text-[#EF4444]">
          <AlertTriangle size={32} />
        </div>
        <h1 className="t-h2 mb-2">Connexion impossible</h1>
        <p className="t-muted mb-6">
          Le service d'authentification est temporairement indisponible. Vérifiez que la base de données est lancée
          puis réessayez.
        </p>
        <Button onClick={reset}>
          <RefreshCw size={14} /> Réessayer
        </Button>
      </div>
    </main>
  );
}
