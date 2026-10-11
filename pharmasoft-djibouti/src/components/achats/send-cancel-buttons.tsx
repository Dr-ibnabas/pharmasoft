"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// PHARMASOFT — Boutons "Envoyer" / "Annuler" pour un bon de commande en brouillon.
export function SendCancelButtons({ poId }: { poId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "SENT" | "CANCELLED") {
    setBusy(true);
    try {
      const res = await fetch(`/api/purchase-orders/${poId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success(status === "SENT" ? "Commande envoyée" : "Commande annulée");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setStatus("SENT")} disabled={busy}>
        <Send size={14} /> Marquer envoyée
      </Button>
      <Button variant="ghost" onClick={() => setStatus("CANCELLED")} disabled={busy}>
        <X size={14} /> Annuler
      </Button>
    </>
  );
}
