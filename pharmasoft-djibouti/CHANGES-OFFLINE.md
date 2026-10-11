# CHANGES-OFFLINE — Adaptation de PHARMASOFT pour un déploiement LOCAL hors-ligne

Ce document liste **tous les changements** appliqués pour faire fonctionner PHARMASOFT
sur un serveur de pharmacie **sans connexion internet**, avec plusieurs postes clients
sur le réseau local (LAN).

> Cible : 1 PC serveur Windows (PostgreSQL + app Next.js) + N postes clients via navigateur
> à l'adresse `http://<IP-serveur>:3000`. Aucune dépendance internet au build ni au runtime.

---

## Résumé de l'audit (état initial)

L'application était **déjà presque 100% locale** : PostgreSQL local, NextAuth en
Credentials uniquement (aucun OAuth), aucun service cloud d'email/SMS/stockage/paiement,
aucune image externe, aucun script CDN dans l'app.

**3 vraies dépendances internet** ont été trouvées et corrigées + **2 fonctionnalités**
manquantes demandées ont été ajoutées (sauvegarde, packaging Windows).

---

## 1. Polices — suppression de Google Fonts (build hors-ligne)

**Problème :** `src/app/[locale]/layout.tsx` importait les polices via `next/font/google`
(`Inter`, `JetBrains_Mono`) → téléchargement depuis `fonts.gstatic.com` au moment du **build**.
Un build sur un serveur sans internet échouait.

**Corrections :**
- Ajout du script `scripts/download-fonts.ps1` qui télécharge les `.woff2` (via
  google-webfonts-helper) **une seule fois sur une machine avec internet**, dans
  `src/app/fonts/` (commités au repo).
- Polices téléchargées : **Inter** (400/500/600/700), **JetBrains Mono** (400/500/600),
  **Cairo** (400/500/600/700) — Cairo ajouté pour un rendu **arabe** correct (RTL).
- Nouveau module `src/app/fonts.ts` : déclare les 3 polices via **`next/font/local`**.
- `src/app/[locale]/layout.tsx` : remplace l'import `next/font/google` par `../fonts`,
  ajoute la variable CSS `--font-arabic` (Cairo) au `<body>`.
- `src/app/globals.css` : règle `[dir="rtl"]` → utilise Cairo (`--font-arabic`) en arabe.

**Résultat :** aucun appel à Google Fonts, build et runtime 100% hors-ligne.

## 2. Authentification accessible depuis le réseau local

**Problème :** NextAuth v5 rejette les hôtes non-localhost (`UntrustedHost`). Le login
depuis un poste client (`http://192.168.1.10:3000`) échouait.

**Correction :**
- `src/lib/auth.config.ts` : ajout de **`trustHost: true`**.
- **`AUTH_URL` doit rester NON défini** (`.env.example`, `.env.local.example`,
  `docker-compose.yml`, README mis à jour). Découverte en test production : comme le
  middleware `auth()` enveloppe next-intl, fixer `AUTH_URL` force toutes les réécritures
  d'URL sur cette origine → les pages (`/fr/login`, etc.) renvoient une 404 lorsqu'un
  poste accède via une autre adresse/IP. Avec `trustHost`, NextAuth utilise l'hôte réel
  de chaque requête → l'app fonctionne depuis tous les postes du LAN.

> Rappel : l'auth utilise **uniquement** le provider Credentials + bcrypt + JWT (12h).
> Aucun OAuth/Clerk/Auth0 — déjà conforme hors-ligne.

## 3. Écoute réseau (0.0.0.0) + nettoyage config

- `package.json` : `start` devient **`next start -H 0.0.0.0`** (accessible depuis tout le LAN).
  Ajout de `start:local` (`-H 127.0.0.1`) pour un test serveur seul.
- `next.config.mjs` : suppression de `images.remotePatterns: **.pharmasoft.dj` (domaine
  internet inutile) ; ajout de `images.unoptimized: true` (pas besoin de `sharp` ni d'un
  service d'optimisation en ligne — toutes les images vivent dans `/public`).
- `next.config.mjs` : **suppression de `output: "standalone"`**. Découverte en test
  production : `next start` est **incompatible** avec `standalone` (le serveur démarre
  mais renvoie « Cannot GET » sur toutes les pages). Sans `standalone`, `npm run start`
  sert correctement et lit `.env.local`. Le `Dockerfile` a été adapté en conséquence
  (runtime classique qui lance `next start` au lieu de `node server.js`).

## 4. Sauvegarde / Restauration PostgreSQL en local (NOUVEAU)

Aucune fonction de sauvegarde n'existait dans l'app. Ajout d'un système complet, 100% local.

**Backend :**
- `src/lib/backup.ts` : module serveur (Node) — `createBackup()` (pg_dump format custom
  `-Fc`), `listBackups()`, `restoreBackup()` (pg_restore `--clean`), `deleteBackup()`,
  garde anti path-traversal. Lit la connexion depuis `DATABASE_URL`, binaires via `PG_BIN_DIR`,
  destination via `BACKUP_DIR`.
- `src/app/api/backup/route.ts` : `GET` (liste), `POST` (sauvegarder), `DELETE` (supprimer).
- `src/app/api/backup/restore/route.ts` : `POST` (restaurer — destructif).
- `src/app/api/backup/download/route.ts` : `GET` (télécharger un dump → clé USB).
- Toutes réservées à la ressource **`settings`** (SUPER_ADMIN + TITULAIRE). Audit log +
  notification `BACKUP_DONE` à chaque sauvegarde.

**Interface :**
- `src/components/parametres/backup-panel.tsx` : panneau dans **Paramètres** avec
  « **Sauvegarder maintenant** », liste des sauvegardes (date/taille), **Télécharger**,
  **Restaurer** (avec confirmation), **Supprimer**.
- `src/app/[locale]/(app)/parametres/page.tsx` : intègre le panneau, retire l'ancienne note
  « sauvegardes à venir ».

**Scripts (planification / ligne de commande) :**
- `scripts/backup.ps1` : sauvegarde + rotation (`-KeepDays`), lit `.env`/`.env.local`.
- `scripts/restore.ps1` : restauration (`-File ... -Force`).
- `scripts/register-backup-task.ps1` : planifie une **sauvegarde automatique quotidienne**
  (Planificateur de tâches Windows, compte SYSTEM).

## 5. Robustesse hors-ligne — vérifiée

Audit complet : **aucun** `<script>`/`<link>` externe, aucune balise CDN, aucun
`navigator.onLine`, aucun analytics (GA/Sentry/PostHog), aucune image distante. Tous les
`fetch` sont **relatifs** (`/api/...`). Le rendu PDF (`@react-pdf/renderer`) utilise les
polices intégrées (Helvetica/Courier), sans enregistrement réseau. Rien ne bloque hors-ligne.

## 6. Packaging Windows + démarrage automatique (NOUVEAU)

- `.env.local.example` : modèle de configuration **locale** complet (DATABASE_URL localhost,
  AUTH_URL = IP du serveur, PORT, BACKUP_DIR, PG_BIN_DIR, télémétrie désactivée).
- `scripts/setup-offline.ps1` : enchaîne install → `prisma generate` → `migrate deploy` →
  `seed` → `build`.
- `scripts/start-server.ps1` : lance le serveur prod + affiche les IP d'accès pour les postes.
- `scripts/install-service.ps1` : **démarrage automatique au boot** via une tâche planifiée
  « au démarrage » (compte SYSTEM, redémarrage auto) — **aucun outil externe à télécharger**.
- `ecosystem.config.js` : configuration **PM2** alternative (lance `next start -H 0.0.0.0`).

## 7. Corrections de compilation (nécessaires pour `next build` hors-ligne)

L'installation fraîche des dépendances (sans lockfile d'origine) a tiré des `@types` plus
récents (TypeScript 5.9, `@types/node` 20.19 avec `Buffer` générique) qui faisaient échouer
le build sur du **code pré-existant**. Correctifs neutres (aucun changement de comportement) :
- `src/app/api/reports/{sales,stock-valuation,insurance/[id],z-journalier}/route.ts` :
  `new Response(buf, …)` → `new Response(new Uint8Array(buf), …)` (Buffer → BodyInit valide).
- `src/app/[locale]/(app)/clients/[id]/page.tsx` : type d'icône `Row` élargi à
  `size?: number | string` (compat lucide-react).
- `src/lib/auth.config.ts` : callbacks `jwt`/`session` — restriction explicite du type de
  `user`/`token` (compat `@auth/core` récent).
- Ajout d'un **`package-lock.json`** : fige les versions pour un `npm ci` reproductible
  (build identique sur le serveur de la pharmacie).

---

## Fichiers ajoutés

```
src/app/fonts.ts                          # next/font/local (Inter/JetBrains/Cairo)
src/app/fonts/*.woff2                      # 11 fichiers de police (commités)
src/lib/backup.ts                          # logique pg_dump / pg_restore
src/app/api/backup/route.ts                # liste / sauvegarde / suppression
src/app/api/backup/restore/route.ts        # restauration
src/app/api/backup/download/route.ts       # téléchargement (USB)
src/components/parametres/backup-panel.tsx # UI sauvegarde/restauration
.env.local.example                         # config locale type
ecosystem.config.js                        # PM2 (option)
scripts/download-fonts.ps1                 # téléchargement polices (machine avec internet)
scripts/setup-offline.ps1                  # install + migrate + seed + build
scripts/start-server.ps1                   # démarrage serveur (affiche IP)
scripts/backup.ps1                         # sauvegarde planifiée + rotation
scripts/restore.ps1                        # restauration en ligne de commande
scripts/register-backup-task.ps1           # tâche planifiée quotidienne
scripts/install-service.ps1               # démarrage auto au boot
CHANGES-OFFLINE.md                         # ce fichier
```

## Fichiers modifiés

```
package.json                               # script start -H 0.0.0.0 + start:local
next.config.mjs                            # images locales (unoptimized, sans domaine externe)
src/app/[locale]/layout.tsx                # polices locales
src/app/globals.css                        # police arabe (Cairo) en RTL
src/lib/auth.config.ts                     # trustHost: true + typages callbacks
src/app/[locale]/(app)/parametres/page.tsx # intègre BackupPanel
src/app/api/reports/*/route.ts             # Buffer → Uint8Array
src/app/[locale]/(app)/clients/[id]/page.tsx # type icône Row
```

## Vérifications finales

Statique :
- `npm run typecheck` → **0 erreur**
- `npm run lint` → **0 warning, 0 erreur**
- `npm run build` → **succès** (sans base de données, comme sur le serveur)
- Aucune dépendance internet au build ni au runtime.

Runtime (testé avec un PostgreSQL 16 réel + `next start`, machine 100% hors-ligne) :
- PostgreSQL local : `prisma migrate deploy` (migration `init` créée) + seed OK
  (4 utilisateurs, 50 médicaments, 100 ventes, 30 clients).
- Serveur de production démarré, accessible via `127.0.0.1` **et via l'IP LAN**
  (`http://192.168.x.x:PORT` → 200) → multi-postes confirmé.
- Pages `/fr/login`, `/en/login`, `/ar/login` → **200** (polices locales servies).
- **Connexion réelle** `admin@pharmasoft.dj` → 302, session SUPER_ADMIN renvoyée par
  la base, `/fr/dashboard` authentifié → 200.
- **Sauvegarde via l'app** (POST `/api/backup` authentifié) → dump créé (~100 Ko) ;
  **restauration** (`scripts/restore.ps1`) → données intactes (50/4/100/30).
- Aucune requête sortante vers internet observée.

## Installeur unique `.exe` (Inno Setup)

Un installeur **tout-en-un** a été créé pour que la pharmacie installe en un double-clic,
sans rien d'autre à faire. Il embarque l'application + Node.js + PostgreSQL.

**Contenu / fonctionnement :**
- `installer/PHARMASOFT.iss` — script Inno Setup. Embarque : `app/` (projet +
  `node_modules` + build `.next`), `node/` (Node 20.18.1 portable), `pgsql/`
  (PostgreSQL 16.6 portable dégraissé : bin+lib+share, ~120 Mo), `vc_redist.x64.exe`.
- `installer/first-run-setup.ps1` — config auto post-install : initdb + **service
  Windows PostgreSQL**, création base, migrations, **seed**, `.env.local` (clé
  aléatoire), **démarrage auto au boot** (tâche planifiée), **pare-feu**.
- `installer/uninstall-cleanup.ps1` — désinstallation propre (retire service, tâche,
  règle pare-feu).
- `installer/run-server.cmd`, `installer/Ouvrir-PHARMASOFT.cmd` — lancement / raccourci.
- `installer/build-installer.ps1` — build reproductible (stage + compile ISCC).

**Résultat :** `PHARMASOFT-Setup.exe` (~152 Mo). Côté pharmacie : double-clic → Suivant →
Installer → l'app s'ouvre. Aucune connexion internet requise.

**Validé par une vraie installation silencieuse de test (puis désinstallation) :**
- Extraction + service PostgreSQL **Running** + migration appliquée + **seed** (4 users /
  50 médicaments / 30 clients) + tâche planifiée + règle pare-feu + raccourci Bureau créés.
- **Connexion réelle** depuis le stack installé (`titulaire@pharmasoft.dj`) → 302 →
  `/fr/dashboard` 200.
- **Désinstallation** : service, tâche et règle pare-feu correctement supprimés.
- Bug corrigé pendant le test : la garde du seed (`SELECT count(*) FROM "User"` via
  `psql -c`) renvoyait un faux positif à cause du déguillemetage PowerShell→psql → seed
  sauté. Corrigé en passant la requête par un fichier `.sql` (`psql -f`).

## Outils de validation / déploiement ajoutés

```
scripts/make-guide-pdf.py                  # génère le guide PDF du pharmacien
docs/Guide-Pharmacien-PHARMASOFT.pdf       # guide imprimable A4 (2 pages, FR)
scripts/make-icon.py                       # génère l'icône PHARMASOFT (.ico)
public/pharmasoft.ico                      # icône (croix de pharmacie, bleu ciel)
Lancer-PHARMASOFT-SERVEUR.bat              # lanceur serveur (double-clic)
Ouvrir-PHARMASOFT-POSTE.bat                # raccourci poste client
scripts/creer-raccourci-bureau.ps1         # crée le raccourci Bureau (serveur/poste)
scripts/preparer-deploiement.ps1           # prépare le kit USB de déploiement
installer/                                 # installeur unique .exe (Inno Setup)
```
