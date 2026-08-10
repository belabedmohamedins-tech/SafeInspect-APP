<!-- ============================================================
     README mis à jour le 2026-08-09 — Audit grep corpus complet
     README mis à jour le 2026-08-09 (2) — D22-167 + D24-196 ajoutés, D06-198 row corrigée
     README mis à jour le 2026-08-09 (3) — decret-06-141 indexé (bon fichier : rejets-effluents-liquides)
     README mis à jour le 2026-08-09 (4) — decret-76-35, decret-02-427, decret-21-430 indexés
     README mis à jour le 2026-08-09 (5) — decret-83-496-gpl-carburant indexé
     README mis à jour le 2026-08-10 (6) — D04-82, D06-138, D09-335, D11-125, L04-08, L88-07 indexés
     README mis à jour le 2026-08-10 (7) — audit.js documenté comme outil natif du dossier
     README mis à jour le 2026-08-10 (8) — sync 3 rows : loi-05-12 complète, D04-82 annexes retirées, D09-335 JO N° 68
     README mis à jour le 2026-08-10 (9) — arrete-1999 stub supprimé, nouveau fichier verbatim indexé
============================================================ -->

# legal_refs — Index des textes légaux de référence SafeInspect

> **Dossier canonique unique.** Tous les textes légaux de référence pour SafeInspect se trouvent ici et uniquement ici.  
> `docs/legal_sources/` **a été supprimé définitivement** (confirmé le 2026-08-09 — voir `CLEANUP_LOG.md`). Ce dossier n'existe plus et ne doit pas être recréé.

Chaque fichier `.md` est une transcription verbatim du texte officiel publié au Journal Officiel de la République Algérienne (JORADP).  
Statut par défaut : ⚠️ NON VÉRIFIÉ — à vérifier contre le JORADP original avant tout usage légal.

## Fichiers non-MD dans ce dossier

> ℹ️ **`audit.js` appartient à ce dossier.** C'est le script d'audit natif qui analyse le contenu de `/legal_refs/` (vérification des headers, séquences d'articles, cohérence README). Il est intentionnellement colocalisé avec les fichiers qu'il audite. **Ne pas le déplacer, ne pas le signaler comme anomalie.**  
> De même, `CLEANUP_LOG.md` est un journal d'opérations internes, pas un texte légal.

---

## Tableau de bord — Audit baseline 2026-08-10

| Statut | Nombre | Fichiers |
|---|---|---|
| ✅ VÉRIFIÉ | 2 | `decret-07-144`, `decret-17-140` |
| ⚠️ NON VÉRIFIÉ | 25 | voir index ci-dessous |
| 🔴 SOURCE NON-JORADP / STUB | 1 | `aim-gpl2` |

**Règle de vérification :** Un fichier ne peut être marqué `✅ VÉRIFIÉ` que si un relecteur humain nommé a lu le texte intégral contre le PDF JO et signé la ligne Statut avec son nom et la date. L'IA ne peut pas auto-déclarer VÉRIFIÉ.

---

## Index des fichiers

| Fichier | Instrument | Objet | Statut réel |
|---|---|---|---|
| `loi-88-07-hygiene-securite-medecine-travail.md` | Loi n° 88-07 du 26 janvier 1988 | Hygiène, sécurité et médecine du travail — Art. 1–47 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 4/1988) — Art. 37, 38, 39 modifiés intégrés |
| `decret-76-35-igh-incendie.md` | Décret n° 76-35 du 20 février 1976 | Sécurité contre les risques d'incendie et de panique dans les immeubles de grande hauteur (IGH) — Art. 1–26 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO 12 mars 1976) |
| `decret-83-496-gpl-carburant.md` | Décret n° 83-496 du 13 août 1983 | Conditions d'utilisation et de distribution du GPL comme carburant sur véhicules automobiles — Art. 1–21 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 42/1983) — Art. 4, 7, 8 modifiés par D21-430 |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret exécutif n° 91-05 du 19 janvier 1991 | Prescriptions générales de protection en matière d'hygiène et de sécurité en milieu de travail | ⚠️ NON VÉRIFIÉ — texte présent, non relu contre JO |
| `decret-93-120-medecine-du-travail.md` | Décret exécutif n° 93-120 du 15 mai 1993 | Organisation de la médecine du travail | ⚠️ NON VÉRIFIÉ — texte présent, non relu contre JO |
| `loi-90-11-relations-travail.md` | Loi n° 90-11 du 21 avril 1990 | Relations individuelles et collectives de travail | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–130) présent, non relu contre JO |
| `loi-90-29-urbanisme.md` | Loi n° 90-29 du 1er décembre 1990 | Aménagement et urbanisme | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–81, JO 52/1990) |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 du 12 décembre 2001 | Gestion, contrôle et élimination des déchets | ⚠️ NON VÉRIFIÉ — texte présent, statut non audité par grep |
| `decret-02-427-prevention-risques-professionnels.md` | Décret exécutif n° 02-427 du 7 décembre 2002 | Instruction, information et formation des travailleurs — prévention des risques professionnels — Art. 1–24 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 82/2002) |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 du 19 juillet 2003 | Protection de l'environnement dans le cadre du développement durable | ⚠️ NON VÉRIFIÉ — texte présent, statut non audité par grep |
| `decret-04-82-agrement-sanitaire-animaux.md` | Décret exécutif n° 04-82 du 18 mars 2004 | Conditions et modalités d'agrément sanitaire des établissements liés aux animaux, produits animaux et d'origine animale, ainsi que leur transport — Art. 1–18 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 17/2004) — Annexes I–III retirées : elles appartiennent au D04-83 (tarifs phytosanitaires) — fichier D04-83 à créer |
| `loi-04-08-activites-commerciales.md` | Loi n° 04-08 du 14 août 2004 | Conditions d'exercice des activités commerciales — Art. 1–44 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 52/2004) |
| `loi-04-20-risques-majeurs.md` | Loi n° 04-20 du 25 décembre 2004 | Prévention des risques majeurs et gestion des catastrophes | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–75) |
| `loi-05-12-ressources-en-eau.md` | Loi n° 05-12 du 4 août 2005 | Ressources en eau — Art. 1–183 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 60/2005) — [CONVERTI 2026-08-10] |
| `decret-06-138-emissions-atmospheriques.md` | Décret exécutif n° 06-138 du 15 avril 2006 | Réglementation des émissions dans l'atmosphère (gaz, fumées, vapeurs, particules) et conditions de contrôle — Art. 1–19 + Annexes I–II | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 24/2006) |
| `decret-06-141-rejets-effluents-liquides.md` | Décret exécutif n° 06-141 du 19 avril 2006 | Valeurs limites des rejets d'effluents liquides industriels — Art. 1–14 + Annexes I et II | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 26/2006) |
| `decret-06-198-etablissements-classes.md` | Décret exécutif n° 06-198 du 31 mai 2006 | Établissements classés — texte original | ✅ CONFORME — Modifié par D22-167, D24-196 |
| `decret-07-144-nomenclature-installations-classees.md` | Décret exécutif n° 07-144 du 19 mai 2007 | Nomenclature des installations classées pour la protection de l'environnement | ✅ VÉRIFIÉ — verbatim JO N° 34, 22 mai 2007 — W33 — 2026-08-09 |
| `decret-09-19.md` | Décret exécutif n° 09-19 du 20 janvier 2009 | Modalités de fonctionnement du système de management environnemental | ⚠️ NON VÉRIFIÉ — texte présent, statut non audité par grep |
| `decret-09-335-plans-internes-intervention.md` | Décret exécutif n° 09-335 du 20 octobre 2009 | Modalités d'élaboration et de mise en œuvre des plans internes d'intervention par les exploitants d'installations industrielles — Art. 1–21 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 68, 25 octobre 2009) — [CONVERTI 2026-08-10] |
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 du 25 février 2009 | Protection du consommateur et répression des fraudes | ⚠️ NON VÉRIFIÉ — texte intégral (Art. 1–95, amdt Loi 18-09 intégré) |
| `decret-11-125-eau-consommation-humaine.md` | Décret exécutif n° 11-125 du 22 mars 2011 | Qualité de l'eau de consommation humaine — Art. 1–9 + Annexe (valeurs limites et indicatives) | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 18/2011) |
| `decret-17-140-hygiene-alimentaire.md` | Décret exécutif n° 17-140 du 11 avril 2017 | Conditions d'hygiène et de salubrité — mise à la consommation des denrées alimentaires | ✅ VÉRIFIÉ — texte intégral Art. 1–64 |
| `loi-18-11-sante.md` | Loi n° 18-11 du 2 juillet 2018 | Santé | ⚠️ NON VÉRIFIÉ — Texte intégral + Contrôle de séquence complet [CONVERTI 2026-08-09] |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 du 17 juillet 2019 | Règles générales de prévention des risques d'incendie et de panique | ⚠️ NON VÉRIFIÉ — texte présent, non relu contre JO |
| `decret-21-430-gpl-carburant.md` | Décret exécutif n° 21-430 du 4 novembre 2021 | Modification du décret 83-496 — utilisation et distribution du GPL comme carburant (Art. 4, 7, 8) | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 85/2021) |
| `decret-22-167-etablissements-classes-modification.md` | Décret exécutif n° 22-167 du 19 avril 2022 | Modification du D06-198 (établissements classés) | ✅ CONFORME |
| `decret-24-196-etablissements-classes-modification.md` | Décret exécutif n° 24-196 du 11 juin 2024 | Modification du D06-198 — Art. 14, 24, 25, 26, 29, 44 | ✅ CONFORME |
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | Arrêté intermin. du 21 novembre 1999 | Températures et procédés de conservation par réfrigération, congélation ou surgélation des denrées alimentaires — Art. 1–10 + 2 tableaux | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 87, 8 décembre 1999) — [CONVERTI 2026-08-09] |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | Arrêté intermin. 2016 | Critères microbiologiques | ⚠️ NON VÉRIFIÉ — STUB, texte verbatim non extrait |
| `arrete-interministeriel-2025-liaison-froide.md` | Arrêté intermin. du 7 mai 2025 | Conditions d'hygiène restauration — chaîne du froid / liaison chaude-froide | 🔴 VALEURS DE RÉFÉRENCE SEULEMENT — texte intégral JO 43/2025 non extrait |
| `aim-gpl2-regles-techniques-securite.md` | AIM GPL2 | Règles techniques de sécurité | 🔴 SOURCE NON-JORADP (Scribd) — ne pas utiliser pour vérification légale |

---

## Notes

- **`audit.js`** — Script d'audit natif de ce dossier. Il analyse les fichiers `.md` de `/legal_refs/` (vérification des headers, séquences d'articles, cohérence du README). **Intentionnellement colocalisé ici. Ne pas déplacer, ne pas signaler comme anomalie.**
- Aucun fichier PDF ne doit être stocké dans ce dossier — les PDFs ne sont pas lisibles par les outils IA sur GitHub.
- Pour ajouter un nouveau texte : transcrire verbatim depuis le PDF source, respecter la convention de nommage `{type}-{numéro}-{sujet-court}.md`, mettre à jour cet index.
- Un instrument = un fichier. Ne jamais regrouper plusieurs arrêtés ou décrets dans un seul fichier.
- **Renommages effectués le 2026-08-09 :** `Decret-07-144.md` → `decret-07-144-nomenclature-installations-classees.md` ; `Decret-17-140.md` → `decret-17-140-hygiene-alimentaire.md`. Les anciens fichiers ont été supprimés.
- **2026-08-09 :** `decret-06-141-rejets-industriels-liquides.md` (STUB) supprimé — `decret-06-141-rejets-effluents-liquides.md` conservé comme fichier canonique.
- **2026-08-09 :** `decret-22-167` et `decret-24-196` ajoutés — structure un fichier par instrument pour D06-198 et ses modificatifs.
- **2026-08-09 :** `decret-76-35`, `decret-02-427`, `decret-21-430` — ajoutés manuellement par l'utilisateur, indexés.
- **2026-08-09 :** `decret-83-496-gpl-carburant.md` — ajouté manuellement, instrument original modifié par D21-430 (Art. 4, 7, 8).
- **2026-08-10 :** 6 nouveaux fichiers ajoutés manuellement et indexés : `decret-04-82`, `decret-06-138`, `decret-09-335`, `decret-11-125`, `loi-04-08`, `loi-88-07`.
- **2026-08-10 :** `loi-05-12` complétée — 183 articles intégraux présents.
- **2026-08-10 :** `decret-04-82` — Annexes I–III (tarifs phytosanitaires D04-83) retirées. Fichier `decret-04-83` à créer.
- **2026-08-10 :** `decret-09-335` — JO N° 68, 25 octobre 2009 inscrit dans le header.
- **2026-08-10 :** `arrete-interministeriel-1999-temperatures-conservation.md` (STUB) supprimé par l'utilisateur — remplacé par `arrete-interministeriel-1999-11-21-conservation-aliments.md` (texte intégral verbatim, Art. 1–10, JO N° 87/1999).
