import localFont from "next/font/local";

// PHARMASOFT — Polices chargées en LOCAL (next/font/local) pour un fonctionnement
// 100% hors-ligne. Les fichiers .woff2 vivent dans src/app/fonts/ et sont commités
// au repo. AUCUN appel à fonts.googleapis.com / fonts.gstatic.com au build ni au runtime.
//
// Pour (re)générer les .woff2 : `powershell -File scripts/download-fonts.ps1`
// (à lancer une fois sur une machine avec internet).

// Inter — police d'interface principale (FR / EN, latin).
export const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

// JetBrains Mono — chiffres tabulaires, tickets de caisse, code.
export const jetbrainsMono = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/JetBrainsMono-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "Consolas", "monospace"],
});

// Cairo — rendu arabe (RTL). Contient les glyphes arabes + latin.
export const cairo = localFont({
  src: [
    { path: "./fonts/Cairo-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Cairo-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Cairo-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Cairo-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
  fallback: ["Segoe UI", "Tahoma", "sans-serif"],
});
