import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@prisma/client";

// PHARMASOFT — Helpers de calcul pour les dashboards.
// Toutes les agrégations passent par Prisma. Les fonctions sont conçues pour être
// appelées depuis des Server Components (pas d'effet de bord, pas de cache mutate).

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** [start, end[ d'une journée donnée. */
function dayRange(offsetDays = 0): { start: Date; end: Date } {
  const today = startOfDay(new Date());
  const start = new Date(today.getTime() + offsetDays * DAY_MS);
  const end = new Date(start.getTime() + DAY_MS);
  return { start, end };
}

// ─── KPI globaux (TITULAIRE) ─────────────────────────────────

export async function getRevenueKpis() {
  const today = dayRange(0);
  const yesterday = dayRange(-1);
  const weekStart = new Date(today.start.getTime() - 7 * DAY_MS);
  const monthStart = new Date(today.start.getTime() - 30 * DAY_MS);
  const prevWeekStart = new Date(today.start.getTime() - 14 * DAY_MS);
  const prevWeekEnd = new Date(today.start.getTime() - 7 * DAY_MS);
  const prevMonthStart = new Date(today.start.getTime() - 60 * DAY_MS);
  const prevMonthEnd = new Date(today.start.getTime() - 30 * DAY_MS);

  const [
    todayAgg,
    yesterdayAgg,
    weekAgg,
    prevWeekAgg,
    monthAgg,
    prevMonthAgg,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: today.start, lt: today.end }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: yesterday.start, lt: yesterday.end }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: weekStart, lt: today.end }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: prevWeekStart, lt: prevWeekEnd }, status: "COMPLETED" },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: monthStart, lt: today.end }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: prevMonthStart, lt: prevMonthEnd }, status: "COMPLETED" },
      _sum: { total: true },
    }),
  ]);

  const todayTotal = todayAgg._sum.total ?? 0;
  const yesterdayTotal = yesterdayAgg._sum.total ?? 0;
  const weekTotal = weekAgg._sum.total ?? 0;
  const prevWeekTotal = prevWeekAgg._sum.total ?? 0;
  const monthTotal = monthAgg._sum.total ?? 0;
  const prevMonthTotal = prevMonthAgg._sum.total ?? 0;
  const monthCount = monthAgg._count;
  const avgBasket = monthCount > 0 ? Math.round(monthTotal / monthCount) : 0;

  const pct = (cur: number, prev: number): { delta: string; dir: "up" | "down" } => {
    if (prev === 0) return { delta: cur > 0 ? "+100%" : "0%", dir: cur >= 0 ? "up" : "down" };
    const ratio = ((cur - prev) / prev) * 100;
    return {
      delta: `${ratio >= 0 ? "+" : ""}${ratio.toFixed(1)}%`,
      dir: ratio >= 0 ? "up" : "down",
    };
  };

  return {
    today: { total: todayTotal, ...pct(todayTotal, yesterdayTotal) },
    week: { total: weekTotal, ...pct(weekTotal, prevWeekTotal) },
    month: { total: monthTotal, ...pct(monthTotal, prevMonthTotal) },
    avgBasket: { value: avgBasket, ...pct(avgBasket, 0) },
  };
}

/** Ventes par jour, sur les 7 derniers jours (incluant aujourd'hui). */
export async function getSalesLast7Days(): Promise<{ label: string; value: number; highlight?: boolean }[]> {
  const today = dayRange(0);
  const start = new Date(today.start.getTime() - 6 * DAY_MS);
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lt: today.end }, status: "COMPLETED" },
    select: { total: true, createdAt: true },
  });
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start.getTime() + i * DAY_MS);
    return { date: d, total: 0 };
  });
  for (const s of sales) {
    const idx = Math.floor((startOfDay(s.createdAt).getTime() - start.getTime()) / DAY_MS);
    if (idx >= 0 && idx < days.length) {
      days[idx]!.total += s.total;
    }
  }
  const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  return days.map((d, i) => ({
    label: fmt.format(d.date).replace(/\./g, "").replace(/^./, (c) => c.toUpperCase()),
    value: d.total,
    highlight: i === days.length - 1,
  }));
}

/** Mix par catégorie, sur les 30 derniers jours. */
export async function getCategoryMix(): Promise<{ label: string; value: number; color: string }[]> {
  const since = new Date(Date.now() - 30 * DAY_MS);
  const rows = await prisma.saleLine.findMany({
    where: { sale: { createdAt: { gte: since }, status: "COMPLETED" } },
    select: { lineTotal: true, medicine: { select: { category: true } } },
  });
  const totals = new Map<string, number>();
  for (const r of rows) {
    const key = r.medicine.category;
    totals.set(key, (totals.get(key) ?? 0) + r.lineTotal);
  }
  const COLORS: Record<string, string> = {
    ANTALGIQUE: "#EF4444",
    ANTIBIOTIQUE: "#0EA5E9",
    RESPIRATOIRE: "#8B5CF6",
    DIGESTIF: "#10B981",
    CARDIO: "#EC4899",
    VITAMINES: "#F59E0B",
    PEDIATRIE: "#06B6D4",
    ANTI_INFLAMMATOIRE: "#22C55E",
    SOMNIFERE: "#64748B",
    ANTIDIABETIQUE: "#A855F7",
    ANTISPASMODIQUE: "#14B8A6",
    AUTRE: "#94A3B8",
  };
  const LABELS: Record<string, string> = {
    ANTALGIQUE: "Antalgiques",
    ANTIBIOTIQUE: "Antibiotiques",
    RESPIRATOIRE: "Respiratoire",
    DIGESTIF: "Digestif",
    CARDIO: "Cardio",
    VITAMINES: "Vitamines",
    PEDIATRIE: "Pédiatrie",
    ANTI_INFLAMMATOIRE: "Anti-inflam.",
    SOMNIFERE: "Somnifère",
    ANTIDIABETIQUE: "Antidiabét.",
    ANTISPASMODIQUE: "Antispasm.",
    AUTRE: "Autres",
  };
  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([cat, value]) => ({
      label: LABELS[cat] ?? cat,
      value,
      color: COLORS[cat] ?? "#94A3B8",
    }));
}

/** Top 5 médicaments les plus vendus aujourd'hui. */
export async function getTopMedicinesToday(limit = 5) {
  const today = dayRange(0);
  const rows = await prisma.saleLine.groupBy({
    by: ["medicineId"],
    where: { sale: { createdAt: { gte: today.start, lt: today.end }, status: "COMPLETED" } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  if (rows.length === 0) {
    // Fallback : top sur 7 jours s'il n'y a rien aujourd'hui (utile pour le seed).
    const since = new Date(today.start.getTime() - 7 * DAY_MS);
    const r = await prisma.saleLine.groupBy({
      by: ["medicineId"],
      where: { sale: { createdAt: { gte: since }, status: "COMPLETED" } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });
    rows.push(...r);
  }
  const meds = await prisma.medicine.findMany({
    where: { id: { in: rows.map((r) => r.medicineId) } },
    select: { id: true, name: true },
  });
  const byId = new Map(meds.map((m) => [m.id, m.name]));
  return rows.map((r) => ({
    medicineId: r.medicineId,
    name: byId.get(r.medicineId) ?? "Inconnu",
    qty: r._sum.quantity ?? 0,
    revenue: r._sum.lineTotal ?? 0,
  }));
}

/** Compteurs d'alertes (péremption, stock, rupture). */
export async function getStockAlerts() {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * DAY_MS);
  const in90 = new Date(now.getTime() + 90 * DAY_MS);

  const [expiryUrgent, expiryNear, lowStock, outOfStock] = await Promise.all([
    prisma.lot.count({
      where: { expiryDate: { gte: now, lt: in30 }, quantity: { gt: 0 } },
    }),
    prisma.lot.count({
      where: { expiryDate: { gte: in30, lt: in90 }, quantity: { gt: 0 } },
    }),
    prisma.medicine.count({
      where: {
        deletedAt: null,
        lots: {
          // Au moins un lot positif et tout est en dessous du seuil — approx :
          // on prend les médicaments dont la somme des quantités est <= seuil et > 0.
          some: { quantity: { gt: 0, lte: 20 } },
        },
      },
    }),
    prisma.medicine.count({
      where: {
        deletedAt: null,
        lots: { every: { quantity: 0 } },
      },
    }),
  ]);

  return {
    expiryUrgent,
    expiryNear,
    lowStock,
    outOfStock,
    total: expiryUrgent + expiryNear + lowStock + outOfStock,
  };
}

/** État de la session de caisse courante (la plus récente non close). */
export async function getCurrentCashSession() {
  const session = await prisma.cashSession.findFirst({
    where: { closedAt: null },
    orderBy: { openedAt: "desc" },
    include: {
      user: { select: { name: true } },
      _count: { select: { sales: true } },
    },
  });
  if (!session) return null;

  // Calcul du montant théorique : floor + somme des ventes cash de la session.
  const cashSales = await prisma.sale.aggregate({
    where: { cashSessionId: session.id, paymentMethod: "CASH", status: "COMPLETED" },
    _sum: { total: true },
  });
  return {
    id: session.id,
    openedAt: session.openedAt,
    cashierName: session.user.name,
    transactionsCount: session._count.sales,
    expectedAmount: session.openingFloat + (cashSales._sum.total ?? 0),
  };
}

// ─── KPI VENDEUR (sans CA) ────────────────────────────────────

export async function getVendorActivity(userId: string) {
  const today = dayRange(0);
  const yesterday = dayRange(-1);
  const [todaySales, yesterdaySales, todayLines, recent] = await Promise.all([
    prisma.sale.aggregate({
      where: { userId, createdAt: { gte: today.start, lt: today.end }, status: "COMPLETED" },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { userId, createdAt: { gte: yesterday.start, lt: yesterday.end }, status: "COMPLETED" },
      _count: true,
    }),
    prisma.saleLine.aggregate({
      where: { sale: { userId, createdAt: { gte: today.start, lt: today.end }, status: "COMPLETED" } },
      _sum: { quantity: true },
    }),
    prisma.sale.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        ticketNumber: true,
        createdAt: true,
        client: { select: { name: true } },
        lines: {
          take: 3,
          select: { medicine: { select: { name: true } }, quantity: true },
        },
      },
    }),
  ]);
  return {
    todayTickets: todaySales._count,
    yesterdayTickets: yesterdaySales._count,
    todayUnits: todayLines._sum.quantity ?? 0,
    recentSales: recent,
  };
}

// ─── KPI CAISSIER ────────────────────────────────────────────

export async function getCashierTodayBreakdown() {
  const today = dayRange(0);
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: today.start, lt: today.end }, status: "COMPLETED" },
    select: { id: true, total: true, paymentMethod: true, ticketNumber: true, createdAt: true, client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byMethod = new Map<PaymentMethod, { count: number; total: number }>();
  for (const s of sales) {
    const prev = byMethod.get(s.paymentMethod) ?? { count: 0, total: 0 };
    prev.count += 1;
    prev.total += s.total;
    byMethod.set(s.paymentMethod, prev);
  }
  const METHOD_COLOR: Record<PaymentMethod, string> = {
    CASH: "#10B981",
    CARD: "#0EA5E9",
    DMONEY: "#F59E0B",
    WAAFI: "#8B5CF6",
    INSURANCE: "#EC4899",
    CREDIT: "#64748B",
    MIXED: "#94A3B8",
  };
  const METHOD_LABEL: Record<PaymentMethod, string> = {
    CASH: "Espèces",
    CARD: "Carte",
    DMONEY: "D-Money",
    WAAFI: "Waafi",
    INSURANCE: "Assurance",
    CREDIT: "Crédit",
    MIXED: "Mixte",
  };
  const breakdown = Array.from(byMethod.entries()).map(([method, v]) => ({
    label: METHOD_LABEL[method],
    value: v.total,
    count: v.count,
    color: METHOD_COLOR[method],
  }));
  const totalAmount = sales.reduce((s, x) => s + x.total, 0);

  return {
    totalAmount,
    transactionsCount: sales.length,
    breakdown,
    latestSales: sales.slice(0, 5),
  };
}

// ─── KPI SUPER_ADMIN ─────────────────────────────────────────

export async function getSystemHealth() {
  const since24h = new Date(Date.now() - DAY_MS);
  const [users, activeUsers, recentLogins, auditPreview, medCount, saleCount, clientCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.auditLog.findMany({
      where: { action: "LOGIN", createdAt: { gte: since24h } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
    prisma.medicine.count({ where: { deletedAt: null } }),
    prisma.sale.count(),
    prisma.client.count({ where: { deletedAt: null } }),
  ]);

  return {
    users: { total: users, active: activeUsers, inactive: users - activeUsers },
    recentLogins,
    auditPreview,
    counts: { medicines: medCount, sales: saleCount, clients: clientCount },
  };
}
