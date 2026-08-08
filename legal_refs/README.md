# Références Légales — SafeInspect

Ce dossier est la **source de vérité légale unique** pour SafeInspect.
Chaque fichier = un seul instrument juridique, converti verbatim depuis le PDF JORADP source.
Claude et les autres agents IA doivent lire **uniquement ce dossier** pour toute référence légale.

> ⚠️ Vérifier toujours contre le JORADP original avant toute décision de conformité ou d'inspection.

---

## Règles de ce dossier (non négociables)

1. **Un fichier par instrument** — jamais deux fichiers pour la même loi/décret, même sous des noms différents.
2. **Convention de nommage** : `{type}-{numéro}-{slug}.md` tout en minuscules, ex. `loi-19-02-incendie-panique.md`.
3. **Transcription verbatim uniquement** — aucun résumé, aucune paraphrase, aucun article inventé. Si un passage est illisible : `[ILLISIBLE — vérifier JORADP p.X]`.
4. **Chaque fichier se termine** par une section `## Contrôle de séquence` listant tous les numéros d'articles trouvés et signalant explicitement les lacunes.
5. **En-tête obligatoire** dans chaque fichier : titre officiel, date, JO n° et date, fichier source PDF, date de conversion, statut de vérification.
6. **Statut par défaut** : `⚠️ NON VÉRIFIÉ` — ne passer à `✅ VÉRIFIÉ` qu'après relecture humaine contre le JORADP.

---

## Fichiers disponibles

| Fichier | Instrument | Objet | Articles | État | Source PDF | Converti le |
|---|---|---|---|---|---|---|
| [loi-09-03-protection-consommateur.md](./loi-09-03-protection-consommateur.md) | Loi n° 09-03 du 25/02/2009 | Protection du consommateur et répression des fraudes | Art. 1–42, 53–79, 93–fin ⚠️ Art. 43–52, 80–92 manquants | ⚠️ Partiel — NON VÉRIFIÉ | — | 2026-08 |
| [loi-03-10-protection-environnement.md](./loi-03-10-protection-environnement.md) | Loi n° 03-10 du 19/07/2003 | Protection de l'environnement dans le cadre du développement durable | 114 articles | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [loi-01-19-gestion-dechets.md](./loi-01-19-gestion-dechets.md) | Loi n° 01-19 du 12/12/2001 | Gestion, contrôle et élimination des déchets | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [loi-19-02-incendie-panique.md](./loi-19-02-incendie-panique.md) | Loi n° 19-02 du 27/02/2019 | Prévention et lutte contre les incendies et panique dans les ERP | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [Decret-07-144.md](./Decret-07-144.md) | Décret exécutif n° 07-144 | Nomenclature des établissements classés (622 rubriques) | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [Decret-17-140.md](./Decret-17-140.md) | Décret exécutif n° 17-140 du 11/04/2017 | Sécurité sanitaire des aliments / HACCP | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [decret-91-05-hygiene-securite-milieu-travail.md](./decret-91-05-hygiene-securite-milieu-travail.md) | Décret exécutif n° 91-05 du 19/01/1991 | Prescriptions générales de protection applicables en matière d'hygiène et de sécurité en milieu de travail | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | decret 91-05.pdf | 2026-08-08 |
| [decret-93-120-medecine-du-travail.md](./decret-93-120-medecine-du-travail.md) | Décret exécutif n° 93-120 du 15/05/1993 | Organisation de la médecine du travail | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [decret-06-198-etablissements-classes.md](./decret-06-198-etablissements-classes.md) | Décret exécutif n° 06-198 | Établissements classés — régimes d'autorisation et de déclaration | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [decret-09-19.md](./decret-09-19.md) | Décret exécutif n° 09-19 | Collecteurs agréés de déchets spéciaux dangereux | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [aim-gpl2-regles-techniques-securite.md](./aim-gpl2-regles-techniques-securite.md) | AIM / GPL2 — Règles techniques de sécurité | Règles techniques de sécurité pour installations GPL | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |
| [arrete-interministeriel-2025-liaison-froide.md](./arrete-interministeriel-2025-liaison-froide.md) | Arrêté interministériel du 7 mai 2025 | Conditions de transport en liaison froide des denrées alimentaires | À vérifier via audit.js | ⚠️ NON VÉRIFIÉ | — | 2026-08 |

---

## Doublons résolus — historique

| Fichier supprimé | Raison | Date | Canonique conservé |
|---|---|---|---|
| `loi-01-19.md` | Stub vide | 2026-08-08 | `loi-01-19-gestion-dechets.md` |
| `loi-03-10.md` | Stub vide | 2026-08-08 | `loi-03-10-protection-environnement.md` |
| `loi-09-03.md` | Stub vide | 2026-08-08 | `loi-09-03-protection-consommateur.md` |
| `Decret-06-198.md` (stub) | Stub vide | 2026-08-08 | `decret-06-198-etablissements-classes.md` |
| `docs/legal_sources/Decret-07-144.md` | Déplacé vers legal_refs/ | 2026-08-08 | `Decret-07-144.md` |
| `docs/legal_sources/Decret 17-140.md` | Déplacé vers legal_refs/ | 2026-08-08 | `Decret-17-140.md` |
| `docs/legal_sources/Decret-06-198.md` | Déplacé vers legal_refs/ | 2026-08-08 | `decret-06-198-etablissements-classes.md` |
| `docs/legal_sources/decret-09-19.md` | Déplacé vers legal_refs/ | 2026-08-08 | `decret-09-19.md` |
| `loi-19-02-prevention-incendie-panique.md` | Doublon même loi (plus petit, 4740 vs 4725 octets — variante mineure) | 2026-08-08 | `loi-19-02-incendie-panique.md` |
| `aim-gpl2-securite-installations-gpl.md` | Doublon même instrument (5062 vs 5052 octets — quasi-identique) | 2026-08-08 | `aim-gpl2-regles-techniques-securite.md` |
| `arrete-interministeriel-7mai2025-liaison-froide.md` | Doublon même arrêté (2240 vs 2949 octets — version moins complète) | 2026-08-08 | `arrete-interministeriel-2025-liaison-froide.md` |
| `decret-91-05-hygiene-securite-travail.md` | Doublon même décret (18 155 vs 36 859 octets — version incomplète) | 2026-08-08 | `decret-91-05-hygiene-securite-milieu-travail.md` |
| `decret-93-120-medecine-travail.md` | Doublon même décret (2346 vs 2308 octets — quasi-identique) | 2026-08-08 | `decret-93-120-medecine-du-travail.md` |

---

## Instruments manquants — priorité

| Instrument | Cité dans | Priorité |
|---|---|---|
| Loi 18-11 (santé publique) | semiPharmaCriteria.ts | 🔴 P0 |
| Décret 11-125 (abattoirs) | abattoirCriteria.ts | 🟠 P1 |
| Décret 21-430 (GPL/C) | gplCriteria.ts | 🟠 P1 |
| Décret 06-141 (eaux usées) | abattoirCriteria | 🟠 P1 |
| Loi 04-20 (risques majeurs) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 02-427 (hygiène locaux) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 05-315 (déchets hospitaliers) | baseGeneralCriteria.ts | 🟡 P2 |
| Décret 07-145 (études d'impact) | baseGeneralCriteria.ts | 🟡 P2 |
| Loi 05-12 (eau) | baseGeneralCriteria.ts | 🟡 P2 |
| Loi 90-11 (travail) | baseGeneralCriteria.ts | 🟡 P2 |
| Loi 90-29 (urbanisme) | updCriteria.ts | 🟡 P2 |
| Loi 18-09 (amendement loi 09-03) | loi-09-03 amendments | 🟡 P2 |

---

## Audit automatique

Lancer depuis la racine du repo :
```bash
node legal_refs/audit.js
```
Produces: liste de tous les articles par fichier, doublons d'instruments détectés, lacunes de numérotation signalées.

---

*Tous les textes proviennent du Journal Officiel de la République Algérienne Démocratique et Populaire (JORADP).*
