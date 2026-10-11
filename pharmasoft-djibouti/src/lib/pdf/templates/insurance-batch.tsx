import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles, pdfColors } from "@/lib/pdf/styles";
import { fmtMoney, fmtDate } from "@/lib/utils";

export interface InsuranceBatchData {
  pharmacy: { name: string; address: string; city: string; nif: string };
  insurance: { name: string; coverageRate: number; address: string | null };
  periodStart: Date;
  periodEnd: Date;
  claims: Array<{
    id: string;
    saleDate: Date;
    ticketNumber: string;
    clientName: string;
    memberNumber: string;
    saleTotal: number;
    amountClaimed: number;
  }>;
}

// PHARMASOFT — Bordereau mensuel d'envoi à un assureur.
export function InsuranceBatchDocument({ data }: { data: InsuranceBatchData }) {
  const totalClaimed = data.claims.reduce((s, c) => s + c.amountClaimed, 0);
  const totalSales = data.claims.reduce((s, c) => s + c.saleTotal, 0);
  const period = `${fmtDate(data.periodStart)} → ${fmtDate(data.periodEnd)}`;
  const printDate = fmtDate(new Date());

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.logo}>PHARMASOFT</Text>
            <Text style={pdfStyles.brand}>Djibouti</Text>
            <Text style={{ fontSize: 9, marginTop: 8, fontWeight: 600 }}>{data.pharmacy.name}</Text>
            <Text style={{ fontSize: 8, color: pdfColors.muted }}>{data.pharmacy.address}, {data.pharmacy.city}</Text>
            <Text style={{ fontSize: 8, color: pdfColors.muted }}>NIF · {data.pharmacy.nif}</Text>
          </View>
          <View style={pdfStyles.metaBlock}>
            <Text style={pdfStyles.metaLabel}>Bordereau de remboursement</Text>
            <Text style={pdfStyles.metaValue}>{data.insurance.name}</Text>
            <Text style={{ fontSize: 9, color: pdfColors.muted, marginTop: 2 }}>
              Couverture : {data.insurance.coverageRate}%
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.h1}>Bordereau mensuel</Text>
        <Text style={pdfStyles.subtitle}>
          Période : {period} · Édité le {printDate}
        </Text>

        {data.insurance.address ? (
          <View style={{ marginBottom: 16, padding: 10, backgroundColor: pdfColors.bg, borderRadius: 4 }}>
            <Text style={{ fontSize: 8, color: pdfColors.muted }}>Destinataire</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{data.insurance.name}</Text>
            <Text style={{ fontSize: 9, color: pdfColors.muted, marginTop: 1 }}>{data.insurance.address}</Text>
          </View>
        ) : null}

        {/* Table */}
        <View style={pdfStyles.tableHeader}>
          <Text style={{ ...pdfStyles.th, flex: 1.4 }}>Date</Text>
          <Text style={{ ...pdfStyles.th, flex: 1.2 }}>Ticket</Text>
          <Text style={{ ...pdfStyles.th, flex: 2.5 }}>Bénéficiaire</Text>
          <Text style={{ ...pdfStyles.th, flex: 1.5 }}>N° adhérent</Text>
          <Text style={{ ...pdfStyles.th, flex: 1.4, textAlign: "right" }}>Total vente</Text>
          <Text style={{ ...pdfStyles.th, flex: 1.4, textAlign: "right" }}>À rembourser</Text>
        </View>

        {data.claims.length === 0 ? (
          <View style={{ paddingVertical: 30, alignItems: "center" }}>
            <Text style={{ color: pdfColors.muted }}>Aucune claim sur la période.</Text>
          </View>
        ) : (
          data.claims.map((c) => (
            <View key={c.id} style={pdfStyles.tableRow}>
              <Text style={{ ...pdfStyles.td, flex: 1.4 }}>{fmtDate(c.saleDate)}</Text>
              <Text style={{ ...pdfStyles.td, flex: 1.2, fontFamily: "Courier" }}>{c.ticketNumber}</Text>
              <Text style={{ ...pdfStyles.td, flex: 2.5 }}>{c.clientName}</Text>
              <Text style={{ ...pdfStyles.td, flex: 1.5, fontFamily: "Courier", fontSize: 9 }}>{c.memberNumber}</Text>
              <Text style={{ ...pdfStyles.td, flex: 1.4, textAlign: "right", fontFamily: "Courier" }}>
                {fmtMoney(c.saleTotal)}
              </Text>
              <Text style={{ ...pdfStyles.td, flex: 1.4, textAlign: "right", fontFamily: "Courier", fontWeight: 600 }}>
                {fmtMoney(c.amountClaimed)}
              </Text>
            </View>
          ))
        )}

        {/* Totaux */}
        <View style={pdfStyles.grandTotalRow}>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.grandTotalLabel}>TOTAL À REMBOURSER</Text>
            <Text style={{ fontSize: 9, color: pdfColors.muted, marginTop: 2 }}>
              Sur {data.claims.length} ventes · CA total : {fmtMoney(totalSales)}
            </Text>
          </View>
          <Text style={{ ...pdfStyles.grandTotalValue, color: pdfColors.primary }}>{fmtMoney(totalClaimed)}</Text>
        </View>

        {/* Signature */}
        <View style={{ marginTop: 40, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "45%" }}>
            <Text style={{ fontSize: 9, color: pdfColors.muted }}>Cachet et signature pharmacie</Text>
            <View style={{ marginTop: 36, borderTop: `1pt solid ${pdfColors.text}`, paddingTop: 4 }}>
              <Text style={{ fontSize: 8 }}>{data.pharmacy.name}</Text>
            </View>
          </View>
          <View style={{ width: "45%" }}>
            <Text style={{ fontSize: 9, color: pdfColors.muted }}>Réception assureur (date et visa)</Text>
            <View style={{ marginTop: 36, borderTop: `1pt solid ${pdfColors.text}`, paddingTop: 4 }}>
              <Text style={{ fontSize: 8 }}>{data.insurance.name}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text>PHARMASOFT Djibouti · Bordereau {data.insurance.name} · {period}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
