# CLEANUP_LOG — legal_refs

> **LIRE EN PREMIER dans toute nouvelle session avant de faire quoi que ce soit.**
> Ce fichier est la source de vérité sur l'état du dépôt. Il évite de repousser des fichiers déjà présents.

---

## ⚠️ RÈGLE ANTI-BOUCLE

Avant de pousser un fichier, vérifier ici s'il est déjà marqué ✅. Si oui, **ne pas le recréer**.
Un fichier marqué ⚠️ Partiel peut être mis à jour seulement si un nouveau PDF comblant les lacunes est fourni dans la session en cours.

---

## État complet des fichiers — legal_refs/ (au 2026-08-10)

| Fichier | Instrument | Statut | Lacunes connues |
|---|---|---|---|
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 + amendements Loi 18-09 | ✅ Complet verbatim | Aucune |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 | ✅ Complet | — |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 | ✅ Complet | — |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 | ✅ Complet | — |
| `loi-90-11-relations-travail.md` | Loi n° 90-11 | ✅ Présent — ajouté 2026-08-09 | — |
| `loi-90-29-urbanisme.md` | Loi n° 90-29 (urbanisme) | ✅ Complet — 81 articles vérifiés Session 10 | — |
| `loi-04-20-risques-majeurs.md` | Loi n° 04-20 (risques majeurs) | ✅ Présent — ajouté 2026-08-09 | — |
| `loi-05-12-ressources-en-eau.md` | Loi n° 05-12 (ressources en eau) | ✅ Présent — ajouté 2026-08-09 | — |
| `loi-18-11-sante.md` | Loi n° 18-11 (santé publique) | ✅ Présent — 189 KB, non encore lu par l'audit | — |
| `decret-17-140-hygiene-alimentaire.md` | Décret n° 17-140 | ✅ Complet | — |
| `decret-07-144-nomenclature-installations-classees.md` | Décret n° 07-144 | ⚠️ Partiel | Rubriques 1243–2922 manquantes — PDF JO n° 31/2007 non fourni |
| `decret-06-198-etablissements-classes.md` | Décret n° 06-198 | ✅ Complet | — |
| `decret-06-141-rejets-effluents-liquides.md` | Décret n° 06-141 | ✅ Complet — 14.7 KB, Art.1–14 + Annexe I + Annexe II. W36 CLOSED. | — |
| `decret-09-19.md` | Décret n° 09-19 | ✅ Complet | — |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret n° 91-05 | ✅ Complet | — |
| `decret-93-120-medecine-du-travail.md` | Décret n° 93-120 | ✅ Complet | — |
| `decret-22-167-etablissements-classes-modification.md` | Décret n° 22-167 (modif 06-198) | ✅ Complet — 28.9 KB, ajouté 2026-08-09 | — |
| `decret-24-196-etablissements-classes-modification.md` | Décret n° 24-196 (modif 06-198) | ✅ Complet — ajouté 2026-08-09 | — |
| `decret-21-430-gpl-carburant.md` | Décret n° 21-430 (GPL carburant) | ✅ Présent — 3 articles réels. ⚠️ Objet = conversion véhicule uniquement. Voir F8 / W43. | — |
| `decret-83-496-gpl-carburant.md` | Décret n° 83-496 (base 21-430) | ✅ Présent — 21 articles réels. ⚠️ Même objet que 21-430. Voir F8 / W43. | — |
| `decret-02-427-prevention-risques-professionnels.md` | Décret n° 02-427 | ✅ Présent — extrait sélectif Art.1–24. Non encore lu pour BGN-09-02. | Arts 25–84 non inclus (bénin) |
| `decret-76-35-igh-incendie.md` | Décret n° 76-35 (IGH/incendie) | ✅ Présent — ajouté 2026-08-09. Non encore lu pour BGN-08-03. | Vérifier si abrogé/remplacé |
| `arrete-interministeriel-2025-liaison-froide.md` | Arrêté 2025 liaison froide | ✅ Présent | — |
| `arrete-interministeriel-1999-temperatures-conservation.md` | Arrêté 1999 températures | ⚠️ Stub — [MANQUANT] | W19 OPEN |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | Arrêté 2016 critères micro | ⚠️ Stub — [MANQUANT] | W19 OPEN |
| `aim-gpl2-regles-techniques-securite.md` | AIM GPL2 | ✅ Présent — extrait sélectif. Source Scribd non-JORADP. | Arts 10–29 manquants (W43 dépend de ce fichier) |
| `audit.js` | Script d'audit du dossier | ✅ Intentionnel — NE PAS SUPPRIMER | — |

---

## Historique des nettoyages structurels

### 2026-08-10 — Issue #1-4 : 12 fichiers absents du CLEANUP_LOG
**Statut : ✅ RÉSOLU dans cette mise à jour**
- Contexte : le CLEANUP_LOG avait été écrasé par la Session 8 (Perplexity, 2026-08-08) qui n'avait reporté que son propre travail de nettoyage, omettant tous les fichiers ajoutés depuis par l'utilisateur directement via PDFs convertis en place.
- 12 fichiers présents dans `legal_refs/` mais absents de la table d'état :
  `loi-90-11`, `loi-90-29`, `loi-04-20`, `loi-05-12`, `loi-18-11`,
  `decret-02-427`, `decret-06-141`, `decret-21-430`, `decret-22-167`, `decret-24-196`,
  `decret-76-35`, `decret-83-496`.
- Tous ajoutés dans la table ci-dessus avec leur statut et notes d'audit.
- La section "🔴 Fichiers à créer" a été **supprimée** : ses 5 entrées (`loi-90-11`, `loi-90-29`, `loi-04-20`, `loi-05-12`, `loi-18-11`) sont désormais présentes dans le dépôt. Conserver cette section vide aurait constitué un faux-positif de travail à faire.

### 2026-08-09 — Suppression de `docs/legal_sources/`
**Statut : ✅ RÉSOLU — NE PLUS SIGNALER**
- Le dossier `docs/legal_sources/` a été supprimé définitivement.
- Le dossier canonique unique est `legal_refs/`.
- Ne pas recréer `docs/legal_sources/`.

### 2026-08-09 — Renommage kebab-case
**Statut : ✅ RÉSOLU**
- `Decret-07-144.md` → `decret-07-144-nomenclature-installations-classees.md`
- `Decret-17-140.md` → `decret-17-140-hygiene-alimentaire.md`

### 2026-08-08/09 — Boucle sur décret-91-05
**Statut : ✅ RÉSOLU**
- Le fichier `decret-91-05-hygiene-securite-milieu-travail.md` a été poussé 7 fois en raison de resets de session.
- Il est **complet et définitif** depuis le 2026-08-09. Ne plus le repousser.

### audit.js dans legal_refs/
**Statut : ✅ INTENTIONNEL — NE PAS SUPPRIMER**
- `audit.js` appartient à `legal_refs/` car il audite ce dossier. Ne pas le déplacer ni le signaler comme stray.
