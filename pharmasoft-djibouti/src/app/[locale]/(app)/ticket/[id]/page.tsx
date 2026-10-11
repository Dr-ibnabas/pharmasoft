import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketPreview } from "@/components/pos/ticket-preview";

// PHARMASOFT — Page d'aperçu d'un ticket de caisse.
export default async function TicketPage({ params }: { params: { locale: string; id: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const [sale, setting] = await Promise.all([
    prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { name: true, phone: true } },
        user: { select: { name: true } },
        lines: {
          include: { medicine: { select: { name: true, form: true, dosage: true } } },
        },
      },
    }),
    prisma.setting.findFirst(),
  ]);

  if (!sale) notFound();

  const pharmacy = setting
    ? {
        name: setting.pharmacyName,
        address: setting.address,
        city: setting.city,
        phone: setting.phone,
        nif: setting.nif,
      }
    : {
        name: "Pharmacie",
        address: "",
        city: "",
        phone: "",
        nif: "",
      };

  return (
    <TicketPreview
      sale={{
        id: sale.id,
        ticketNumber: sale.ticketNumber,
        createdAt: sale.createdAt.toISOString(),
        subtotal: sale.subtotal,
        discountAmount: sale.discountAmount,
        taxAmount: sale.taxAmount,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        paymentRef: sale.paymentRef,
        lines: sale.lines.map((l) => ({
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          medicine: l.medicine,
        })),
        client: sale.client,
      }}
      pharmacy={pharmacy}
      cashierName={sale.user.name}
      locale={params.locale}
    />
  );
}
