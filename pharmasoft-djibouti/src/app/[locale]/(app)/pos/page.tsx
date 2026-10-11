import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PosScreen } from "@/components/pos/pos-screen";

const CATEGORIES = [
  { id: "ANTALGIQUE", name: "Antalgiques", color: "#EF4444" },
  { id: "ANTIBIOTIQUE", name: "Antibiotiques", color: "#0EA5E9" },
  { id: "RESPIRATOIRE", name: "Respiratoire", color: "#8B5CF6" },
  { id: "DIGESTIF", name: "Digestif", color: "#10B981" },
  { id: "CARDIO", name: "Cardio", color: "#EC4899" },
  { id: "VITAMINES", name: "Vitamines", color: "#F59E0B" },
  { id: "PEDIATRIE", name: "Pédiatrie", color: "#06B6D4" },
];

// PHARMASOFT — Page POS (server) qui charge les données et délègue au client component.
export default async function PosPage({ params }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const [medicines, clients, setting] = await Promise.all([
    prisma.medicine.findMany({
      where: { deletedAt: null },
      include: { lots: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        phone: true,
        tier: true,
        points: true,
        insuranceMembers: {
          where: { isActive: true },
          select: { insurance: { select: { name: true, coverageRate: true } } },
          take: 1,
        },
      },
      take: 200,
    }),
    prisma.setting.findFirst({ select: { tvaRate: true } }),
  ]);

  const medicineOptions = medicines.map((m) => ({
    id: m.id,
    code: m.code,
    name: m.name,
    dci: m.dci,
    form: m.form,
    laboratory: m.laboratory,
    category: m.category,
    sellPrice: m.sellPrice,
    stock: m.lots.reduce((s, l) => s + l.quantity, 0),
    requiresPrescription: m.requiresPrescription,
  }));

  // Aplatit l'assurance active du client (tiers-payant au POS)
  const clientOptions = clients.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    tier: c.tier,
    points: c.points,
    insuranceName: c.insuranceMembers[0]?.insurance.name ?? null,
    coverageRate: c.insuranceMembers[0]?.insurance.coverageRate ?? null,
  }));

  return (
    <PosScreen
      medicines={medicineOptions}
      clients={clientOptions}
      categories={CATEGORIES}
      role={session.user.role}
      locale={params.locale}
      tvaRate={setting ? Number(setting.tvaRate) : 0.1}
    />
  );
}
