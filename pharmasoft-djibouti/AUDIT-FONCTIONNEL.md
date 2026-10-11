# PHARMASOFT — Audit fonctionnel honnête vs. logiciel de pharmacie réel (type Odoo / LGPI / Winpharma)

> **But du document** : dire la vérité sur l'écart entre l'état actuel de PHARMASOFT et ce qu'attend une **vraie pharmacie en exploitation**. À montrer au client pour cadrer la suite.
>
> **Verdict global** : PHARMASOFT est aujourd'hui un **MVP de démonstration (≈ 35 %)** d'un logiciel de pharmacie complet. La base technique est saine (auth, rôles, POS, stock lots, BDD propre), mais il manque l'essentiel du **workflow métier réel** et **tout le volet légal/comptable**.

---

## Légende
- 🟢 **Fait** — fonctionnel
- 🟡 **Partiel** — existe mais incomplet / en affichage seulement
- 🔴 **Absent** — à construire entièrement
- ⚖️ **Obligation légale** — risque réglementaire/fiscal si absent
- 💥 **Bloquant terrain** — la pharmacie ne peut pas travailler sans

---

## 1. VENTE / POS

| Fonctionnalité | État | Priorité |
|---|---|---|
| Panier, catégories, recherche | 🟢 | — |
| 6 modes de paiement | 🟡 (un seul à la fois) | — |
| **Paiement mixte** (espèces + carte sur 1 ticket) | 🔴 💥 | P1 |
| **Rendu de monnaie calculé** (saisie montant reçu) | 🔴 💥 | P1 |
| **Mise en attente d'un ticket** (parquer / reprendre) | 🔴 💥 | P1 |
| **Retour / avoir sur une vente** | 🔴 ⚖️💥 | P1 |
| **Réimpression d'un ancien ticket** | 🔴 | P2 |
| Remise **par ligne** (pas juste globale) | 🔴 | P2 |
| **Vente à l'unité** (fractionner une boîte) | 🔴 💥 | P2 |
| **Dépense des points de fidélité** (on accumule mais on ne dépense jamais) | 🔴 | P2 |
| Scan code-barres **physique** réel | 🔴 💥 | P1 |
| Part assurance calculée → le client ne paie que sa part | 🔴 ⚖️💥 | P1 |

## 2. CATALOGUE / MÉDICAMENTS

| Fonctionnalité | État | Priorité |
|---|---|---|
| CRUD produit, DCI, forme, dosage, labo, prix | 🟢 | — |
| Sous ordonnance / substance contrôlée (flag) | 🟢 | — |
| **Import en masse** d'un catalogue (Excel/CSV) | 🔴 💥 | P1 |
| **Génériques / équivalents & substitution** | 🔴 | P2 |
| **Interactions médicamenteuses / contre-indications** | 🔴 ⚖️ | P2 |
| **Conditionnement** (boîte de X, prix unité vs boîte) | 🔴 💥 | P2 |
| **TVA par produit** (taux différenciés) | 🔴 ⚖️ | P2 |
| Plusieurs codes-barres par produit | 🔴 | P3 |
| Photo réelle du produit | 🔴 | P3 |
| Familles / rayons hiérarchiques | 🔴 | P3 |

## 3. STOCK & INVENTAIRE

| Fonctionnalité | État | Priorité |
|---|---|---|
| Lots + dates de péremption | 🟢 | — |
| Ajustement manuel + mouvement tracé | 🟢 | — |
| FIFO basique à la vente | 🟢 | — |
| **Inventaire physique** (session de comptage, écarts, validation) | 🔴 💥 | P1 |
| **Réapprovisionnement auto** (suggestion de commande sur seuil) | 🔴 💥 | P1 |
| **Valorisation automatique** (PMP / prix moyen pondéré) | 🔴 ⚖️ | P2 |
| Multi-dépôts (réserve vs comptoir) | 🔴 | P2 |
| Transferts entre emplacements | 🔴 | P3 |
| **Retrait/retour des périmés** vers fournisseur | 🔴 ⚖️ | P2 |
| Historique mouvements (UI — la table existe déjà) | 🟡 | P2 |
| Alertes péremption **automatiques** (mail/notif réelle) | 🔴 | P2 |

## 4. ACHATS / FOURNISSEURS — **quasi tout à construire**

| Fonctionnalité | État | Priorité |
|---|---|---|
| Liste fournisseurs (affichage) | 🟡 | — |
| **Bon de commande** (création, lignes, envoi) | 🔴 💥 | P1 |
| **Réception marchandise → création auto des lots + maj stock** | 🔴 💥 | P1 |
| **Facture fournisseur + rapprochement** | 🔴 ⚖️ | P2 |
| Suivi paiements fournisseurs / échéancier | 🔴 | P2 |
| Historique des prix d'achat | 🔴 | P2 |
| Commande automatique sur seuil | 🔴 | P3 |

> ⚠️ C'est le manque **le plus visible** : aujourd'hui on ne peut **pas faire entrer de stock** proprement dans le logiciel (juste un ajustement manuel). Une pharmacie reçoit des livraisons tous les jours.

## 5. CLIENTS / PATIENTS

| Fonctionnalité | État | Priorité |
|---|---|---|
| CRUD, fidélité (cumul), allergies, conditions, historique | 🟢 | — |
| **Comptes crédit + relances/échéances** | 🟡 (solde stocké, pas de suivi) | P2 |
| **Couverture familiale / ayants droit** | 🔴 | P2 |
| Renouvellement d'ordonnance chronique | 🔴 | P2 |
| Export fiche client | 🔴 | P3 |

## 6. ORDONNANCES

| Fonctionnalité | État | Priorité |
|---|---|---|
| Liste, statuts, validation par PIN pharmacien | 🟢 | — |
| **Création d'ordonnance depuis le POS** | 🔴 💥 | P1 |
| **Délivrance partielle pilotée** (servir 1 ligne sur 3) | 🟡 (champ existe, pas d'UI) | P2 |
| Scan / photo de l'ordonnance jointe | 🔴 | P2 |
| Base des médecins prescripteurs | 🔴 | P3 |

## 7. ASSURANCES / TIERS-PAYANT

| Fonctionnalité | État | Priorité |
|---|---|---|
| Liste assureurs, taux, adhérents | 🟢 | — |
| Claim auto-créée si paiement "assurance" | 🟡 (basique) | — |
| **Tiers-payant au POS** (client paie seulement sa part) | 🔴 ⚖️💥 | P1 |
| **Dossier de remboursement par période + suivi statut** | 🔴 ⚖️ | P2 |
| Rapprochement des paiements assurance | 🔴 | P2 |
| Plafonds / exclusions par contrat | 🔴 | P3 |

## 8. COMPTABILITÉ / FINANCE — **totalement absent** 🔴

| Fonctionnalité | État | Priorité |
|---|---|---|
| **Factures conformes** (mentions légales, numérotation séquentielle inviolable) | 🔴 ⚖️💥 | P1 |
| **Déclaration / journal de TVA** | 🔴 ⚖️ | P1 |
| Journal de caisse comptable | 🔴 ⚖️ | P2 |
| Export vers logiciel comptable | 🔴 | P2 |
| Grand livre / balance / trésorerie | 🔴 | P3 |

## 9. LÉGAL / RÉGLEMENTAIRE PHARMACIE — **critique** ⚖️

| Fonctionnalité | État | Priorité |
|---|---|---|
| **Registre / ordonnancier des stupéfiants** | 🔴 ⚖️💥 | P1 |
| **Traçabilité lots pour rappel de lot** (pharmacovigilance) | 🟡 (données là, pas d'outil de rappel) | P2 |
| **Numérotation inviolable des ventes** (anti-fraude fiscale) | 🔴 ⚖️ | P1 |
| Archivage légal / conservation des données | 🔴 ⚖️ | P2 |

## 10. RAPPORTS / BI

| Fonctionnalité | État | Priorité |
|---|---|---|
| Z journalier (PDF), ventes (Excel), valorisation, bordereau | 🟢 | — |
| Marge par produit / famille / période | 🔴 | P2 |
| Rotation de stock, produits dormants, analyse ABC | 🔴 | P3 |
| Tableau de bord configurable / pivots dynamiques | 🔴 | P3 |

## 11. TECHNIQUE / EXPLOITATION (terrain Djibouti)

| Fonctionnalité | État | Priorité |
|---|---|---|
| **Sauvegarde automatique planifiée + restauration testée** | 🟡 (panneau présent, à fiabiliser) | P1 ⚖️ |
| **Mode hors-ligne / reprise après coupure** (coupures fréquentes à Djibouti) | 🔴 💥 | P2 |
| **Multi-poste simultané** (plusieurs caisses en même temps) | 🟡 (non testé en charge) | P1 |
| Imprimante ticket **thermique** (ESC/POS) | 🔴 💥 | P1 |
| Lecteur code-barres physique | 🔴 💥 | P1 |
| Imprimante d'étiquettes (prix/rayon) | 🔴 | P3 |
| Tiroir-caisse | 🔴 | P3 |
| Droits granulaires (au-delà des 4 rôles) | 🔴 | P3 |

## 12. UX TRANSVERSE (annoncé mais non câblé)

| Fonctionnalité | État | Priorité |
|---|---|---|
| **Recherche globale ⌘K** | 🔴 (champ décoratif) | P2 |
| **Notifications** | 🔴 (mockées en dur) | P2 |
| **Raccourcis clavier F1–F5** | 🔴 (affichés, non actifs) | P2 |
| i18n AR / EN complet | 🟡 (partiel) | P3 |

---

# SYNTHÈSE & FEUILLE DE ROUTE

## État réel par module (estimation de complétude)

| Module | Complétude |
|---|---|
| Auth & rôles | 🟢 90 % |
| POS / vente | 🟡 50 % |
| Catalogue médicaments | 🟡 60 % |
| Stock & lots | 🟡 45 % |
| **Achats / réception** | 🔴 10 % |
| Clients / fidélité | 🟡 65 % |
| Ordonnances | 🟡 55 % |
| Assurances / tiers-payant | 🔴 25 % |
| **Comptabilité / facturation** | 🔴 5 % |
| **Légal / stupéfiants** | 🔴 0 % |
| Rapports | 🟡 40 % |
| Technique (impression, hors-ligne, sauvegarde) | 🔴 20 % |
| **MOYENNE GLOBALE** | **≈ 35 %** |

## Ce qui rend le logiciel **inutilisable en pharmacie réelle aujourd'hui** (à régler en priorité)

Ces 8 points sont les **bloquants terrain** (💥) — sans eux, une pharmacie ne peut littéralement pas travailler une journée :

1. **Réception de marchandise** (faire entrer le stock proprement → lots auto)
2. **Imprimante ticket thermique** (ESC/POS) + **lecteur code-barres**
3. **Paiement mixte + rendu de monnaie**
4. **Retour / avoir** sur vente
5. **Tiers-payant au POS** (le client ne paie que sa part)
6. **Inventaire physique**
7. **Facture conforme + numérotation inviolable** (fiscal)
8. **Registre des stupéfiants** (légal)

## Proposition de phases (réaliste)

| Phase | Contenu | Effort estimé |
|---|---|---|
| **V1 — Utilisable au comptoir** | Achats/réception, paiement mixte+monnaie, retour/avoir, impression thermique, code-barres, mise en attente ticket | ~3–4 semaines |
| **V2 — Conforme légal/fiscal** | Facture conforme, numérotation inviolable, registre stupéfiants, tiers-payant POS, déclaration TVA | ~3 semaines |
| **V3 — Gestion avancée** | Inventaire physique, valorisation PMP, réappro auto, comptes crédit/relances, rapports de marge | ~3 semaines |
| **V4 — Confort & robustesse** | Recherche globale, notifications réelles, raccourcis, mode hors-ligne, multi-dépôts | ~2–3 semaines |

> **Honnêteté sur les délais** : atteindre la parité fonctionnelle avec Odoo pour pharmacie, c'est **plusieurs mois** de travail, pas quelques jours. Mais on peut atteindre un **logiciel réellement exploitable au comptoir (V1+V2)** en ~6–7 semaines de dev focalisé.

---

*Document généré le 2026-06-08 — à réviser avec la liste précise du client.*
