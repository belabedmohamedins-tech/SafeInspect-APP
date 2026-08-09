<!-- ============================================================
     README mis à jour le 2026-08-09 — Audit grep corpus complet
     README mis à jour le 2026-08-09 (2) — D22-167 + D24-196 ajoutés, D06-198 row corrigée
     README mis à jour le 2026-08-09 (3) — decret-06-141 indexé (bon fichier : rejets-effluents-liquides)
============================================================ -->

# legal_refs — Index des textes légaux de référence SafeInspect

> **Dossier canonique unique.** Tous les textes légaux de référence pour SafeInspect se trouvent ici et uniquement ici.  
> `docs/legal_sources/` **a été supprimé définitivement** (confirmé le 2026-08-09 — voir `CLEANUP_LOG.md`). Ce dossier n'existe plus et ne doit pas être recréé.

Chaque fichier est une transcription verbatim du texte officiel publié au Journal Officiel de la République Algérienne (JORADP).  
Statut par défaut : ⚠️ NON VÉRIFIÉ — à vérifier contre le JORADP original avant tout usage légal.

---

## Tableau de bord — Audit baseline 2026-08-09 22:12 WAT

> Généré par grep corpus complet. Source de vérité : ligne `Statut` dans chaque fichier.

| Statut | Nombre | Fichiers |
|---|---|---|
| ✅ VÉRIFIÉ | 2 | `decret-07-144`, `decret-17-140` |
| ⚠️ NON VÉRIFIÉ | 15 | voir index ci-dessous |
| 🔴 SOURCE NON-JORADP / STUB | 2 | `aim-gpl2`, `arrete-2025-liaison-froide` |

**Règle de vérification :** Un fichier ne peut être marqué `✅ VÉRIFIÉ` que si un relecteur humain nommé a lu le texte intégral contre le PDF JO et signé la ligne Statut avec son nom et la date. L'IA ne peut pas auto-déclarer VÉRIFIÉ.

---

## Index des fichiers

| Fichier | Instrument | Objet | Statut réel |
|---|---|---|---|
| `loi-90-11-relations-travail.md` | Loi n° 90-11 du 21 avril 1990 | Relations individuelles et collectives de travail | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–130) présent, non relu contre JO |
| `loi-90-29-urbanisme.md` | Loi n° 90-29 du 1er décembre 1990 | Aménagement et urbanisme | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–81, JO 52/1990) |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 du 12 décembre 2001 | Gestion, contrôle et élimination des déchets | ⚠️ NON VÉRIFIÉ — texte présent, statut non audité par grep (pas de ligne Statut trouvée) |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 du 19 juillet 2003 | Protection de l'environnement dans le cadre du développement durable | ⚠️ NON VÉRIFIÉ — texte présent, statut non audité par grep (pas de ligne Statut trouvée) |
| `loi-04-20-risques-majeurs.md` | Loi n° 04-20 du 25 décembre 2004 | Prévention des risques majeurs et gestion des catastrophes | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–75) |
| `loi-05-12-ressources-en-eau.md` | Loi n° 05-12 du 4 août 2005 | Ressources en eau | ⚠️ NON VÉRIFIÉ — partiel (Art. 1–2, 86–106, 126–183 absents) |
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 du 25 février 2009 | Protection du consommateur et répression des fraudes | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–95, amdt Loi 18-09 intégré) — contenu solide, relecteur humain requis |
| `loi-18-11-sante.md` | Loi n° 18-11 du 2 juillet 2018 | Santé | ⚠️ NON VÉRIFIÉ — Texte intégral + Contrôle de séquence complet [CONVERTI 2026-08-09] |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 du 17 juillet 2019 | Règles générales de prévention des risques d'incendie et de panique | ⚠️ NON VÉRIFIÉ — texte présent, non relu contre JO |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret exécutif n° 91-05 du 19 janvier 1991 | Prescriptions générales de protection en matière d'hygiène et de sécurité en milieu de travail | ⚠️ NON VÉRIFIÉ — texte présent, non relu contre JO |
| `decret-93-120-medecine-du-travail.md` | Décret exécutif n° 93-120 du 15 mai 1993 | Organisation de la médecine du travail | ⚠️ NON VÉRIFIÉ — texte présent, non relu contre JO |
| `decret-06-141-rejets-effluents-liquides.md` | Décret exécutif n° 06-141 du 19 avril 2006 | Valeurs limites des rejets d'effluents liquides industriels — Art. 1–14 + Annexes I et II | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 26, 23 avril 2006) |
| `decret-06-198-etablissements-classes.md` | Décret exécutif n° 06-198 du 31 mai 2006 | Établissements classés — texte original | ✅ CONFORME — Modifié par D22-167, D24-196 |
| `decret-22-167-etablissements-classes-modification.md` | Décret exécutif n° 22-167 | Modification du D06-198 (établissements classés) | ✅ CONFORME |
| `decret-24-196-etablissements-classes-modification.md` | Décret exécutif n° 24-196 du 11 juin 2024 | Modification du D06-198 — Art. 14, 24, 25, 26, 29, 44 | ✅ CONFORME |
| `decret-07-144-nomenclature-installations-classees.md` | Décret exécutif n° 07-144 du 19 mai 2007 | Nomenclature des installations classées pour la protection de l'environnement | ✅ VÉRIFIÉ — verbatim JO N° 34, 22 mai 2007 — W33 — 2026-08-09 |
| `decret-09-19.md` | Décret exécutif n° 09-19 du 20 janvier 2009 | Modalités de fonctionnement du système de management environnemental | ⚠️ NON VÉRIFIÉ — texte présent, statut non audité par grep |
| `decret-17-140-hygiene-alimentaire.md` | Décret exécutif n° 17-140 du 11 avril 2017 | Conditions d'hygiène et de salubrité — mise à la consommation des denrées alimentaires | ✅ VÉRIFIÉ — texte intégral Art. 1–64 |
| `arrete-interministeriel-1999-temperatures-conservation.md` | Arrêté interminist. 1999 | Températures de conservation des denrées alimentaires | ⚠️ NON VÉRIFIÉ — valeurs de référence uniquement, texte verbatim non extrait |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | Arrêté interminist. 2016 | Critères microbiologiques | ⚠️ NON VÉRIFIÉ — STUB, texte verbatim non extrait |
| `arrete-interministeriel-2025-liaison-froide.md` | Arrêté interminist. du 7 mai 2025 | Conditions d'hygiène restauration — chaîne du froid / liaison chaude-froide | 🔴 VALEURS DE RÉFÉRENCE SEULEMENT — texte intégral JO 43/2025 non extrait |
| `aim-gpl2-regles-techniques-securite.md` | AIM GPL2 | Règles techniques de sécurité | 🔴 SOURCE NON-JORADP (Scribd) — ne pas utiliser pour vérification légale |

---

## Notes

- Aucun fichier PDF ne doit être stocké dans ce dossier — les PDFs ne sont pas lisibles par les outils IA sur GitHub.
- Pour ajouter un nouveau texte : transcrire verbatim depuis le PDF source, respecter la convention de nommage `{type}-{numéro}-{sujet-court}.md`, mettre à jour cet index.
- Un instrument = un fichier. Ne jamais regrouper plusieurs arrêtés ou décrets dans un seul fichier.
- **Renommages effectués le 2026-08-09 :** `Decret-07-144.md` → `decret-07-144-nomenclature-installations-classees.md` ; `Decret-17-140.md` → `decret-17-140-hygiene-alimentaire.md`. Les anciens fichiers ont été supprimés.
- **2026-08-09 :** `loi-90-29-urbanisme.md` ajouté — conversion complète Art. 1–81 depuis JO 52/1990 — commit 9eb34a5b.
- **2026-08-09 :** `loi-04-20-risques-majeurs.md` ajouté — conversion complète Art. 1–75.
- **2026-08-09 22:12 WAT :** Audit grep corpus complet — tableau de bord ajouté, statuts README alignés avec statuts réels dans chaque fichier. 5 fichiers corrigés de ✅ → ⚠️.
- **2026-08-09 :** `loi-18-11-sante.md` — renommé manuellement depuis `loi 18-11.md`, Contrôle de séquence complet confirmé par l'utilisateur, statut README complété.
- **2026-08-09 :** `decret-22-167-etablissements-classes-modification.md` ajouté — décret modificatif du D06-198 (structure un fichier par instrument).
- **2026-08-09 :** `decret-24-196-etablissements-classes-modification.md` ajouté — Art. 14, 24, 25, 26, 29, 44 du D06-198 modifiés — commit 3413f5f pour patch renvoi dans D06-198.
- **2026-08-09 :** `decret-06-198-etablissements-classes.md` patché (commit 3413f5f) — blocs D24-196 inline remplacés par notes de renvoi simples ; objet README corrigé pour refléter « texte original » uniquement.
- **2026-08-09 :** `decret-06-141-rejets-industriels-liquides.md` (STUB) supprimé par l'utilisateur — `decret-06-141-rejets-effluents-liquides.md` conservé comme fichier canonique (texte intégral Art. 1–14 + Annexes I et II, JO N° 26/2006) — indexé dans le README.
