import { StyleSheet } from "@react-pdf/renderer";

// PHARMASOFT — Styles partagés pour les templates PDF.
// On utilise la police par défaut "Helvetica" (intégrée @react-pdf) pour éviter
// les fetches de Google Fonts au moment de la génération côté serveur.

export const pdfColors = {
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0EA5E9",
  success: "#22C55E",
  danger: "#EF4444",
  warning: "#F59E0B",
  bg: "#F8FAFC",
};

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: pdfColors.text,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottom: `1pt solid ${pdfColors.border}`,
    paddingBottom: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: pdfColors.primary,
    letterSpacing: -0.5,
  },
  brand: {
    fontSize: 8,
    color: pdfColors.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  },
  metaBlock: {
    textAlign: "right",
  },
  metaLabel: {
    fontSize: 8,
    color: pdfColors.subtle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11,
    color: pdfColors.text,
    fontWeight: 600,
    marginTop: 2,
  },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  h2: { fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 16 },
  subtitle: { fontSize: 10, color: pdfColors.muted, marginBottom: 12 },
  table: { width: "100%", marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: `1pt solid ${pdfColors.border}`,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${pdfColors.border}`,
    paddingTop: 6,
    paddingBottom: 6,
  },
  th: {
    fontSize: 8,
    fontWeight: 600,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  td: { fontSize: 10 },
  mono: { fontFamily: "Courier" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 8,
    borderTop: `1pt solid ${pdfColors.text}`,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 12, fontWeight: 700 },
  grandTotalValue: { fontSize: 14, fontWeight: 700, fontFamily: "Courier" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTop: `1pt solid ${pdfColors.border}`,
    paddingTop: 6,
    fontSize: 8,
    color: pdfColors.subtle,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
