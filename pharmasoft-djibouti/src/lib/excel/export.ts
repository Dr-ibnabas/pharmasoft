import * as XLSX from "xlsx";

// PHARMASOFT — Wrapper minimaliste autour de xlsx pour générer un workbook
// avec une ou plusieurs feuilles, formatage par défaut, retour en Buffer.

export interface SheetData {
  name: string;
  rows: Record<string, string | number | null>[];
  /** Largeurs des colonnes (en caractères, ~7px chacun). */
  colWidths?: number[];
}

export function buildWorkbook(sheets: SheetData[]): Buffer {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows);
    if (s.colWidths) {
      ws["!cols"] = s.colWidths.map((w) => ({ wch: w }));
    }
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function xlsxHeaders(filename: string): HeadersInit {
  return {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    "Cache-Control": "no-store",
  };
}
