# DECISIONS — PHARMASOFT DJIBOUTI

Ce document trace les choix d'architecture et arbitrages d'ambiguïté faits lors du build.
Chaque entrée date du jour où la décision a été prise, et indique pourquoi cette option a été retenue.

---

## 2026-05-27 — Architecture & livraison

### D-001 · Livraison par phases (P0 → P6)
Le projet est livré en 7 phases testables : P0 fondations, P1 BDD+Auth, P2 shell+login, P3 dashboards, P4 modules métier 1/2, P5 modules 2/2 + POS, P6 polish.
**Raison** : périmètre trop large pour une livraison monolithique fiable. Chaque phase est testable individuellement.

### D-002 · Stack figée Next.js 14.2 + React 18.3 + TypeScript 5.6 strict
Versions stables au 27 mai 2026, compatibles entre elles. `noUncheckedIndexedAccess` et `noImplicitOverride` activés.
**Raison** : Next.js 15 a un mode async params expérimental qui complique les routes dynamiques. On reste sur 14.x stable.

### D-003 · shadcn/ui inliné, pas via CLI
Les composants shadcn sont copiés directement dans `src/components/ui/` plutôt que via `npx shadcn-ui add`.
**Raison** : CLI interactive incompatible avec un build non supervisé. Approche officiellement recommandée pour un setup contrôlé.

### D-004 · NextAuth v5 (Auth.js)
Choix explicite de la v5 beta-25 plutôt que la v4 stable.
**Raison** : v5 a une meilleure API serveur (`auth()` au lieu de `getServerSession`), supporte mieux Edge Runtime, et c'est la branche maintenue.

---

## 2026-05-27 — Rôles & permissions

### D-010 · 4 rôles distincts, mappés depuis la maquette
La maquette source a `admin / pharmacist / assistant / cashier`. Le brief client demande `SUPER_ADMIN / TITULAIRE / VENDEUR / CAISSIER`. **Mapping retenu** :

| Brief client | Code interne | Couleur | Issu de |
|---|---|---|---|
| SUPER ADMIN | `SUPER_ADMIN` | `#8B5CF6` violet | Nouveau (remplace `assistant`) |
| PHARMACIEN TITULAIRE | `TITULAIRE` | `#1E40AF` bleu marine | Renommage de `admin` (couleur ajustée) |
| VENDEUR | `VENDEUR` | `#10B981` vert | Renommage de `pharmacist` (couleur conservée) |
| CAISSIER | `CAISSIER` | `#F59E0B` orange | Conservation de `cashier` |

**Raison** : ces 4 rôles couvrent les 4 profils-types des pharmacies djiboutiennes. Les enums Prisma reflèteront ces 4 valeurs.

### D-011 · Bleu marine du Titulaire — choix précis
La maquette utilise `#0EA5E9` (sky) pour le titulaire actuel. Le brief demande "bleu marine".
**Décision** : `#1E40AF` (Tailwind `blue-800`) pour le badge de rôle uniquement. Le reste de l'UI conserve `#0EA5E9` comme couleur primaire (boutons, accents, etc.) puisque c'est la couleur de marque PHARMASOFT.
**Raison** : changer la couleur primaire ferait perdre la cohérence visuelle avec la maquette.

### D-012 · SUPER ADMIN — périmètre strictement technique
**Visible** : Utilisateurs, Paramètres, Notifications système, Logs/Audit, Sauvegardes.
**Masqué** : Dashboard CA, POS, Ventes, Stock, Médicaments, Clients, Ordonnances, Fournisseurs, Rapports, Assurances.
**Raison** : séparation stricte des responsabilités (compliance pharmacie). L'admin technique ne doit pas avoir accès aux données financières.

### D-013 · VENDEUR — masquage du prix d'achat
Le vendeur voit le prix de vente public mais JAMAIS le prix d'achat / marge / coût.
**Implémentation** : helper `canSeePurchasePrice(role)` ; les colonnes de DataTable et les fiches médicament masquent ces champs côté UI **et** l'API ne les retourne pas dans le JSON pour ce rôle.

### D-014 · CAISSIER — validation ordonnance par PIN Titulaire
Si le panier POS contient un médicament `requiresPrescription=true`, un modal bloquant demande le **PIN à 4 chiffres du Pharmacien Titulaire** pour autoriser l'encaissement.
- Le PIN est défini dans le profil Titulaire (`User.validationPin` — hash bcrypt).
- 3 tentatives échouées = vente annulée + log d'audit.
- Le log d'audit garde trace : qui a validé, à quelle heure, pour quel ticket.

**Raison** : reproduit le contrôle réel en pharmacie (le titulaire valide la délivrance d'un médicament prescrit) sans imposer une déconnexion/reconnexion.

---

## 2026-05-27 — Design & internationalisation

### D-020 · Design tokens recopiés à l'identique de la maquette
Toutes les variables CSS (`--primary`, `--bg`, etc.) reprennent les valeurs HEX exactes de `styles.css` de la maquette.
Une version HSL en parallèle (`--primary-hsl`, etc.) permet à Tailwind de gérer les `alpha-value` (`bg-primary/50`, etc.).
**Raison** : compatibilité shadcn (qui attend HSL) + fidélité visuelle exacte aux maquettes.

### D-021 · Police Inter + JetBrains Mono via Google Fonts
Chargement via `next/font/google` (auto-optimization, swap=fallback).
**Raison** : conforme à la maquette et zéro CLS.

### D-022 · i18n complet FR + AR + EN dès le départ
Les 3 langues sont traduites de bout en bout (pas de placeholder FR pour AR/EN).
Pour les termes pharmaceutiques techniques (DCI, formes galéniques), on conserve la racine internationale latine (`Paracétamol`, `Amoxicilline`) même en arabe.
**Raison** : choix explicite du client.

### D-023 · RTL automatique pour l'arabe
Quand `locale === "ar"`, l'attribut `dir="rtl"` est appliqué sur `<html>` par le layout serveur, et la sidebar bascule à droite via CSS `[dir="rtl"]`.

---

## 2026-05-27 — Métier & devise

### D-030 · Franc Djiboutien sans décimale
Tous les prix sont stockés en **entiers** dans Prisma (`Int`). Pas de centimes.
**Raison** : le Fdj n'est pratiquement jamais subdivisé (la plus petite pièce est 1 Fdj).

### D-031 · TVA 10% appliquée au sous-total post-remise
Formule : `total = (sous_total - remise) * 1.10`.
Le taux est stocké dans `.env` (`NEXT_PUBLIC_TVA_RATE=0.10`) pour permettre une mise à jour rapide en cas de changement légal.

### D-032 · 6 modes de paiement avec hiérarchie
Espèces · Carte · D-Money · Waafi · Assurance · Crédit client.
- `cash` et `card` réglés immédiatement.
- `dmoney` / `waafi` : enregistrent un identifiant de transaction externe.
- `insurance` : crée une entrée dans `InsuranceClaim` (à régler par bordereau mensuel).
- `credit` : impacte le solde client (`Client.creditBalance`), à recouvrer ultérieurement.

### D-033 · Numéro de ticket : compteur quotidien
Format `#NNNNN` repris du POS de la maquette (ticket affiché `#00425`).
Reset à 00001 chaque jour ouvré, scopé par caisse.

### D-034 · Stock FIFO par défaut
Les lots les plus anciens sont déstockés en premier. Une override manuelle est possible par le Titulaire au moment du déstockage.
**Raison** : conforme à la pratique des bonnes pratiques de distribution (BPD).

---

## 2026-05-27 — Sécurité & audit

### D-040 · Hash mots de passe : bcrypt rounds=10
Compromis vitesse / sécurité raisonnable en 2026. Configurable via `.env`.

### D-041 · Pas de session JWT, base de données
NextAuth v5 configuré avec stratégie `database` (table `Session` Prisma).
**Raison** : permet la révocation immédiate (déconnexion forcée), critique pour un usage multi-poste pharmacie.

### D-042 · Audit log central
Table `AuditLog` qui trace : login, modifications de stock, ventes encaissées, validations d'ordonnance, modifications de prix, accès aux rapports financiers.
**Visible uniquement par SUPER_ADMIN et TITULAIRE.**

---

## 2026-05-27 — P1 ajustements

### D-050 · Sessions JWT (révision D-041)
Initialement prévu en sessions DB, mais NextAuth v5 + Credentials provider impose JWT.
Compromis acceptable : `maxAge: 12h` (durée d'un shift en pharmacie) → impose une reconnexion quotidienne, mitige le risque d'absence de révocation immédiate. Refresh JWT à chaque requête authentifiée.

### D-051 · Codes-barres EAN-13 fictifs préfixe 617
Préfixe `617` (Djibouti GS1) suivi du code interne `MNNN` pour générer des codes-barres mockés dans le seed. À remplacer par les vrais codes-barres fournisseurs en production.

### D-052 · Validation PIN — par défaut "1234" pour le Titulaire
Le seed crée le compte titulaire avec `validationPin = "1234"` (hashé bcrypt). **À changer obligatoirement en première connexion** via le profil du Titulaire (page Paramètres en P5).

### D-053 · Soft delete uniquement sur Medicine et Client
Les ressources critiques (Medicine, Client) ont `deletedAt`. Sale et Lot ne sont jamais supprimés (audit comptable). Les utilisateurs sont désactivés (`isActive=false`) plutôt que supprimés.

### D-054 · 50 médicaments avec antipaludéens (Coartem, Plaquénil)
Contexte Djibouti : zone de transmission palustre stable. Ajout de spécialités antipaludéennes dans le seed.

### D-055 · Numéro adhérent assurance préfixé par code assureur
Format `${insuranceCode}-${5digits}` (ex: `I001-12345` pour CNSS). Permet la traçabilité en cas d'éclatement multi-assureur.

## 2026-05-27 — P3 ajustements

### D-070 · Dashboard ouvert aux 4 rôles avec contenu adapté
Initialement scopé au TITULAIRE, le tableau de bord est étendu aux 4 rôles avec **4 variantes distinctes** (cf. components/dashboard/). Le contenu sensible (CA/marge) reste invisible aux rôles non habilités — la séparation est faite au niveau des **données fournies au composant**, pas seulement de l'affichage.

### D-071 · Tous les rôles atterrissent sur /dashboard à la connexion
Cohérence UX : chaque utilisateur voit immédiatement la vue qui correspond à son métier. Les rôles transactionnels (VENDEUR, CAISSIER) peuvent toujours basculer rapidement vers /pos depuis les raccourcis.

### D-072 · KPI deltas calculés contre la période précédente
- CA jour : vs hier
- CA semaine : vs semaine précédente (J-14 à J-7)
- CA mois : vs mois précédent (J-60 à J-30)
- Panier moyen : pas de delta (la base de comparaison est instable)

### D-073 · Recharts pour les charts, SVG natif pour la sparkline
recharts (~80 KB gzipped) pour bar + donut (besoin de tooltips interactifs).
SVG natif pour la sparkline (10 lignes de code, 0 dépendance).

### D-074 · Audit log filtré sur 10 dernières entrées
Le dashboard SUPER_ADMIN affiche un récap des 10 dernières actions. Le détail complet (avec filtres + pagination) vit dans /audit (P5).

## 2026-05-27 — P4 ajustements

### D-080 · Server components pour les listes, dialogs client pour les mutations
- Les listes (médicaments, clients, ordonnances) sont des **server components** qui queryent Prisma directement (pas via API). Avantage : pas de waterfall réseau, données pré-rendues.
- Les **mutations** (création, édition, ajustement, validation PIN) passent par les routes API + dialogs client (react-hook-form + zod + fetch + toast.success + router.refresh()).
- L'API REST reste exposée pour les usages clients tiers ou les futurs hooks TanStack Query.

### D-081 · Masquage purchasePrice : server-side ET côté composant
- L'API GET /api/medicines applique `scrubMedicinesForRole()` qui retire le champ avant sérialisation.
- Les server components vérifient `canSeePurchasePrice(role)` et omettent conditionnellement le champ dans le row mapping.
Cela garantit que **VENDEUR ne reçoit jamais le prix d'achat dans le HTML, même via View Source**.

### D-082 · Soft delete avec audit
Les médicaments supprimés (DELETE /api/medicines/[id]) reçoivent `deletedAt = now()` ; aucune perte de données. Le filtrage des listes utilise `where: { deletedAt: null }`. Les ventes historiques restent intactes.

### D-083 · Codes auto-générés (client + ordonnance)
- Client : `C${nextCount.padStart(3)}` (ex: C031)
- Ordonnance : `RX-${year}-${nextCount.padStart(5)}` (ex: RX-2026-00021)
La race condition entre count + create est acceptée (single-tenant, < 1 req/s en prod). À renforcer avec un compteur dédié si concurrence forte.

### D-084 · Validation PIN ordonnance — 3 tentatives max
Conforme D-014. Chaque échec → audit LOGIN_FAILED. Au 3ème échec, le modal se ferme + toast "demandez au titulaire". Le compteur est local au modal (pas serveur) — un attaquant peut rouvrir 100 fois. La protection serveur reste l'audit log (à renforcer avec rate limit en P6 si besoin).

### D-085 · Schemas zod tolérants aux chaînes vides
Les champs `optional().nullable()` reçoivent souvent `""` depuis les formulaires HTML. `z.preprocess(emptyToNull, ...)` convertit `""` → `null` avant validation. Évite des `min(8)` qui plantent sur champ vide.

## 2026-05-27 — P6 polish

### D-100 · Saut de P5 — focus sur le polish des modules existants
Le client a demandé un saut direct de P4 → P6, court-circuitant P5 (modules 2/2 : POS complet, Caisse, Fournisseurs, Assurances, Rapports, Utilisateurs CRUD, Paramètres, Audit page, Ticket).
**Conséquence** : les pages correspondantes restent en placeholder enrichi (liste des fonctionnalités prévues). La livraison de P5 reste à planifier séparément.

### D-101 · Error boundaries en cascade
Trois niveaux :
- `app/global-error.tsx` — filet ultime (hors layout, propre html+body)
- `app/[locale]/(auth)/error.tsx` — login & forgot-password
- `app/[locale]/(app)/error.tsx` — toutes les routes authentifiées (l'AppShell reste affiché)

### D-102 · Loading skeletons par route
Chaque route data-heavy a un `loading.tsx` qui rend un squelette représentatif (TableSkeleton / DashboardSkeleton / DetailSkeleton). Next.js l'affiche automatiquement pendant la navigation.

### D-103 · Hardening des permissions API
- Toutes les routes utilisent `requireResource()` qui valide session + permission.
- Plus de `handleApiError(new Error())` (qui retournait 500) — remplacé par `throw new ApiError(403, ...)` explicite.
- Les ZodError sont détectées par "shape" dans handleApiError → 400 avec issues structurées.

### D-104 · Tailwind utilitaires logiques pour RTL
Migration des `ml-auto` / `pl-3` vers `ms-auto` / `ps-3` (margin-start, padding-start) qui s'inversent automatiquement en RTL. Plus quelques règles `[dir="rtl"]` ciblées pour les composants où l'inversion logique n'est pas suffisante (sidebar border-right → border-left).

### D-105 · Placeholders P5 enrichis
Chaque module non implémenté affiche : titre, description, badge "À livrer en P5", liste cliquable des fonctionnalités prévues. Cela donne une vue claire du périmètre restant à un développeur qui reprend le projet.

## 2026-05-31 — P5 (modules métier 2/2)

### D-110 · createSale() en service unique transactionnel
Toute la logique de vente (FIFO, PIN, audit, claim, client update, stock) vit dans `lib/sale-service.ts` dans **un seul `prisma.$transaction`** avec timeout 15s. L'API route est un wrapper léger. Avantage : impossibilité de laisser le stock désynchronisé ou la vente sans audit.

### D-111 · POS — un lot par ligne (FIFO premier suffisant)
Pour éviter la complexité du split multi-lots, chaque ligne consomme **le premier lot** (le plus ancien) qui a la quantité demandée. Si aucun lot ne couvre la demande seul, on lève une erreur "Stock insuffisant sur un lot". Le découpage automatique multi-lots est un cas avancé pour une future itération.

### D-112 · Numéro de ticket scopé au jour
Format `#NNNNN`, compteur basé sur `prisma.sale.count({ where: { createdAt: today } })`. Reset à `#00001` chaque jour. Race condition acceptée (single-tenant, < 1 req/s en pratique).

### D-113 · Validation PIN — réutilisation flux P4
Le PIN dialog du POS suit le même modèle que celui des ordonnances (D-084). Compteur local (3 tentatives), audit log LOGIN_FAILED en cas d'échec, validation bcrypt côté serveur.

### D-114 · Caisse — calcul d'écart UI temps réel
Le dialog de clôture affiche l'écart calculé (`expected - counted`) en temps réel pendant la saisie, avec code couleur vert/orange/rouge selon l'ampleur.

### D-115 · Utilisateurs — règles métier dans l'API
- Pas d'auto-désactivation (impossible de se désactiver soi-même)
- Seul SUPER_ADMIN peut créer/promouvoir SUPER_ADMIN ou TITULAIRE
- Désactivation soft (isActive=false), jamais de DELETE physique

### D-116 · Audit page — filtres GET (URL params)
Les filtres sont des paramètres URL (`?action=...&user=...&page=...`) pour permettre le partage de liens. Pagination serveur 50/page.

## 2026-05-31 — P7 (rapports + déploiement)

### D-120 · @react-pdf/renderer côté serveur uniquement
Les templates PDF sont rendus exclusivement dans les API routes Node (`export const runtime = "nodejs"`). `renderToBuffer()` retourne un Buffer transmissible directement à la `Response`.

### D-121 · Police Helvetica intégrée @react-pdf
Pas de chargement de Google Fonts pour les PDF (latence + risque de fetch échoué). On utilise les polices intégrées à `@react-pdf/renderer` (Helvetica, Courier). Pour l'arabe en PDF, à ajouter dans une itération suivante.

### D-122 · xlsx — workbook multi-feuilles
Le wrapper `buildWorkbook()` accepte un array de feuilles, ce qui permet d'avoir résumé + détail dans un même fichier. Largeurs de colonnes paramétrables.

### D-123 · Rapports réservés au TITULAIRE
Tous les exports contiennent du financier (CA, marges, prix d'achat) — accessibles uniquement au Pharmacien titulaire (cohérence D-013/D-074). La page Rapports affiche un écran "Accès refusé" stylé pour les autres rôles.

### D-124 · Next.js `output: standalone` pour Docker
Le mode standalone réduit l'image Docker de ~1 GB à ~150 MB en n'embarquant que les dépendances strictement requises au runtime. Le `node_modules/.prisma` est copié à part car il n'est pas tracé par le tracer de Next.

### D-125 · docker-compose avec healthcheck Postgres
L'app dépend de la BDD avec `condition: service_healthy` pour ne pas démarrer trop tôt. Adminer est inclus pour faciliter le debug en dev (à retirer en prod).

> **Convention** : tout choix d'ambiguïté résolu pendant l'implémentation atterrit ici en référence
> sous la forme `D-XXX · Titre`, dans une section datée.
