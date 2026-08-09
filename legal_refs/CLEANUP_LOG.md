# CLEANUP_LOG — legal_refs

> **LIRE EN PREMIER dans toute nouvelle session avant de faire quoi que ce soit.**
> Ce fichier est la source de vérité sur l'état du dépôt. Il évite de repousser des fichiers déjà présents.

---

## ⚠️ RÈGLE ANTI-BOUCLE

Avant de pousser un fichier, vérifier ici s'il est déjà marqué ✅. Si oui, **ne pas le recréer**.
Un fichier marqué ⚠️ Partiel peut être mis à jour seulement si un nouveau PDF comblant les lacunes est fourni dans la session en cours.

---

## État complet des fichiers — legal_refs/ (au 2026-08-09)

| Fichier | Instrument | Statut | Lacunes connues |
|---|---|---|---|
| `loi-09-03-protection-consommateur.md` | Loi n° 09-03 + amendements Loi 18-09 | ✅ Complet verbatim | Aucune |
| `loi-03-10-protection-environnement.md` | Loi n° 03-10 | ✅ Complet | — |
| `loi-01-19-gestion-dechets.md` | Loi n° 01-19 | ✅ Complet | — |
| `loi-19-02-incendie-panique.md` | Loi n° 19-02 | ✅ Complet | — |
| `decret-17-140-hygiene-alimentaire.md` | Décret n° 17-140 | ✅ Complet | — |
| `decret-07-144-nomenclature-installations-classees.md` | Décret n° 07-144 | ⚠️ Partiel | Rubriques 1243–2922 manquantes — PDF JO n° 31/2007 non fourni |
| `decret-06-198-etablissements-classes.md` | Décret n° 06-198 | ✅ Complet | — |
| `decret-09-19.md` | Décret n° 09-19 | ✅ Complet | — |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret n° 91-05 | ✅ Complet | — |
| `decret-93-120-medecine-du-travail.md` | Décret n° 93-120 | ✅ Complet | — |
| `arrete-interministeriel-2025-liaison-froide.md` | Arrêté 2025 liaison froide | ✅ Présent | — |
| `arrete-interministeriel-1999-temperatures-conservation.md` | Arrêté 1999 températures | ✅ Présent | — |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | Arrêté 2016 critères micro | ✅ Présent | — |
| `aim-gpl2-regles-techniques-securite.md` | AIM GPL2 | ✅ Présent | — |
| `audit.js` | Script d'audit du dossier | ✅ Intentionnel — NE PAS SUPPRIMER | — |

---

## 🔴 Fichiers à créer — PDFs disponibles, pas encore poussés

| Fichier cible | PDF source | Statut |
|---|---|---|
| `loi-90-11-relations-travail.md` | `LOI-90-11.pdf` | ❌ À créer |
| `loi-90-29-urbanisme.md` | `loi-90-29.pdf` | ❌ À créer |
| `loi-04-20-eau.md` | `Loi-04-20.pdf` | ❌ À créer |
| `loi-05-12-eau-ressources.md` | `loi-05-12.pdf` | ❌ À créer |
| `loi-18-11-sante.md` | `loi-18-11.pdf` | ❌ À créer |

---

## Historique des nettoyages structurels

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
