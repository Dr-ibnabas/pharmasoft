# PHARMASOFT DJIBOUTI — Dockerfile multi-stage (Next.js 14 standalone)
# Optimisé pour : petite image runtime, build reproductible, prisma generate en dépendances.

# ─── Stage 1 : dépendances ────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Installation des dépendances en exploitant le cache Docker
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ─── Stage 2 : build ──────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js en mode standalone (output: 'standalone')
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ─── Stage 3 : runtime ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Application complète (sans standalone) — on lance `next start` qui sert depuis .next.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

USER nextjs

EXPOSE 3000

# Healthcheck léger (l'endpoint session répond même non authentifié)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/auth/session || exit 1

# next start (via npm) — lit PORT/HOSTNAME depuis l'environnement, écoute 0.0.0.0
CMD ["npm", "run", "start"]
