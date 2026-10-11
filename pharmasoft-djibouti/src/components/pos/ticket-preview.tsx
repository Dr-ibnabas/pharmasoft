"use client";

import { Printer, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtDateTime } from "@/lib/utils";

interface TicketProps {
  sale: {
    id: string;
    ticketNumber: string;
    createdAt: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    paymentMethod: string;
    paymentRef: string | null;
    lines: Array<{
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      medicine: { name: string; form: string; dosage: string };
    }>;
    client: { name: string; phone: string } | null;
  };
  pharmacy: { name: string; address: string; city: string; phone: string; nif: string };
  cashierName: string;
  locale: string;
}

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Espèces", CARD: "Carte", DMONEY: "D-Money",
  WAAFI: "Waafi", INSURANCE: "Assurance", CREDIT: "Crédit client",
};

// PHARMASOFT — Aperçu du ticket de caisse (320px, monospace, prêt à imprimer).
export function TicketPreview({ sale, pharmacy, cashierName, locale }: TicketProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/${locale}/pos`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Retour POS
        </Link>
        <div className="flex gap-2">
          <Button onClick={() => window.print()}>
            <Printer size={14} /> Imprimer
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/pos`}>
              <ShoppingCart size={14} /> Nouvelle vente
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid place-items-center rounded-xl border bg-muted/40 p-8 print:bg-white print:border-0 print:p-0">
        <div className="ticket w-[320px] !bg-white">
          {/* En-tête */}
          <div className="text-center">
            <div className="text-[14px] font-bold uppercase">{pharmacy.name}</div>
            <div className="text-[10px]">{pharmacy.address}</div>
            <div className="text-[10px]">{pharmacy.city} · {pharmacy.phone}</div>
            <div className="text-[10px]">NIF : {pharmacy.nif}</div>
          </div>
          <div className="ticket-divider" />
          <div className="flex justify-between text-[11px]">
            <span>Ticket {sale.ticketNumber}</span>
            <span>{fmtDateTime(sale.createdAt)}</span>
          </div>
          <div className="text-[11px]">Caissier : {cashierName}</div>
          {sale.client ? (
            <div className="text-[11px]">Client : {sale.client.name}</div>
          ) : null}
          <div className="ticket-divider" />

          {/* Lignes */}
          {sale.lines.map((l, i) => (
            <div key={i} className="mb-1.5">
              <div className="text-[11px] font-bold uppercase">{l.medicine.name}</div>
              <div className="text-[10px]">{l.medicine.form} {l.medicine.dosage}</div>
              <div className="flex justify-between text-[11px]">
                <span>{l.quantity} × {fmtMoney(l.unitPrice, false)}</span>
                <span>{fmtMoney(l.lineTotal, false)}</span>
              </div>
            </div>
          ))}

          <div className="ticket-divider" />

          {/* Totaux */}
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{fmtMoney(sale.subtotal, false)}</span>
            </div>
            {sale.discountAmount > 0 ? (
              <div className="flex justify-between">
                <span>Remise</span>
                <span>−{fmtMoney(sale.discountAmount, false)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>TVA</span>
              <span>{fmtMoney(sale.taxAmount, false)}</span>
            </div>
          </div>
          <div className="ticket-divider" />
          <div className="flex justify-between text-[14px] font-bold">
            <span>TOTAL</span>
            <span>{fmtMoney(sale.total)}</span>
          </div>
          <div className="ticket-divider" />

          {/* Paiement */}
          <div className="text-[11px]">
            <div className="flex justify-between">
              <span>Mode</span>
              <span className="font-bold">{PAYMENT_LABEL[sale.paymentMethod] ?? sale.paymentMethod}</span>
            </div>
            {sale.paymentRef ? (
              <div className="flex justify-between">
                <span>Référence</span>
                <span>{sale.paymentRef}</span>
              </div>
            ) : null}
          </div>

          <div className="ticket-divider" />
          <div className="text-center text-[10px]">
            <div>Merci de votre visite !</div>
            <div className="mt-1">À conserver pour échange (3 jours)</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .ticket, .ticket * { visibility: visible; }
          .ticket { position: absolute; left: 0; top: 0; box-shadow: none; border-radius: 0; }
          @page { margin: 0; size: 80mm auto; }
        }
      `}</style>
    </div>
  );
}
