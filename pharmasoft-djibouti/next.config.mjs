import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // DÉPLOIEMENT LOCAL NATIF (Windows) : on utilise `next start` (npm run start),
  // qui lit automatiquement .env.local et sert depuis .next.
  // NB : `output: "standalone"` est volontairement absent — il est INCOMPATIBLE
  // avec `next start` (le serveur démarre mais ne sert rien) et n'lit pas .env.local.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // DÉPLOIEMENT HORS-LIGNE : aucune image distante. Tout vit dans /public
    // (logos, ordonnances scannées). unoptimized = pas besoin du binaire `sharp`
    // ni d'un service d'optimisation en ligne sur le serveur de la pharmacie.
    unoptimized: true,
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
