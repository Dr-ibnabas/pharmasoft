import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles, pdfColors } from "@/lib/pdf/styles";
import { fmtMoney } from "@/lib/utils";

export interface ZJournalierData {
  pharmacy: { name: string; address: string; city: string; nif: string };
  date: Date;
  cashier: string;
  openingFloat: number;
  closedAt: Date | null;
  expectedAmount: number;
  countedAmount: number | null;
  discrepancy: number | null;
  paymentBreakdown: Array<{ method: string; count: number; total: number }>;
  saleCount: number;
  totalRevenue: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Espèces", CARD: "Carte bancaire", DMONEY: "D-Money",
  WAAFI: "Waafi", INSURANCE: "Assurance", CREDIT: "Crédit client",
};

// PHARMASOFT — Template PDF "Z journalier" — rapport de fin de session caisse.
export function ZJournalierDocument({ data }: { data: ZJournalierData }) {
  const printDate = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const sessionDate = data.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.logo}>PHARMASOFT</Text>
            <Text style={pdfStyles.brand}>Djibouti</Text>
            <Text style={{ fontSize: 9, marginTop: 8, fontWeight: 600 }}>{data.pharmacy.name}</Text>
            <Text style={{ fontSize: 8, color: pdfColors.muted }}>{data.pharmacy.address}</Text>
            <Text style={{ fontSize: 8, color: pdfColors.muted }}>{data.pharmacy.city}</Text>
            <Text style={{ fontSize: 8, color: pdfColors.muted }}>NIF · {data.pharmacy.nif}</Text>
          </View>
          <View style={pdfStyles.metaBlock}>
            <Text style={pdfStyles.metaLabel}>Z journalier</Text>
            <Text style={pdfStyles.metaValue}>{sessionDate}</Text>
            <Text style={{ ...pdfStyles.metaLabel, marginTop: 8 }}>Caissier</Text>
            <Text style={pdfStyles.metaValue}>{data.cashier}</Text>
          </View>
        </View>

        <Text style={pdfStyles.h1}>Rapport de fin de session</Text>
        <Text style={pdfStyles.subtitle}>
          Document officiel à conserver — généré le {printDate}
        </Text>

        {/* KPI principaux */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Tickets", value: String(data.saleCount) },
            { label: "CA brut", value: fmtMoney(data.totalRevenue) },
            { label: "Fond initial", value: fmtMoney(data.openingFloat) },
          ].map((k, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                padding: 10,
                border: `1pt solid ${pdfColors.border}`,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 8, color: pdfColors.muted, textTransform: "uppercase" }}>{k.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: 700, marginTop: 4, fontFamily: "Courier" }}>{k.value}</Text>
            </View>
          ))}
        </View>

        {/* Ventilation paiements */}
        <Text style={pdfStyles.h2}>Ventilation par mode de paiement</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={{ ...pdfStyles.th, flex: 2 }}>Mode</Text>
          <Text style={{ ...pdfStyles.th, flex: 1, textAlign: "right" }}>Tickets</Text>
          <Text style={{ ...pdfStyles.th, flex: 1, textAlign: "right" }}>Montant</Text>
        </View>
        {data.paymentBreakdown.map((p) => (
          <View key={p.method} style={pdfStyles.tableRow}>
            <Text style={{ ...pdfStyles.td, flex: 2 }}>{PAYMENT_LABELS[p.method] ?? p.method}</Text>
            <Text style={{ ...pdfStyles.td, flex: 1, textAlign: "right", fontFamily: "Courier" }}>{p.count}</Text>
            <Text style={{ ...pdfStyles.td, flex: 1, textAlign: "right", fontFamily: "Courier" }}>{fmtMoney(p.total)}</Text>
          </View>
        ))}

        {/* Récap caisse */}
        <Text style={pdfStyles.h2}>Récapitulatif caisse</Text>
        <View style={pdfStyles.totalsRow}>
          <Text>Fond d'ouverture</Text>
          <Text style={pdfStyles.mono}>{fmtMoney(data.openingFloat)}</Text>
        </View>
        <View style={pdfStyles.totalsRow}>
          <Text>Espèces encaissées du jour</Text>
          <Text style={pdfStyles.mono}>
            {fmtMoney((data.paymentBreakdown.find((p) => p.method === "CASH")?.total) ?? 0)}
          </Text>
        </View>
        <View style={{ ...pdfStyles.totalsRow, borderTop: `0.5pt solid ${pdfColors.border}`, paddingTop: 6 }}>
          <Text style={{ fontWeight: 600 }}>Montant théorique attendu</Text>
          <Text style={{ ...pdfStyles.mono, fontWeight: 600 }}>{fmtMoney(data.expectedAmount)}</Text>
        </View>
        {data.countedAmount !== null ? (
          <>
            <View style={pdfStyles.totalsRow}>
              <Text>Montant compté en caisse</Text>
              <Text style={pdfStyles.mono}>{fmtMoney(data.countedAmount)}</Text>
            </View>
            <View style={pdfStyles.grandTotalRow}>
              <Text style={pdfStyles.grandTotalLabel}>Écart constaté</Text>
              <Text
                style={{
                  ...pdfStyles.grandTotalValue,
                  color:
                    data.discrepancy === 0
                      ? pdfColors.success
                      : Math.abs(data.discrepancy ?? 0) <= 500
                        ? pdfColors.warning
                        : pdfColors.danger,
                }}
              >
                {(data.discrepancy ?? 0) === 0
                  ? "0 Fdj"
                  : `${(data.discrepancy ?? 0) > 0 ? "−" : "+"}${fmtMoney(Math.abs(data.discrepancy ?? 0))}`}
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ marginTop: 16, color: pdfColors.warning, fontSize: 10 }}>
            Session non encore clôturée — montant compté à saisir.
          </Text>
        )}

        {/* Signature */}
        <View style={{ marginTop: 40, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "45%" }}>
            <Text style={{ fontSize: 9, color: pdfColors.muted }}>Visa du caissier</Text>
            <View
              style={{
                marginTop: 24,
                borderTop: `1pt solid ${pdfColors.text}`,
                paddingTop: 4,
              }}
            >
              <Text style={{ fontSize: 8 }}>{data.cashier}</Text>
            </View>
          </View>
          <View style={{ width: "45%" }}>
            <Text style={{ fontSize: 9, color: pdfColors.muted }}>Visa du pharmacien titulaire</Text>
            <View
              style={{
                marginTop: 24,
                borderTop: `1pt solid ${pdfColors.text}`,
                paddingTop: 4,
              }}
            >
              <Text style={{ fontSize: 8 }}>Signature</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text>PHARMASOFT Djibouti · Z journalier {sessionDate}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
