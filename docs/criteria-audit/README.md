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

## Index des fichiers

> À compléter au fur et à mesure des pushes manuels.

| Fichier | Criteria cible | Patches certains | LEGAL VERIFY | Merge/Restructure | Statut |
|---|---|---|---|---|---|
| *(à remplir)* | | | | | |

---

## Suivi global

| Statut | Nombre |
|---|---|
| Fichiers audit reçus | 0 / 28 |
| Patches appliqués | 0 |
| LEGAL VERIFY ouverts | 0 |
| Patches bloqués | 0 |
