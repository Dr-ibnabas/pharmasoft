# PHARMASOFT DJIBOUTI

Logiciel de gestion de pharmacie pour le marché djiboutien — interface web desktop multilingue (FR / AR / EN avec RTL), 4 rôles avec permissions strictes, POS avec paiements locaux, gestion complète médicaments / stock / clients / ordonnances.

> **Statut actuel (2026-05-31) — Phases P0 à P7 livrées (toutes complètes).**
> Application complète : auth + 4 dashboards + médicaments/stock/clients/ordonnances + POS + caisse + utilisateurs CRUD + audit + paramètres + fournisseurs + assurances + rapports PDF/Excel + Docker Compose pour le déploiement.
>
> **Adaptée pour un fonctionnement 100% HORS-LIGNE** sur un serveur local de pharmacie
> (multi-postes LAN). Voir la section [INSTALLATION EN PHARMACIE (hors-ligne)](#installation-en-pharmacie-hors-ligne)
> et le journal [CHANGES-OFFLINE.md](./CHANGES-OFFLINE.md).

---

# INSTALLATION EN PHARMACIE (hors-ligne)

Procédure pour installer PHARMASOFT sur un **serveur local sans internet**, accessible par
plusieurs postes (comptoir, caisses, bureau) via le réseau local.

> ## ⭐ Méthode la plus simple : l'installeur unique `PHARMASOFT-Setup.exe`
> Un seul fichier `.exe` qui **embarque tout** (l'application + Node.js + PostgreSQL).
> Sur le serveur de la pharmacie : **double-clic → Suivant → Installer**. Il configure
> automatiquement la base, le service, le démarrage au boot, le pare-feu et l'icône Bureau.
> Aucune connexion internet, aucune commande à taper.
>
> - **Construire l'installeur** (sur votre PC de dev, une fois) :
>   `powershell -File installer\build-installer.ps1` → produit `installer\out\PHARMASOFT-Setup.exe`.
> - **Côté pharmacie** : copier ce `.exe` sur une clé USB → double-clic sur le serveur. C'est tout.
>
> Les étapes manuelles ci-dessous (méthode B) restent utiles pour comprendre / dépanner.

```
                 Réseau local (LAN) de la pharmacie
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │  Poste 1     │   │  Poste 2     │   │  Poste 3     │   (navigateurs)
   │  Comptoir    │   │  Caisse      │   │  Bureau      │
   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
          │ http://192.168.1.10:3000           │
          └──────────────────┼─────────────────┘
                     ┌────────┴─────────┐
                     │  PC SERVEUR      │  ← toujours allumé, sur onduleur
                     │  Windows         │
                     │  PostgreSQL +    │
                     │  PHARMASOFT      │
                     └──────────────────┘
```

### 1. Prérequis matériel

- **PC serveur** : Windows 10/11 (ou Server), 8 Go RAM mini, SSD, **IP fixe** sur le LAN.
  À laisser **toujours allumé**.
- **Onduleur (UPS)** sur le serveur — protège PostgreSQL des coupures de courant (Djibouti).
- **Switch/routeur** pour le réseau local (les postes et le serveur sur le même réseau).
- **Disque externe / clé USB** pour les sauvegardes hors du serveur.
- Postes clients : n'importe quel PC avec un navigateur récent (Chrome/Edge/Firefox).

### 2. Installer PostgreSQL sur le serveur

1. Copier l'installeur **PostgreSQL 16** (téléchargé au préalable) sur le serveur.
2. Installer (« pour tous les utilisateurs »), mot de passe du super-utilisateur `postgres`.
   Noter le **dossier `bin`** (ex : `C:\Program Files\PostgreSQL\16\bin`).
3. Créer la base :
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres pharmasoft
   ```

### 3. Installer Node.js sur le serveur

1. Copier l'installeur **Node.js LTS (≥ 18.17)** sur le serveur.
2. Installer **« pour tous les utilisateurs »** (ajoute Node au PATH système — requis pour
   le démarrage automatique).
3. Vérifier : `node -v` et `npm -v`.

### 4. Copier le projet et configurer `.env.local`

1. Copier le dossier `pharmasoft-djibouti/` sur le serveur (ex : `C:\PHARMASOFT\`).
2. Créer la configuration locale :
   ```powershell
   cd C:\PHARMASOFT\pharmasoft-djibouti
   Copy-Item .env.local.example .env.local
   ```
3. Éditer `.env.local` :
   - `DATABASE_URL` → `postgresql://postgres:VOTRE_MDP@localhost:5432/pharmasoft?schema=public`
   - `AUTH_SECRET` → une clé aléatoire :
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - **Ne PAS définir `AUTH_URL`** (le laisser commenté) : `trustHost` gère
     automatiquement l'accès depuis tous les postes du réseau. Une URL fixe
     casserait l'accès depuis les autres adresses.
   - `PG_BIN_DIR` → le dossier `bin` de PostgreSQL
   - `BACKUP_DIR` → ex : `D:\PHARMASOFT-BACKUPS` (disque externe)

### 5. Migration + seed de la base

Tout en une commande :
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-offline.ps1
```
(installe les dépendances → `prisma generate` → `prisma migrate deploy` → seed → build)

> Pour ne PAS charger les données de démonstration : ajouter `-SkipSeed`.

Comptes créés par le seed (à **changer en production**) :

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | `admin@pharmasoft.dj` | `Admin123!` |
| Titulaire | `titulaire@pharmasoft.dj` | `Titulaire123!` |
| Vendeur | `vendeur@pharmasoft.dj` | `Vendeur123!` |
| Caissier | `caissier@pharmasoft.dj` | `Caissier123!` |

### 6. Build et lancement en production

Le build est déjà fait par `setup-offline.ps1`. Lancer le serveur :
```powershell
npm run start
# ou, avec affichage des adresses d'accès :
powershell -ExecutionPolicy Bypass -File scripts\start-server.ps1
```
Le serveur écoute sur **`0.0.0.0:3000`** (toutes les interfaces réseau).
Test sur le serveur : http://localhost:3000

### 7. Démarrage automatique au boot du serveur

**Option A — Tâche planifiée Windows (recommandé, sans rien à télécharger) :**
```powershell
# En tant qu'ADMINISTRATEUR, une seule fois :
powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1
```
PHARMASOFT démarrera automatiquement à chaque démarrage du serveur (compte SYSTEM,
redémarrage auto en cas de plantage).

**Option B — PM2 :**
```powershell
npm install -g pm2 pm2-windows-startup
pm2 start ecosystem.config.js
pm2 save
pm2-startup install
```

### 8. Configuration des postes clients

1. Trouver l'IP du serveur (sur le serveur) :
   ```powershell
   ipconfig    # noter l'adresse IPv4, ex : 192.168.1.10
   ```
   (le script `start-server.ps1` affiche aussi directement les URL d'accès)
2. **Autoriser le port dans le pare-feu Windows du serveur** (une fois) :
   ```powershell
   New-NetFirewallRule -DisplayName "PHARMASOFT 3000" -Direction Inbound `
     -Protocol TCP -LocalPort 3000 -Action Allow
   ```
3. Sur chaque poste, ouvrir le navigateur sur **`http://192.168.1.10:3000`**
   (remplacer par l'IP réelle).
4. **Raccourci Bureau (icône, mode « application »)** — sur chaque poste :
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\creer-raccourci-bureau.ps1 -Poste -ServeurIP 192.168.1.10 -Port 3000
   ```
   Crée une icône **PHARMASOFT** qui ouvre l'app dans une fenêtre dédiée (sans barre
   d'adresse), comme un vrai logiciel. Sur le **serveur**, lancer le même script **sans**
   `-Poste` (l'icône démarre le serveur + ouvre l'app).

> **Important — l'app n'est PAS un `.exe`.** C'est une application web : un serveur tourne
> sur le PC serveur, et on l'ouvre dans un navigateur. Les fichiers
> `Lancer-PHARMASOFT-SERVEUR.bat` (serveur) et `Ouvrir-PHARMASOFT-POSTE.bat` (poste, à
> personnaliser avec l'IP) sont des raccourcis double-clic fournis à la racine du projet.

> Plusieurs postes peuvent se connecter **simultanément** au même serveur.

### 9. Mise en place des sauvegardes automatiques

**Sauvegarde automatique quotidienne** (en ADMINISTRATEUR, une fois) :
```powershell
powershell -ExecutionPolicy Bypass -File scripts\register-backup-task.ps1 -At "02:00" -BackupDir "D:\PHARMASOFT-BACKUPS"
```

**Sauvegarde manuelle** depuis l'app : **Paramètres → Sauvegarde → « Sauvegarder maintenant »**.
Bouton **Télécharger** pour copier un dump sur clé USB depuis n'importe quel poste.

**Sauvegarde en ligne de commande :**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -BackupDir "D:\PHARMASOFT-BACKUPS" -KeepDays 30
```

> **Conseil :** une fois par semaine, copier le dossier de sauvegarde sur une clé USB
> conservée **hors** de la pharmacie (sécurité incendie/vol).

### 10. Procédure de restauration (en cas de panne)

**Depuis l'app :** Paramètres → Sauvegarde → icône **Restaurer** sur la sauvegarde voulue
→ confirmer (⚠️ écrase les données actuelles).

**En ligne de commande :**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 -File "D:\PHARMASOFT-BACKUPS\pharmasoft-20260604-020000.dump"
```

**Reconstruction complète d'un serveur HS :** refaire les étapes 2→6, puis restaurer la
dernière sauvegarde (étape ci-dessus) au lieu de relancer le seed.

> ⚙️ Pas besoin d'internet pour aucune de ces étapes une fois les installeurs (PostgreSQL,
> Node.js) et le projet copiés sur le serveur.

---

## Stack technique

| Couche | Choix |
|---|---|
| Framework | Next.js 14.2 (App Router) + React 18.3 + TypeScript 5.6 strict |
| UI | TailwindCSS + shadcn/ui (inliné) + lucide-react |
| BDD | PostgreSQL + Prisma ORM 5 |
| Auth | NextAuth.js v5 (Auth.js, Credentials provider, JWT 12h) |
| Forms | react-hook-form + zod |
| State | Zustand + TanStack Query v5 |
| Tables | TanStack Table v8 |
| Charts | Recharts (+ Sparkline SVG natif) |
| PDF | @react-pdf/renderer (utilisé en P5) |
| Excel | xlsx (utilisé en P5) |
| i18n | next-intl 3 (FR / AR avec RTL / EN) |
| Dates | date-fns |
| Thème | next-themes (clair / sombre) |
| Notifications | sonner |

## Prérequis

- **Node.js ≥ 18.17**
- **PostgreSQL ≥ 14** lancé localement (ou via Docker)
- **npm** (ou pnpm / yarn)

### Lancer PostgreSQL avec Docker (recommandé)

```bash
docker run -d \
  --name pharmasoft-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pharmasoft \
  -p 5432:5432 \
  postgres:16-alpine
```

## Installation pas à pas

```powershell
# 1) Entrer dans le projet
cd pharmasoft-djibouti

# 2) Copier les variables d'environnement (Windows PowerShell)
Copy-Item .env.example .env
# (Linux/Mac : cp .env.example .env)
# Vérifier DATABASE_URL et AUTH_SECRET dans .env

# 3) Installer les dépendances (~2-3 min, ~600 MB)
npm install

# 4) Créer le schéma + appliquer les migrations
npx prisma migrate dev --name init

# 5) Charger les données démo djiboutiennes
npx prisma db seed

# 6) Lancer le serveur de développement
npm run dev
```

L'application est disponible sur **http://localhost:3000** (redirection automatique vers `/fr`).

## Comptes de démonstration

Quatre comptes (un par rôle) sont créés par le seed.

| Rôle | Email | Mot de passe | Couleur | Périmètre |
|---|---|---|---|---|
| 🟣 **SUPER ADMIN** | `admin@pharmasoft.dj` | `Admin123!` | violet | Technique : Utilisateurs, Paramètres, Audit, Notifications |
| 🔵 **PHARMACIEN TITULAIRE** | `titulaire@pharmasoft.dj` | `Titulaire123!` | bleu marine | Tout l'opérationnel + financier (incl. prix d'achat & marges) |
| 🟢 **VENDEUR** | `vendeur@pharmasoft.dj` | `Vendeur123!` | vert | Ventes libres, sans visibilité prix d'achat (D-013) |
| 🟠 **CAISSIER** | `caissier@pharmasoft.dj` | `Caissier123!` | orange | POS + Caisse uniquement, validation PIN pour Rx (D-014) |

**PIN du Titulaire (validation d'ordonnance)** : `1234` — **à changer en production** !

## Scripts disponibles

```bash
npm run dev              # Lance le dev server (hot reload)
npm run build            # Build production
npm run start            # Lance le serveur production
npm run lint             # ESLint
npm run typecheck        # Vérification TypeScript stricte (tsc --noEmit)
npm run format           # Prettier
npm run prisma:studio    # GUI Prisma (port 5555) — inspection de la BDD
npm run prisma:migrate   # Nouvelle migration interactive
npm run prisma:reset     # Reset complet de la BDD + re-seed (destructif !)
npm run prisma:seed      # Re-execute le seed sans toucher au schéma
```

## État des modules

### ✅ Livrés (P0–P4 + P6)

| Module | Statut |
|---|---|
| Auth (login, sessions JWT, 4 rôles, audit log) | ✅ Complet |
| Layout (sidebar adaptative, topbar, switchers langue/thème) | ✅ Complet |
| 4 dashboards par rôle (TITULAIRE, VENDEUR, CAISSIER, SUPER_ADMIN) | ✅ Complet |
| Médicaments (liste, détail, CRUD, masquage prix achat) | ✅ Complet |
| Stock & lots (vue agrégée, ajustement, mouvements) | ✅ Complet |
| Clients (liste, détail, CRUD, fidélité Bronze→Platine) | ✅ Complet |
| Ordonnances (liste, détail, validation PIN pharmacien) | ✅ Complet |
| Notifications (centre, dropdown topbar) | ✅ Complet |
| i18n FR / AR (RTL) / EN | ✅ Complet |
| Mode clair / sombre | ✅ Complet |
| Pages 404, error boundaries, loading skeletons | ✅ Complet |

### ✅ Livrés en P5 + P7

| Module | Description |
|---|---|
| POS / Vente | Grille produits filtrable, panier sticky, 6 modes paiement, modal PIN auto si Rx, finalisation |
| Ticket de caisse | Aperçu 320px monospace + impression CSS `@media print` |
| Caisse ouverture/clôture | Sessions, fond de caisse, montant théorique calculé, écart au comptage |
| Utilisateurs (CRUD UI) | Création / désactivation / reset PIN + matrice de permissions |
| Audit log (page complète) | Filtres action/user/date + JSON expand + pagination 50/page |
| Paramètres | Pharmacie, TVA, alertes péremption, langue par défaut |
| Fournisseurs | Cards avec solde dû + compteurs lots/commandes |
| Assurances | Cards avec adhérents + claims pending |
| Rapports — Z journalier (PDF) | Ventilation paiements + récap caisse + signatures |
| Rapports — Bordereau assurance (PDF) | Liste claims par assureur sur période |
| Rapports — Journal des ventes (Excel) | 2 feuilles : résumé + lignes détaillées |
| Rapports — Valorisation stock (Excel) | Par produit + par lot avec marges |
| Docker / docker-compose | Multi-stage Dockerfile + stack app/postgres/adminer |

## Structure du projet

```
pharmasoft-djibouti/
├── prisma/
│   ├── schema.prisma          # 22 modèles + 13 enums
│   └── seed.ts                # Données démo djiboutiennes (50 médicaments, 30 clients, ...)
├── messages/                  # Bundles next-intl
│   ├── fr.json, ar.json, en.json
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx                 # Racine neutre
    │   ├── global-error.tsx           # Filet de sécurité ultime
    │   ├── [locale]/
    │   │   ├── layout.tsx             # html+body+Providers, RTL auto pour ar
    │   │   ├── page.tsx               # Redirige vers /dashboard
    │   │   ├── not-found.tsx          # 404 stylisé
    │   │   ├── (auth)/                # Route group sans AppShell
    │   │   │   ├── layout.tsx
    │   │   │   ├── error.tsx
    │   │   │   └── login/
    │   │   │       ├── page.tsx       # Split-screen branded
    │   │   │       └── login-form.tsx # Client component avec react-hook-form
    │   │   └── (app)/                 # Route group avec AppShell
    │   │       ├── layout.tsx         # Fetch session, pharmacie, badges, notifs
    │   │       ├── error.tsx
    │   │       ├── dashboard/         # Dispatcher 4 variantes
    │   │       ├── medicaments/       # Liste + [id] + loading
    │   │       ├── stock/             # Vue agrégée + ajustements
    │   │       ├── clients/           # Liste + [id] + loading
    │   │       ├── ordonnances/       # Liste + [id] + validation PIN
    │   │       ├── notifications/     # Vue complète
    │   │       └── (pos, caisse, fournisseurs, ...)  # Placeholders P5
    │   └── api/
    │       ├── auth/[...nextauth]/    # NextAuth handlers
    │       ├── medicines/             # GET/POST + [id] GET/PATCH/DELETE
    │       ├── stock/adjust/          # POST avec transaction
    │       ├── clients/               # GET/POST + [id] GET/PATCH
    │       └── prescriptions/         # GET/POST + [id]/validate
    ├── components/
    │   ├── ui/                # shadcn/ui inliné (15 composants)
    │   ├── layout/            # Sidebar, Topbar, AppShell, switchers, menus
    │   ├── charts/            # KpiCard, Sparkline, BarChart, DonutChart, HBarList, MedImage
    │   ├── common/            # DataTable, PageHeader, PageSkeleton, Placeholder, Providers
    │   ├── dashboard/         # 4 variantes par rôle
    │   ├── medicaments/       # MedicineFormDialog, MedicinesTable
    │   ├── stock/             # StockAdjustDialog
    │   ├── clients/           # ClientFormDialog, ClientsTable
    │   └── ordonnances/       # ValidatePinDialog
    ├── lib/
    │   ├── prisma.ts          # Singleton avec global cache HMR
    │   ├── auth.ts            # NextAuth v5 (Credentials + bcrypt + audit)
    │   ├── auth.config.ts     # Edge-safe pour middleware
    │   ├── permissions.ts     # PERMISSIONS, canAccess, canSeePurchasePrice, ROLE_THEME
    │   ├── nav.ts             # NAV_ITEMS avec roles[]
    │   ├── dashboard.ts       # 7 fonctions d'agrégation Prisma
    │   ├── api-helpers.ts     # ApiError, requireSession, requireResource
    │   ├── scrub.ts           # Masquage purchasePrice par rôle
    │   ├── validations/       # Schemas zod par module
    │   └── utils.ts           # cn, fmtMoney, fmtDate, …
    ├── hooks/                 # (vide, pour P5+)
    ├── stores/                # (vide, pour P5+)
    ├── types/
    │   └── next-auth.d.ts     # Augmentations Session/JWT
    ├── i18n/
    │   ├── routing.ts         # Locales + helpers Link/redirect
    │   └── request.ts         # getRequestConfig pour next-intl
    └── middleware.ts          # Combinaison i18n + auth + permissions
```

## Spécificités Djibouti

- **Devise** : Franc Djiboutien (Fdj), affichage `152 400 Fdj` (séparateur espace, pas de centime — cf. DECISIONS.md D-030)
- **TVA** : 10% (configurable via `NEXT_PUBLIC_TVA_RATE`)
- **Téléphone** : format `+253 XX XX XX XX`
- **Paiements locaux** : D-Money (Djibouti Telecom), Waafi (Salaam Bank), CNSS Djibouti, AMERGA + cash/card/credit
- **Codes-barres** : EAN-13 préfixe `617` (GS1 Djibouti) dans le seed
- **Langues** : FR (par défaut), Arabe (RTL automatique), Anglais
- **Fuseau horaire** : Africa/Djibouti (UTC+3)
- **Antipaludéens** dans le seed (Coartem, Plaquénil) — pathologie endémique

## Sécurité

- Mots de passe bcrypt (rounds=10, configurable via `BCRYPT_ROUNDS`)
- PIN Titulaire bcrypt aussi
- Sessions JWT 12h (durée d'un shift, cf. D-050)
- Permissions vérifiées **côté serveur** (middleware + `requireResource()` dans chaque API)
- Audit log central pour : LOGIN, LOGIN_FAILED, SALE_COMPLETE, PRESCRIPTION_VALIDATE, STOCK_ADJUST, PRICE_CHANGE, DELETE…
- `VENDEUR` ne voit **jamais** purchasePrice/marge — filtré au niveau Prisma avant sérialisation HTML (D-081)

## Déploiement Docker

### Option recommandée : docker compose (stack complète)

```bash
# 1) Copier .env et personnaliser AUTH_SECRET
cp .env.example .env
# Générer une vraie clé secrète :
openssl rand -base64 32   # → coller dans AUTH_SECRET du .env

# 2) Lancer la stack (app + postgres + adminer)
docker compose up -d --build

# 3) Appliquer les migrations + seed (première fois uniquement)
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed

# 4) Vérifier
curl -s http://localhost:3000/api/auth/session   # doit renvoyer {}
docker compose logs -f app                        # suivre les logs
```

L'application est sur **http://localhost:3000**.
Adminer (admin BDD) est sur **http://localhost:8080** (serveur : `db`, user : `pharmasoft`, mdp : `pharmasoft_pw_change_me` — à changer !).

### Variables d'environnement essentielles en production

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `AUTH_SECRET` | ✅ | Clé JWT (≥ 32 octets, `openssl rand -base64 32`) |
| `AUTH_URL` | ⛔ | **Ne pas définir** en local multi-postes (`trustHost` gère l'hôte ; une URL fixe casse l'accès LAN) |
| `BCRYPT_ROUNDS` | ❌ | Tours bcrypt (10 par défaut, 12 en prod) |
| `PG_BIN_DIR` | ❌ | Dossier des binaires PostgreSQL (`pg_dump`) pour les sauvegardes |
| `BACKUP_DIR` | ❌ | Dossier de destination des sauvegardes (disque externe/USB) |
| `NEXT_PUBLIC_TVA_RATE` | ❌ | Taux TVA (`0.10` par défaut) |
| `NEXT_PUBLIC_PHARMACY_*` | ❌ | Infos pharmacie affichées par défaut |

### Healthcheck

Le `Dockerfile` inclut un healthcheck sur `/api/auth/session` (toutes les 30s).
Si la BDD est inaccessible, l'API renvoie une erreur → Docker marque le conteneur unhealthy.

### Backup / Restore PostgreSQL

```bash
# Backup
docker compose exec db pg_dump -U pharmasoft pharmasoft > backup-$(date +%Y%m%d).sql

# Restore (BDD vidée d'abord)
docker compose exec -T db psql -U pharmasoft -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker compose exec -T db psql -U pharmasoft pharmasoft < backup-YYYYMMDD.sql
```

### Mise à jour de l'application

```bash
git pull
docker compose build --no-cache app
docker compose up -d
docker compose exec app npx prisma migrate deploy   # nouvelles migrations le cas échéant
```

## Troubleshooting

| Problème | Solution |
|---|---|
| `npm install` plante sur `prisma generate` | Vérifier que vous avez Node ≥ 18.17 ; relancer `npm install` |
| `prisma migrate dev` : connection refused | PostgreSQL n'est pas lancé ; vérifier le conteneur Docker ou le service local |
| Login affiche "Identifiants invalides" | Avez-vous fait `npx prisma db seed` ? |
| `Module not found: '@radix-ui/...'` | Relancer `npm install` (dépendance manquante) |
| Mode sombre ne s'applique pas | Vérifier que `ThemeProvider` a `attribute="class"` (dans `providers.tsx`) |
| Arabe ne flip pas RTL | Vérifier `dir="rtl"` sur `<html>` (dans `[locale]/layout.tsx`) |
| Charts ne s'affichent pas | recharts requiert `"use client"` ; voir bar-chart-card.tsx |

## Voir aussi

- [DECISIONS.md](./DECISIONS.md) — 30+ décisions d'architecture tracées
- Maquettes originales : dossier parent (`screens-all.jsx`, `styles.css`, `screenshots/`)

---

© 2026 PHARMASOFT. Tous droits réservés.
