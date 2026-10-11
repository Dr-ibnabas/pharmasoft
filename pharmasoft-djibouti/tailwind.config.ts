import type { Config } from "tailwindcss";

// PHARMASOFT DJIBOUTI — Tailwind config aligné sur les tokens de la maquette
// (extraits de styles.css :3-46). Toutes les couleurs métier passent par les variables CSS
// (cf. src/app/globals.css) pour permettre le switch clair/sombre via next-themes.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        // shadcn — tokens sémantiques (mappés depuis globals.css)
        border: "hsl(var(--border-hsl) / <alpha-value>)",
        input: "hsl(var(--border-hsl) / <alpha-value>)",
        ring: "hsl(var(--ring-hsl) / <alpha-value>)",
        background: "hsl(var(--bg-hsl) / <alpha-value>)",
        foreground: "hsl(var(--text-hsl) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary-hsl) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground-hsl) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary-hsl) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground-hsl) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--danger-hsl) / <alpha-value>)",
          foreground: "hsl(0 0% 100% / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--bg-sunken-hsl) / <alpha-value>)",
          foreground: "hsl(var(--text-muted-hsl) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--bg-sunken-hsl) / <alpha-value>)",
          foreground: "hsl(var(--text-hsl) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--bg-elev-hsl) / <alpha-value>)",
          foreground: "hsl(var(--text-hsl) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--bg-elev-hsl) / <alpha-value>)",
          foreground: "hsl(var(--text-hsl) / <alpha-value>)",
        },
        // PHARMASOFT — couleurs métier (utilisables en `bg-pharma-primary`, etc.)
        pharma: {
          primary: "#0EA5E9",
          "primary-600": "#0284C7",
          "primary-50": "#E0F2FE",
          secondary: "#10B981",
          "secondary-50": "#D1FAE5",
          danger: "#EF4444",
          "danger-50": "#FEE2E2",
          warning: "#F59E0B",
          "warning-50": "#FEF3C7",
          success: "#22C55E",
          "success-50": "#DCFCE7",
        },
        // Couleurs des 4 rôles (cf. DECISIONS.md §Rôles)
        role: {
          "super-admin": "#8B5CF6",      // violet
          titulaire: "#1E40AF",          // bleu marine
          vendeur: "#10B981",            // vert
          caissier: "#F59E0B",           // orange
        },
        // Catégories médicaments (cf. data.jsx CATEGORIES)
        cat: {
          antal: "#EF4444",
          antib: "#0EA5E9",
          resp: "#8B5CF6",
          dig: "#10B981",
          cardio: "#EC4899",
          vit: "#F59E0B",
          ped: "#06B6D4",
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        "2xl": "var(--r-2xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        // Echelle typographique de la maquette
        display: ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["32px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
      },
      boxShadow: {
        "p-sm": "var(--shadow-sm)",
        "p-md": "var(--shadow-md)",
        "p-lg": "var(--shadow-lg)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
