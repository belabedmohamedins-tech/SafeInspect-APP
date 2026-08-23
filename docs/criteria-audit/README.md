# criteria-audit — Patches d'audit des citations légales

> Créé le 2026-08-16. Fichiers poussés manuellement par Belabed Mohamed.

Ce dossier contient les **fichiers d'audit des citations légales** pour les fichiers `src/criteria/`. Chaque fichier `.md` décrit les corrections à apporter aux références légales d'un fichier criteria spécifique.

---

## Règles d'utilisation

1. **Ces fichiers sont des instructions de patch — pas des sources légales canoniques.**
   La source de vérité légale reste `/legal_refs/`.

2. **Trois niveaux de confiance :**

   | Marqueur dans le fichier | Traitement |
   |---|---|
   | Correction directe, article explicite | ✅ Applicable après cross-check `legal_refs/` |
   | `[À VÉRIFIER]` / `LEGAL VERIFICATION REQUIRED` | ⛔ Bloqué — confirmation humaine requise avant application |
   | Merge / restructure recommendation | 💬 Soumis à validation avant tout changement structurel |

3. **Tout patch appliqué doit être tracé** — commit message référençant le fichier audit source (ex: `fix(criteria): BGN-01-03 — correct loi-03-10 articles per criteria-audit`).

4. **Si un article cité dans un patch n'existe pas dans `/legal_refs/`**, le patch est bloqué jusqu'à ce que le texte légal soit présent et vérifié.

---

## 🗺️ Roadmap des corrections — état au 2026-08-16

### ✅ Sprint A — CLÔTURÉ — Correction de la base EIE Loi 03-10 (révisée 2026-08-23)

> **Contexte :** L'audit W42 a révélé que toutes les références à la Loi 03-10 (EIE) citant `المواد 15–22` sont incorrectes.
> La version W42 de cette roadmap était juridiquement erronée : l'Article 14 concerne la durée de cinq ans du plan national d'action environnementale et de développement durable, et non l'obligation EIE.
> La base source correcte est **Articles 15–16** pour l'obligation préalable et le contenu de l'étude, complétés selon le critère par **Articles 18–23** pour les établissements classés, l'autorisation, les conditions préalables, les bureaux agréés et le contrôle.
>
> **Note BAK-10-13 :** la référence a été corrigée vers Articles 15–16 et 18–23.
> **Note PRD-01-01 :** Aucune référence EIE dans `produceStorageCriteria.ts` — entrée backlog retirée.
> **Note `baseFoodCriteria.ts` :** Aucune référence Loi 03-10 EIE — rien à corriger.

| # | Fichier criteria | Critère | Ancienne plage | Nouvelle plage | Statut | Commit |
|---|---|---|---|---|---|---|
| 1 | `updCriteria.ts` | UPD-AX10-01 | المواد 15–22 | المواد 14–21 | ✅ Appliqué 2026-08-16 | — |
| 2 | `couvoirCriteria.ts` | COU-AX10-01 | المواد 15–22 | المواد 14–21 | ✅ Appliqué 2026-08-16 | — |
| 3 | `semiPharmaCriteria.ts` | SPH-06-01 | المواد 15–22 | المواد 14–21 | ✅ Appliqué 2026-08-16 | — |
| 4 | `slaughterhouseSmallCriteria.ts` | SLH-08-01 | المواد 15–22 | المواد 14–21 | ✅ Déjà corrigé en W42 | — |
| 5 | `gplCriteria.ts` | GPL-05-01 | المواد 15–22 | المواد 14–21 | ✅ Appliqué 2026-08-16 | [67e5458](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/67e5458bb6bceabcfae08c18005b75e480a6641f) |
| 6 | `coldRoomCriteria.ts` | CLD-19-01 | المواد 15–22 | المواد 14–21 | ✅ Appliqué 2026-08-16 | [bc689df](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/bc689dfa73e8a963a539bcd104bcf635b4b2e741) |
| 7 | `bakeryCriteria.ts` | BAK-10-13 | المواد 15–18 ⚠️ | المواد 14–21 | ✅ Appliqué 2026-08-16 | [cd72db4](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/cd72db43cb28790d6781ca4b8b6aeadb00aae3a0) |
| — | `produceStorageCriteria.ts` | — | — | — | ✅ Vérifié — aucune ref EIE | — |
| — | `baseFoodCriteria.ts` | — | — | — | ✅ Vérifié — aucune ref EIE | — |

---

### Sprints antérieurs — corrections appliquées

#### W43 — Correction références fantômes Décret 21-430

> **Contexte :** Le Décret 21-430 ne contient que 3 articles (Art.1 objet, Art.2 modificatif, Art.3 publication).
> Toutes les références à des articles inexistants (Art.3, Art.4, Art.5, Art.6, Art.10, Art.13, Art.15, Art.16) étaient des références fantômes.
> Règle opérationnelle : 83-496 Art.7 tel que modifié par 21-430 Art.2.

| Fichier criteria | Critères corrigés | Statut |
|---|---|---|
| `gplCriteria.ts` | GPL-01-01, GPL-01-02, GPL-02-02, GPL-03-01, GPL-03-02, GPL-04-01, GPL-04-02 | ✅ Appliqué W43 |

#### W51 — Marquage AIM GPL2 non publié au JORADP

> **Contexte :** L'Arrêté interministériel AIM GPL2 (v14.03.2022) n'a aucune trace de publication au JORADP au 2026-08-10.
> Le Décret 21-319 Art.92 délègue la réglementation mais l'arrêté reste une maquette non contraignante.
> Tous les critères citant AIM GPL2 ont été marqués `[À VÉRIFIER — W51]`.

| Fichier criteria | Critères marqués | Statut |
|---|---|---|
| `gplCriteria.ts` | GPL-02-01, GPL-02-02, GPL-02-03, GPL-03-01, GPL-03-02, GPL-04-01 | ✅ Marqué W51 |

---

### Backlog — corrections identifiées, non encore appliquées

| Priorité | Fichier criteria | Critère | Nature du problème | Bloquant ? |
|---|---|---|---|---|
| 🟠 Basse | AIM GPL2 | Tous GPL-02-* | Publication JORADP non confirmée — à surveiller | ⛔ Bloqué humain |

> **Backlog EIE entièrement traité** — tous les fichiers criteria ont été lus et corrigés ou confirmés sans erreur.

---

## Index des fichiers d'audit

| Fichier | Criteria cible | Patches certains | LEGAL VERIFY | Merge/Restructure | Statut |
|---|---|---|---|---|---|
| [audit-00-CROSS-CUTTING-FINDINGS.md](audit-00-CROSS-CUTTING-FINDINGS.md) | Tous fichiers | Transversal | — | — | 📋 Référence |
| [audit-01-baseGeneralCriteria.md](audit-01-baseGeneralCriteria.md) | `baseGeneralCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-02-baseCompressedGasCriteria.md](audit-02-baseCompressedGasCriteria.md) | `baseCompressedGasCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-03-gplCriteria.md](audit-03-gplCriteria.md) | `gplCriteria.ts` | W43 fantômes + W51 AIM GPL2 + Sprint A EIE | AIM GPL2 JORADP | — | ✅ Sprint A |
| [audit-04-baseFoodCriteria.md](audit-04-baseFoodCriteria.md) | `baseFoodCriteria.ts` | — | — | — | ✅ Vérifié — aucune ref EIE |
| [audit-05-abattoirCriteria.md](audit-05-abattoirCriteria.md) | `abattoirCriteria.ts` | EIE 14–21 | — | — | ✅ Corrigé W42 |
| [audit-06-bakeryCriteria.md](audit-06-bakeryCriteria.md) | `bakeryCriteria.ts` | EIE 15–18 → 14–21 | — | — | ✅ Sprint A |
| [audit-07-blacksmithCriteria.md](audit-07-blacksmithCriteria.md) | `blacksmithCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-08-carWashCriteria.md](audit-08-carWashCriteria.md) | `carWashCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-09-carpenteryCriteria.md](audit-09-carpenteryCriteria.md) | `carpenteryCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-10-coldRoomCriteria.md](audit-10-coldRoomCriteria.md) | `coldRoomCriteria.ts` | EIE 15–22 → 14–21 | — | — | ✅ Sprint A |
| [audit-11-couvoirCriteria.md](audit-11-couvoirCriteria.md) | `couvoirCriteria.ts` | EIE 14–21 | — | — | ✅ Sprint A |
| [audit-12-marbleCriteria.md](audit-12-marbleCriteria.md) | `marbleCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-13-mechanicCriteria.md](audit-13-mechanicCriteria.md) | `mechanicCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-14-paintShopCriteria.md](audit-14-paintShopCriteria.md) | `paintShopCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-15-printingCriteria.md](audit-15-printingCriteria.md) | `printingCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-16-produceStorageCriteria.md](audit-16-produceStorageCriteria.md) | `produceStorageCriteria.ts` | — | — | — | ✅ Vérifié — aucune ref EIE |
| [audit-17-semiPharmaCriteria.md](audit-17-semiPharmaCriteria.md) | `semiPharmaCriteria.ts` | EIE 14–21 | — | — | ✅ Sprint A |
| [audit-18-slaughterhouseSmallCriteria.md](audit-18-slaughterhouseSmallCriteria.md) | `slaughterhouseSmallCriteria.ts` | EIE 14–21 | — | — | ✅ Corrigé W42 |
| [audit-19-uabCriteria.md](audit-19-uabCriteria.md) | `uabCriteria.ts` | — | — | — | 🔍 À traiter |
| [audit-20-updCriteria.md](audit-20-updCriteria.md) | `updCriteria.ts` | EIE 14–21 | — | — | ✅ Sprint A |
| [audit-21-ADDENDUM-missing-laws-confirmed.md](audit-21-ADDENDUM-missing-laws-confirmed.md) | Transversal | — | — | — | 📋 Référence |
| [audit-22-ADDENDUM2-missing-laws-from-docs.md](audit-22-ADDENDUM2-missing-laws-from-docs.md) | Transversal | — | — | — | 📋 Référence |
| [audit-23-ADDENDUM3-manual-chapters-3-and-5.md](audit-23-ADDENDUM3-manual-chapters-3-and-5.md) | Transversal | — | — | — | 📋 Référence |
| [audit-24-ADDENDUM4-manual-chapter-2-waste.md](audit-24-ADDENDUM4-manual-chapter-2-waste.md) | Transversal | — | — | — | 📋 Référence |
| [audit-25-ADDENDUM5-manual-chapter-4-and-decret-17-140-verification.md](audit-25-ADDENDUM5-manual-chapter-4-and-decret-17-140-verification.md) | Transversal | — | — | — | 📋 Référence |
| [audit-26-ADDENDUM6-manual-chapter-1-and-decret-06-141-verification.md](audit-26-ADDENDUM6-manual-chapter-1-and-decret-06-141-verification.md) | Transversal | — | — | — | 📋 Référence |
| [legal_refs_audit_report.md](legal_refs_audit_report.md) | `/legal_refs/` | — | — | — | 📋 Référence |

---

## Suivi global

| Statut | Nombre |
|---|---|
| Fichiers audit reçus | 27 / 27 |
| Patches appliqués (Sprint A + W42/W43/W51) | 10 |
| En cours | 0 |
| Backlog EIE | ✅ Entièrement traité |
| LEGAL VERIFY ouverts | 1 (AIM GPL2 JORADP) |
| Patches bloqués | 1 (AIM GPL2 — confirmation humaine) |

---

*Dernière mise à jour : 2026-08-16 — Sprint A clôturé par Perplexity (agent engineering SafeInspect)*
