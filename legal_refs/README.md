# Références Légales — SafeInspect

Ce dossier est la **source de vérité légale unique** pour SafeInspect.
Chaque fichier = un seul instrument juridique, converti verbatim depuis le PDF JORADP source.
Claude et les autres agents IA doivent lire **uniquement ce dossier** pour toute référence légale.

> ⚠️ Vérifier toujours contre le JORADP original avant toute décision de conformité ou d'inspection.

---

## Règles de ce dossier (non négociables)

1. **Un fichier par instrument** — jamais deux fichiers pour la même loi/décret, même sous des noms différents.
2. **Convention de nommage** : `{type}-{numéro}-{slug}.md` tout en **minuscules**, ex. `loi-19-02-incendie-panique.md`. Jamais de majuscules ni d'espaces dans les noms de fichiers.
3. **Transcription verbatim uniquement** — aucun résumé, aucune paraphrase, aucun article inventé. Si un passage est illisible : `[ILLISIBLE — vérifier JORADP p.X]`.
4. **Chaque fichier se termine** par une section `## Contrôle de séquence` listant tous les numéros d’articles trouvés et signalant explicitement les lacunes.
5. **En-tête obligatoire** dans chaque fichier : titre officiel, date, JO n° et date, fichier source PDF, date de conversion, statut de vérification `⚠️ NON VÉRIFIÉ` ou `✅ VÉRIFIÉ [date] par [nom]`.
6. **Statut par défaut** : `⚠️ NON VÉRIFIÉ` — ne passer à `✅ VÉRIFIÉ` qu’après relecture humaine contre le JORADP.
7. **Ne jamais créer un nouveau fichier** si un instrument a déjà un fichier dans ce dossier — demander d’abord. Lancer `node legal_refs/audit.js` pour vérifier avant toute création.

---

## Fichiers disponibles

| Fichier | Instrument | Objet | Articles présents | État | Converti le |
|---|---|---|---|---|---|
| [loi-09-03-protection-consommateur.md](./loi-09-03-protection-consommateur.md) | Loi n° 09-03 du 25/02/2009 | Protection du consommateur et répression des fraudes | Art. 1–42, 53–79, 93–fin ⚠️ Art. 43–52, 80–92 manquants | ⚠️ Partiel — NON VÉRIFIÉ | 2026-08 |
| [loi-03-10-protection-environnement.md](./loi-03-10-protection-environnement.md) | Loi n° 03-10 du 19/07/2003 | Protection de l’environnement dans le cadre du développement durable | 114 articles | ⚠️ NON VÉRIFIÉ | 2026-08 |
| [loi-01-19-gestion-dechets.md](./loi-01-19-gestion-dechets.md) | Loi n° 01-19 du 12/12/2001 | Gestion, contrôle et élimination des déchets | → voir Contrôle de séquence dans le fichier | ⚠️ NON VÉRIFIÉ | 2026-08 |
| [loi-19-02-incendie-panique.md](./loi-19-02-incendie-panique.md) | Loi n° 19-02 du **17 juillet 2019** (JO n° 46 du 21/07/2019) | Règles générales de prévention des risques d’incendie et de panique dans les ERP | Art. 3, 5, 6, 11–17, 21 (partiel — texte focalisé sur ERP/classification) | ⚠️ Partiel — NON VÉRIFIÉ | 2026-08 |
| [decret-07-144-etablissements-classes-nomenclature.md](./decret-07-144-etablissements-classes-nomenclature.md) | Décret exécutif n° 07-144 du 19 mai 2007 (JO n° 34) | Nomenclature des établissements classés (rubriques 1100–2922) | Art. 1–4 + rubriques 1100–1242 intégrales, 1243+ voir PDF source | ⚠️ Partiel — NON VÉRIFIÉ | 2026-08 |
| [decret-17-140-securite-sanitaire-aliments.md](./decret-17-140-securite-sanitaire-aliments.md) | Décret exécutif n° 17-140 du 11/04/2017 | Sécurité sanitaire des aliments / HACCP | → voir Contrôle de séquence dans le fichier | ⚠️ NON VÉRIFIÉ | 2026-08 |
| [decret-91-05-hygiene-securite-milieu-travail.md](./decret-91-05-hygiene-securite-milieu-travail.md) | Décret exécutif n° 91-05 du 19/01/1991 | Prescriptions générales de protection — hygiène et sécurité en milieu de travail | → voir Contrôle de séquence dans le fichier | ⚠️ NON VÉRIFIÉ | 2026-08-08 |
| [decret-93-120-medecine-du-travail.md](./decret-93-120-medecine-du-travail.md) | Décret exécutif n° 93-120 du 15/05/1993 (JO n° 33 du 19/05/1993) | Organisation de la médecine du travail | Pas d’articles numérotés extraits — texte sous forme de tableau de synthèse | ⚠️ Résumé — NON VÉRIFIÉ — texte intégral à ajouter | 2026-08 |
| [decret-06-198-etablissements-classes.md](./decret-06-198-etablissements-classes.md) | Décret exécutif n° 06-198 du 31/05/2006 | Établissements classés — régimes d’autorisation et de déclaration | → voir Contrôle de séquence dans le fichier | ⚠️ NON VÉRIFIÉ | 2026-08 |
| [decret-09-19.md](./decret-09-19.md) | Décret exécutif n° 09-19 | Collecteurs agréés de déchets spéciaux dangereux | → voir Contrôle de séquence dans le fichier | ⚠️ NON VÉRIFIÉ | 2026-08 |
| [aim-gpl2-regles-techniques-securite.md](./aim-gpl2-regles-techniques-securite.md) | AIM / GPL2 — Arrêté interm. (v. 14/03/2022) | Règles techniques de sécurité pour installations et points de vente GPL ≤ 6 t | Articles par section (Art. 5, 8, 12–14, 27, 30) | ⚠️ NON VÉRIFIÉ — source Scribd, non JORADP | 2026-08 |
| [arrete-interministeriel-2025-liaison-froide.md](./arrete-interministeriel-2025-liaison-froide.md) | Arrêté interministériel du 7 mai 2025 (JO n° 43/2025) | Conditions d’hygiène dans la restauration — liaison froide/chaude | Pas d’articles numérotés extraits — valeurs de référence issues du contexte réglementaire | ⚠️ Partiel — NON VÉRIFIÉ — texte intégral JO 43/2025 à intégrer | 2026-08 |

> **Note renommage :** `Decret-07-144.md` → `decret-07-144-etablissements-classes-nomenclature.md` et `Decret-17-140.md` → `decret-17-140-securite-sanitaire-aliments.md` (anciens noms PascalCase supprimés — convention lowercase appliquée).

---

## Alertes fichiers — à améliorer en priorité

| Fichier | Problème | Action requise |
|---|---|---|
| `decret-93-120-medecine-du-travail.md` | Texte de synthèse seulement — aucun article verbatim | Fournir le PDF JORADP pour reconversion intégrale |
| `arrete-interministeriel-2025-liaison-froide.md` | Valeurs de référence, pas verbatim | Télécharger JO n° 43/2025 et reconvertir |
| `decret-07-144-*` | Rubriques 1243–2922 manquantes | PDF pages 15–102 à traiter |
| `loi-09-03-*` | Art. 43–52 et 80–92 manquants | Pages PDF correspondantes à fournir |
| `loi-19-02-*` | Seuls arts. 3, 5–6, 11–17, 21 présents | PDF intégral à fournir |

---

## Doublons résolus — historique complet

| Fichier supprimé | Raison | Date | Canonique conservé |
|---|---|---|---|
| `loi-01-19.md` | Stub vide | 2026-08-08 | `loi-01-19-gestion-dechets.md` |
| `loi-03-10.md` | Stub vide | 2026-08-08 | `loi-03-10-protection-environnement.md` |
| `loi-09-03.md` | Stub vide | 2026-08-08 | `loi-09-03-protection-consommateur.md` |
| `Decret-06-198.md` (stub) | Stub vide | 2026-08-08 | `decret-06-198-etablissements-classes.md` |
| `loi-19-02-prevention-incendie-panique.md` | Doublon (4 740 vs 4 725 o) | 2026-08-08 | `loi-19-02-incendie-panique.md` |
| `aim-gpl2-securite-installations-gpl.md` | Doublon quasi-identique | 2026-08-08 | `aim-gpl2-regles-techniques-securite.md` |
| `arrete-interministeriel-7mai2025-liaison-froide.md` | Doublon incomplet (2 240 vs 2 949 o) | 2026-08-08 | `arrete-interministeriel-2025-liaison-froide.md` |
| `decret-91-05-hygiene-securite-travail.md` | Doublon incomplet (18 155 vs 36 859 o) | 2026-08-08 | `decret-91-05-hygiene-securite-milieu-travail.md` |
| `decret-93-120-medecine-travail.md` | Doublon quasi-identique | 2026-08-08 | `decret-93-120-medecine-du-travail.md` |
| `Decret-07-144.md` | Renommé — PascalCase → lowercase | 2026-08-08 | `decret-07-144-etablissements-classes-nomenclature.md` |
| `Decret-17-140.md` | Renommé — PascalCase → lowercase | 2026-08-08 | `decret-17-140-securite-sanitaire-aliments.md` |

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
| Décret 07-145 (études d’impact) | baseGeneralCriteria.ts | 🟡 P2 |
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
Produit : liste de tous les articles par fichier, doublons d’instruments détectés, lacunes de numérotation signalées.

> **Note audit.js :** Le script détecte les références à "Art. N" dans tout le texte (y compris les renvois). Un résultat “sans lacune” est une condition nécessaire mais non suffisante — vérifier aussi physiquement les sections `## Contrôle de séquence` dans chaque fichier.

---

*Tous les textes proviennent du Journal Officiel de la République Algérienne Démocratique et Populaire (JORADP).*
