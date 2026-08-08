# Références légales — SafeInspect

Ce dossier contient les textes législatifs et réglementaires algériens utilisés comme sources de vérité (ground-truth) pour les checklists d'inspection de l'application SafeInspect.

> ⚠️ **Avertissement général :** Tous les fichiers marqués `⚠️ NON VÉRIFIÉ` doivent être validés contre le texte original JORADP avant toute décision légale ou d'application. Ne jamais se fier uniquement à ces fichiers pour une décision de conformité.

---

## Règles de gestion de ce dossier

- **Un seul fichier par instrument légal** — jamais de doublons
- **Convention de nommage :** `{type}-{numéro}-{slug-topic}.md` en minuscules kebab-case
- **Source canonique unique :** `/legal_refs/` — le dossier `docs/legal_sources/` est **obsolète et supprimé**
- **Toute modification** doit mettre à jour ce README dans le même commit

---

## Index des fichiers

| Fichier | Instrument | Objet | Articles | Statut |
|---|---|---|---|---|
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 du 25 février 2009 | Protection du consommateur et répression des fraudes | Art. 1–72 | ✅ Texte intégral |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 du 19 juillet 2003 | Protection de l'environnement dans le cadre du développement durable | Art. 1–113 | ✅ Texte intégral |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 du 12 décembre 2001 | Gestion, contrôle et élimination des déchets | Art. 1–65 | ✅ Texte intégral |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 du 17 juillet 2019 | Règles générales de prévention des risques d'incendie et de panique | Art. 1–? | ⚠️ Partiel — à compléter depuis PDF source |
| `Decret-17-140.md` | Décret exécutif n° 17-140 du 27 avril 2017 | Conditions et modalités d'ouverture et d'exploitation des établissements hôteliers | — | ✅ Texte intégral |
| `Decret-07-144.md` | Décret exécutif n° 07-144 du 19 mai 2007 | Conditions et modalités de création et d'exploitation des boulangeries-pâtisseries | — | ✅ Texte intégral |
| `decret-06-198-etablissements-classes.md` | Décret exécutif n° 06-198 du 31 mai 2006 | Réglementation des établissements classés | — | ✅ Texte intégral |
| `decret-09-19.md` | Décret exécutif n° 09-19 du 20 janvier 2009 | Conditions d'exercice des activités de restauration | — | ✅ Texte intégral |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret exécutif n° 91-05 du 19 janvier 1991 | Prescriptions générales de protection en matière d'hygiène et de sécurité en milieu de travail | Art. 1–68 | ✅ Texte intégral — converti depuis PDF le 2026-08-08 |
| `decret-93-120-medecine-du-travail.md` | Décret exécutif n° 93-120 | Médecine du travail | — | ⚠️ Partiel — à compléter depuis PDF source |
| `aim-gpl2-regles-techniques-securite.md` | AIM / GPL2 — Règles Techniques de Sécurité | Règles techniques de sécurité GPL | — | ⚠️ Statut à vérifier |
| `arrete-interministeriel-2025-liaison-froide.md` | Arrêté interministériel du 7 mai 2025 | Liaison froide — conditions hygiéniques de préparation, conservation et transport | — | ⚠️ NON VÉRIFIÉ |

---

## Dossier docs/legal_sources/ — OBSOLÈTE

L'ancien dossier `docs/legal_sources/` contenait des doublons (versions .md et .pdf des mêmes instruments) et a été **consolidé dans `/legal_refs/`**. Il ne doit plus être utilisé ni alimenté. Les PDFs ne sont pas lisibles par les outils AI sur GitHub — seuls les fichiers `.md` de ce dossier font foi.

---

## Instruments à ajouter (backlog)

- Loi n° 88-07 du 26 janvier 1988 relative à l'hygiène, la sécurité et la médecine du travail (loi-mère du décret 91-05)
- Décret exécutif n° 93-120 complet (version actuelle partielle)
- Loi n° 19-02 complète (version actuelle partielle)
