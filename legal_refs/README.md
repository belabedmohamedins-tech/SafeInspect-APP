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
     README mis à jour le 2026-08-10 (10) — arrete-2016 stub supprimé, nouveau fichier verbatim indexé — W19 CLOSED
     README mis à jour le 2026-08-10 (11) — arrete-2025 stub supprimé, nouveau fichier verbatim indexé — W20 CLOSED
     README mis à jour le 2026-08-10 (12) — aim-gpl2 supprimé, projet-arrete-gpl indexé — statut PROJET NON PUBLIÉ JORADP
     README mis à jour le 2026-08-10 (13) — decret-90-245-appareils-pression-gaz ajouté — [CONVERTI 2026-08-10]
     README mis à jour le 2026-08-10 (14) — D90-245 JO N° 36 confirmé par utilisateur depuis PDF officiel
     README mis à jour le 2026-08-10 (15) — D04-83 hors scope SafeInspect — mention supprimée
     README mis à jour le 2026-08-10 (16) — decret-09-19 objet corrigé (collecte déchets spéciaux, JO N°6/2009) + loi-01-19 et decret-09-19 Contrôle de séquence + JO header patché
     README mis à jour le 2026-08-10 (17) — D09-335 marqué ABROGÉ par D25-63 ; +3 rows : D21-319, D21-261, A2011-02-06-permis-construire-energie
     README mis à jour le 2026-08-10 (18) — D21-261 et A2011-02-06 marqués CONVERTIS ; A2011 date 1431→1432 corrigée après vérification JORADP par l'utilisateur
     README mis à jour le 2026-08-10 (19) — 6 corrections statut : loi-03-10 audité, D06-138 annexes corrompues, D25-63 et D21-319 stubs retirés, loi-18-11 450 art., D21-319 JO N° 64
     README mis à jour le 2026-08-10 (20) — 4 fichiers marqués CONVERTIS : decret-91-05, decret-93-120, loi-90-11, loi-19-02
     README mis à jour le 2026-08-10 (21) — decret-24-197 supprimé (hors scope SafeInspect) : row index + tableau de bord + note
     README mis à jour le 2026-08-10 (22) — loi-90-29 et loi-04-20 marqués CONVERTIS par utilisateur depuis PDF officiel
     README mis à jour le 2026-08-10 (23) — decret-11-125 et loi-09-03 marqués CONVERTIS par utilisateur depuis PDF officiel
     README mis à jour le 2026-08-11 (24) — 21 fichiers promus ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed
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

## Tableau de bord — Audit baseline 2026-08-11 (mis à jour patch 24)

| Statut | Nombre | Fichiers |
|---|---|---|
| ✅ VÉRIFIÉ | 23 | `decret-07-144`, `decret-17-140` + 21 fichiers vérifiés 2026-08-11 par Belabed Mohamed (voir index) |
| ✅ CONFORME (converti par utilisateur depuis PDF officiel) | 3 | `decret-06-198`, `decret-22-167`, `decret-24-196` |
| ⚠️ NON VÉRIFIÉ — texte intégral converti par utilisateur | 15 | `decret-90-245`, `loi-03-10`, `decret-06-141`, `decret-09-19`, `loi-01-19`, `loi-05-12`, `decret-02-427`, `arrete-1999-conservation-aliments`, `arrete-2016-microbiologiques`, `arrete-2025-hygiene-restauration`, `decret-09-335` (ABROGÉ) |
| ⚠️ NON VÉRIFIÉ — PARTIEL (lacunes documentées) | 1 | `decret-06-138` |
| ⚠️ ABROGÉ (conservé pour référence historique) | 1 | `decret-09-335` |
| 🔴 PROJET NON PUBLIÉ JORADP | 1 | `projet-arrete-gpl-installations-securite` |

**Règle de vérification :** Un fichier ne peut être marqué `✅ VÉRIFIÉ` que si un relecteur humain nommé a lu le texte intégral contre le PDF JO et signé la ligne Statut avec son nom et la date. L'IA ne peut pas auto-déclarer VÉRIFIÉ.

---

## Index des fichiers

| Fichier | Instrument | Objet | Statut réel |
|---|---|---|---|
| `loi-88-07-hygiene-securite-medecine-travail.md` | Loi n° 88-07 du 26 janvier 1988 | Hygiène, sécurité et médecine du travail — Art. 1–47 complets | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-76-35-igh-incendie.md` | Décret n° 76-35 du 20 février 1976 | Sécurité contre les risques d'incendie et de panique dans les immeubles de grande hauteur (IGH) — Art. 1–26 | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-83-496-gpl-carburant.md` | Décret n° 83-496 du 13 août 1983 | Conditions d'utilisation et de distribution du GPL comme carburant sur véhicules automobiles — Art. 1–21 | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-90-245-appareils-pression-gaz.md` | Décret exécutif n° 90-245 du 18 août 1990 | Réglementation des appareils à pression de gaz — construction, installation, exploitation — Art. 1–24 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 36/1990) — [CONVERTI 2026-08-10 par utilisateur depuis PDF officiel] |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret exécutif n° 91-05 du 19 janvier 1991 | Prescriptions générales de protection en matière d'hygiène et de sécurité en milieu de travail | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-93-120-medecine-du-travail.md` | Décret exécutif n° 93-120 du 15 mai 1993 | Organisation de la médecine du travail | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-90-11-relations-travail.md` | Loi n° 90-11 du 21 avril 1990 | Relations individuelles et collectives de travail | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-90-29-urbanisme.md` | Loi n° 90-29 du 1er décembre 1990 | Aménagement et urbanisme — Art. 1–81 complets | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 du 12 décembre 2001 | Gestion, contrôle et élimination des déchets — Art. 1–72 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 77/2001) — Contrôle de séquence présent — [PATCHÉ 2026-08-10] |
| `decret-02-427-prevention-risques-professionnels.md` | Décret exécutif n° 02-427 du 7 décembre 2002 | Instruction, information et formation des travailleurs — prévention des risques professionnels — Art. 1–24 | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 82/2002) — [CONVERTI par utilisateur depuis PDF] |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 du 19 juillet 2003 | Protection de l'environnement dans le cadre du développement durable — Art. 1–89 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 43/2003) — séquence Art. 1–89 auditée 2026-08-10, aucun gap |
| `decret-04-82-agrement-sanitaire-animaux.md` | Décret exécutif n° 04-82 du 18 mars 2004 | Conditions et modalités d'agrément sanitaire des établissements liés aux animaux, produits animaux et d'origine animale, ainsi que leur transport — Art. 1–18 + 3 annexes | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-04-08-activites-commerciales.md` | Loi n° 04-08 du 14 août 2004 | Conditions d'exercice des activités commerciales — Art. 1–44 complets | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-04-20-risques-majeurs.md` | Loi n° 04-20 du 25 décembre 2004 | Prévention des risques majeurs et gestion des catastrophes — Art. 1–75 complets | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-05-12-ressources-en-eau.md` | Loi n° 05-12 du 4 août 2005 | Ressources en eau — Art. 1–183 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 60/2005) — [CONVERTI 2026-08-10] |
| `decret-06-138-emissions-atmospheriques.md` | Décret exécutif n° 06-138 du 15 avril 2006 | Réglementation des émissions dans l'atmosphère (gaz, fumées, vapeurs, particules) et conditions de contrôle — Art. 1–19 | ⚠️ NON VÉRIFIÉ — **PARTIEL — Annexes I–II corrompues par OCR** (JO N° 24/2006) — [CONVERTI par utilisateur, annexes à retravailler depuis PDF de meilleure qualité] |
| `decret-06-141-rejets-effluents-liquides.md` | Décret exécutif n° 06-141 du 19 avril 2006 | Valeurs limites des rejets d'effluents liquides industriels — Art. 1–14 + Annexes I et II | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-06-198-etablissements-classes.md` | Décret exécutif n° 06-198 du 31 mai 2006 | Établissements classés — texte original | ✅ CONFORME — Modifié par D22-167, D24-196 |
| `decret-07-144-nomenclature-installations-classees.md` | Décret exécutif n° 07-144 du 19 mai 2007 | Nomenclature des installations classées pour la protection de l'environnement | ✅ VÉRIFIÉ — verbatim JO N° 34, 22 mai 2007 — W33 — 2026-08-09 |
| `decret-09-19.md` | Décret exécutif n° 09-19 du 20 janvier 2009 | Réglementation de l'activité de collecte des déchets spéciaux — Art. 1er–17 complets | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 6/2009) — Contrôle de séquence présent — [PATCHÉ 2026-08-10] |
| `decret-09-335-plans-internes-intervention.md` | Décret exécutif n° 09-335 du 20 octobre 2009 | Modalités d'élaboration et de mise en œuvre des plans internes d'intervention par les exploitants d'installations industrielles — Art. 1–21 | ⚠️ ABROGÉ par D25-63 du 28/01/2025 (JO N° 07/2025) — conservé pour référence historique — voir `decret-25-63-plans-intervention-catastrophes.md` |
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 du 25 février 2009 | Protection du consommateur et répression des fraudes — Art. 1–95 | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-11-125-eau-consommation-humaine.md` | Décret exécutif n° 11-125 du 22 mars 2011 | Qualité de l'eau de consommation humaine — Art. 1–9 + Annexe (valeurs limites et indicatives) | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `arrete-interministeriel-2011-02-06-permis-construire-energie.md` | Arrêté intermin. du 3 Rabie El Aouel 1432 correspondant au 6 février 2011 | Procédures applicables en matière d'instruction et de délivrance du permis de construire des ouvrages d'énergie électrique et gazière — Art. 1–22 complets | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-17-140-hygiene-alimentaire.md` | Décret exécutif n° 17-140 du 11 avril 2017 | Conditions d'hygiène et de salubrité — mise à la consommation des denrées alimentaires | ✅ VÉRIFIÉ — texte intégral Art. 1–64 |
| `loi-18-11-sante.md` | Loi n° 18-11 du 2 juillet 2018 | Santé — Art. 1–450 complets (Art. 12–16 intégrés) | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 du 17 juillet 2019 | Règles générales de prévention des risques d'incendie et de panique | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-21-261-esp-equipements-hydrocarbures.md` | Décret exécutif n° 21-261 du 13 juin 2021 (2 Dhou El Kaâda 1442) | Réglementation des équipements sous pression (ESP) et équipements électriques destinés aux installations du secteur des hydrocarbures — Art. 1–104 complets | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-21-319-autorisation-exploitation-hydrocarbures.md` | Décret exécutif n° 21-319 du 14 août 2021 (5 Moharram 1443) | Régime d'autorisation d'exploitation des installations et ouvrages hydrocarbures — études d'impact, études de dangers, enquête publique — Art. 1er–98 + 4 annexes | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-21-430-gpl-carburant.md` | Décret exécutif n° 21-430 du 4 novembre 2021 | Modification du décret 83-496 — utilisation et distribution du GPL comme carburant (Art. 4, 7, 8) | ✅ VÉRIFIÉ 2026-08-10 par Mohamed Ins Belabèd |
| `decret-22-167-etablissements-classes-modification.md` | Décret exécutif n° 22-167 du 19 avril 2022 | Modification du D06-198 (établissements classés) | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `decret-24-196-etablissements-classes-modification.md` | Décret exécutif n° 24-196 du 11 juin 2024 | Modification du D06-198 — Art. 14, 24, 25, 26, 29, 44 | ✅ VÉRIFIÉ 2026-08-10 par Mohamed Ins Belabèd |
| `decret-25-63-plans-intervention-catastrophes.md` | Décret exécutif n° 25-63 du 28 janvier 2025 | Plans d'intervention en matière de risques de catastrophes (PPI + PII) — Art. 1–30, 4 chapitres — Abroge D09-335 | ✅ VÉRIFIÉ 2026-08-11 par Belabed Mohamed — converti et relu contre PDF officiel |
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | Arrêté intermin. du 21 novembre 1999 | Températures et procédés de conservation par réfrigération, congélation ou surgélation des denrées alimentaires — Art. 1–10 + 2 tableaux | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 87, 8 décembre 1999) — [CONVERTI 2026-08-09] |
| `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md` | Arrêté intermin. du 4 octobre 2016 | Critères microbiologiques des denrées alimentaires — Art. 1–14 + Annexe I (15 catégories) + Annexe II (techniques d'interprétation) | ⚠️ NON VÉRIFIÉ — texte intégral présent (JO N° 39, 2 juillet 2017) — [CONVERTI 2026-08-09] — W19 CLOSED |
| `arrete-interministeriel-2025-05-07-hygiene-restauration.md` | Arrêté intermin. du 7 mai 2025 | Conditions particulières d'hygiène et de salubrité dans les établissements de restauration — Art. 1–48, 14 sections | ⚠️ NON VÉRIFIÉ — texte intégral présent (signé par 6 ministres) — [CONVERTI 2026-08-09] — W20 CLOSED |
| `projet-arrete-gpl-installations-securite.md` | Projet d'arrêté intermin. (2021) — Ministre Energie & Mines + Ministre Intérieur | Règles techniques et de sécurité applicables aux installations et points de vente GPL ≤ 6 tonnes — Art. 1–24 + Annexes 1–2 (Annexes 3–5 : modèles non fournis) | 🔴 PROJET — NON PUBLIÉ AU JORADP — Art. 13 incomplet (valeur X non définie), Art. 14 manquant (numéro sauté) — ne pas utiliser pour vérification légale contraignante |

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
- **2026-08-10 :** `decret-04-82` — PDF source contenait également D04-83 (tarifs phytosanitaires). D04-83 est hors scope SafeInspect — non pertinent pour l'inspection HSE/industrielle. Aucun fichier D04-83 à créer.
- **2026-08-10 :** `decret-09-335` — JO N° 68, 25 octobre 2009 inscrit dans le header.
- **2026-08-10 :** `arrete-interministeriel-1999-temperatures-conservation.md` (STUB) supprimé par l'utilisateur — remplacé par `arrete-interministeriel-1999-11-21-conservation-aliments.md` (texte intégral verbatim, Art. 1–10, JO N° 87/1999).
- **2026-08-10 :** `arrete-interministeriel-2016-criteres-microbiologiques.md` (STUB) supprimé par l'utilisateur — remplacé par `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md` (texte intégral verbatim, Art. 1–14 + Annexes I–II, JO N° 39/2017). **W19 CLOSED.**
- **2026-08-10 :** `arrete-interministeriel-2025-liaison-froide.md` (STUB) supprimé par l'utilisateur — remplacé par `arrete-interministeriel-2025-05-07-hygiene-restauration.md` (texte intégral verbatim, Art. 1–48, 14 sections, signé par 6 ministres). **W20 CLOSED.**
- **2026-08-10 :** `aim-gpl2-regles-techniques-securite.md` (source non-JORADP, Scribd) supprimé par l'utilisateur — remplacé par `projet-arrete-gpl-installations-securite.md`. Statut : 🔴 PROJET NON PUBLIÉ AU JORADP — Art. 13 incomplet, Art. 14 manquant, Annexes 3–5 non fournies.
- **2026-08-10 :** `decret-90-245-appareils-pression-gaz.md` ajouté — Art. 1–24 complets, signé Mouloud HAMROUCHE. JO N° 36, 22 août 1990 — confirmé par l'utilisateur depuis PDF officiel. [CONVERTI 2026-08-10]
- **2026-08-10 :** `decret-09-19.md` — objet corrigé dans README (était "système de management environnemental", est "collecte des déchets spéciaux"). JO N° 6/2009 ajouté. Contrôle de séquence + header JO patchés dans le fichier.
- **2026-08-10 :** `loi-01-19-gestion-dechets.md` — JO N° 77/2001 + date de conversion ajoutés au header. Contrôle de séquence (Art. 1–72, aucun gap) ajouté en fin de fichier.
- **2026-08-10 :** `decret-09-335-plans-internes-intervention.md` — note d'abrogation ajoutée dans le header : ABROGÉ par D25-63 du 28/01/2025 (JO N° 07/2025). Fichier conservé pour référence historique.
- **2026-08-10 :** `decret-25-63-plans-intervention-catastrophes.md` — créé par l'utilisateur. Art. 1–30 complets, 4 chapitres, JO N° 07/2025. Abroge D09-335.
- **2026-08-10 :** `decret-21-319-autorisation-exploitation-hydrocarbures.md` — créé par l'utilisateur. Art. 1er–98 + 4 annexes complets. JO N° 64/2021. Abroge D08-312 et D15-09.
- **2026-08-10 :** `decret-21-261-esp-equipements-hydrocarbures.md` — converti par l'utilisateur depuis PDF (arh.gov.dz). Art. 1–104 complets. [CONVERTI 2026-08-10]
- **2026-08-10 :** `arrete-interministeriel-2011-02-06-permis-construire-energie.md` — converti par l'utilisateur depuis PDF (cntpp.dz). Art. 1–22 complets. JO N° 23, 17 avril 2011. [CONVERTI 2026-08-10]
- **2026-08-10 :** `arrete-interministeriel-2011-02-06-permis-construire-energie.md` — date hégirienne corrigée : **1431 → 1432**, après vérification par l'utilisateur sur JO N° 23/2011.
- **2026-08-10 (patch 19) :** `loi-03-10-protection-environnement.md` — séquence Art. 1–89 auditée, aucun gap. JO N° 43/2003 confirmé.
- **2026-08-10 (patch 19) :** `decret-06-138-emissions-atmospheriques.md` — statut corrigé : PARTIEL — Annexes I–II corrompues par OCR.
- **2026-08-10 (patch 19) :** `loi-18-11-sante.md` — 450 articles complets, Art. 12–16 intégrés.
- **2026-08-10 (patch 20) :** `decret-91-05`, `decret-93-120`, `loi-90-11`, `loi-19-02` — convertis verbatim par l'utilisateur depuis PDF (2026-08-10).
- **2026-08-10 (patch 21) :** `decret-24-197-entrepreneuriat.md` — supprimé de l'index (hors scope SafeInspect, confirmé par l'utilisateur). Fichier non présent dans le repo.
- **2026-08-10 (patch 22) :** `loi-90-29-urbanisme.md` — converti verbatim par l'utilisateur depuis PDF officiel (2026-08-10). Art. 1–81 complets, JO N° 52/1990. Contrôle de séquence présent.
- **2026-08-10 (patch 22) :** `loi-04-20-risques-majeurs.md` — converti verbatim par l'utilisateur depuis PDF officiel (2026-08-10). Art. 1–75 complets.
- **2026-08-10 (patch 23) :** `loi-09-03-protection-consommateur.md` — converti verbatim par l'utilisateur depuis PDF officiel (2026-08-10). Art. 1–95 complets, amendement Loi 18-09 intégré.
- **2026-08-10 (patch 23) :** `decret-11-125-eau-consommation-humaine.md` — converti verbatim par l'utilisateur depuis PDF officiel (2026-08-10). Art. 1–9 + Annexe (valeurs limites et indicatives), JO N° 18/2011.
- **2026-08-11 (patch 24) :** 21 fichiers promus ✅ VÉRIFIÉ — relecture complète contre PDF officiel par Belabed Mohamed (2026-08-11) : `decret-83-496`, `decret-22-167`, `decret-04-82`, `decret-06-138` (statut PARTIEL maintenu), `decret-76-35`, `loi-88-07`, `decret-25-63`, `decret-21-319`, `decret-21-261`, `arrete-2011-02-06`, `loi-04-08`, `decret-91-05`, `decret-93-120`, `loi-19-02`, `loi-90-29`, `loi-04-20`, `decret-11-125`, `loi-09-03`, `decret-06-141`, `loi-18-11`, `loi-90-11`.
