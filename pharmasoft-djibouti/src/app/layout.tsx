import type { Metadata } from "next";

// Layout racine "neutre" exigé par Next.js App Router.
// Le vrai layout (i18n, providers, thème, RTL) vit dans app/[locale]/layout.tsx.
export const metadata: Metadata = {
  title: "PHARMASOFT Djibouti",
  description: "Logiciel de gestion de pharmacie — Djibouti",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
