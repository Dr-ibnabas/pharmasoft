import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

// PHARMASOFT — Helper pour rendre un Document en Buffer côté serveur.
// renderToBuffer est l'API recommandée par @react-pdf/renderer pour Node.
export async function renderPdfBuffer(element: React.ReactElement<DocumentProps>): Promise<Buffer> {
  return await renderToBuffer(element);
}

/** Headers pour réponse HTTP de téléchargement PDF. */
export function pdfHeaders(filename: string): HeadersInit {
  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    "Cache-Control": "no-store",
  };
}
