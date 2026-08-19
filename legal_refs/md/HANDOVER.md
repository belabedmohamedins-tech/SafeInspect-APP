# SafeInspect — Handover File for AI Agent (Legal-Text Conversion)

> **Date de création :** 2026-08-18  
> **Auteur :** Généré automatiquement depuis la conversation de session  
> **Usage :** Donner ce fichier à l'agent IA au début de chaque nouvelle conversation pour assurer la continuité.

---

## 1. Contexte du projet

**Projet :** SafeInspect-APP  
**Repo :** `belabedmohamedins-tech/SafeInspect-APP` (public)  
**Repo API :** `belabedmohamedins-tech/SafeInspect-API` (privé)  
**GitHub login :** `belabedmohamedins-tech`

SafeInspect est une application mobile d'inspection réglementaire algérienne. L'agent IA a pour rôle de convertir des textes juridiques officiels algériens (PDF JORADP/ministères) en fichiers Markdown verbatim dans `/legal_refs/`, qui servent de références ground-truth pour les outils IA et les auditeurs humains.

---

## 2. Structure du repo (ce qui concerne l'agent)

```
SafeInspect-APP/
├── legal_refs/              ← Tous les fichiers de référence juridique
│   ├── README.md            ← Table de tous les fichiers (DOIT être synchronisée)
│   ├── CLEANUP_LOG.md       ← Historique des corrections
│   ├── HANDOVER.md          ← Ce fichier
│   ├── audit.js             ← Script d'audit (ne pas modifier)
│   ├── decret-*.md
│   ├── loi-*.md
│   └── arrete-*.md
├── src/
│   └── criteria/            ← Code TypeScript (critères d'inspection)
└── docs/
    └── legal_sources/       ← Ancienne zone (vérifier avant de créer un nouveau fichier)
```

---

## 3. Règles absolues (non négociables)

### 3.1 Source et verbatim
- Convertir UNIQUEMENT depuis le PDF fourni dans la conversation courante.
- **Jamais** consulter les fichiers existants dans `/legal_refs/` pour deviner le contenu d'un article.
- Si l'app cite « Art. X pour Y », transcrire ce que dit réellement le PDF — signaler tout écart dans une note d'en-tête, ne jamais ajuster le texte pour correspondre aux attentes.
- Texte illisible → tag `[ILLISIBLE — VÉRIFIER PDF p.X]` et continuer.

### 3.2 Un fichier par instrument
- Vérifier `/legal_refs/` ET `/docs/legal_sources/` avant de créer un fichier (même instrument = casse/slug différent).
- **Édition ciblée** si le fichier existe déjà. **Réécriture complète** uniquement si c'est une création (aucune version préexistante).
- Si un fichier existant est trop abîmé pour un patch ciblé → **STOP**, escalader à l'utilisateur, attendre confirmation explicite.
- Nommage : `lowercase-kebab-case`, `{type}-{numéro}-{slug-sujet}.md`, toujours dans `/legal_refs/`.

### 3.3 Amendements
- Chaque instrument amendent a son propre fichier.
- Dans le fichier original, marquer chaque article modifié :
  ```
  > ⚠️ **Modifié par [instrument] du [date]** — voir `[filename].md`
  ```
- Dans le fichier amendant, chaque article doit référencer l'article original qu'il modifie.
- **Ne jamais fusionner** le texte amendant dans le fichier original.

### 3.4 En-tête obligatoire
Chaque fichier doit commencer par :
```markdown
# [Titre complet de l'instrument]

**Numéro :** [numéro officiel]  
**Date de signature :** [date]  
**JO numéro/date :** [JO n°XX du JJ/MM/AAAA]  
**Source PDF :** [nom ou URL du PDF source]  
**Date de conversion :** [AAAA-MM-JJ]  
**Statut de vérification :** ⚠️ NON VÉRIFIÉ

> ⚠️ Vérifier par rapport au texte original JORADP avant toute décision juridique ou de contrôle.
```

> `✅ VÉRIFIÉ [date] par [nom]` **uniquement** quand un reviewer humain le confirme. L'agent ne doit jamais le mettre lui-même.

### 3.5 Structure
- Conserver Titre/Chapitre/Section/Article dans l'ordre et numérotation d'origine.
- Ne pas réorganiser, sauter, ni curer par "pertinence".
- Pas de résumés, pas de placeholders comme "(Dispositions relatives à...)".

---

## 4. Contrôle de séquence (obligatoire)

Terminer **chaque fichier** par une section :
```markdown
## Contrôle de séquence

Articles présents : 1, 2, 3, 4, 5, ..., N  
Gaps détectés : [aucun] ou [Art. X manquant entre Y et Z]
```

---

## 5. Synchronisation README

`/legal_refs/README.md` doit être mis à jour dans **le même commit** que tout ajout/modification/suppression de fichier. Colonnes : `Fichier | Instrument | Objet | Statut`.

Avant de terminer, confirmer que chaque fichier du dossier a une ligne README correspondante et exacte.

---

## 6. Garde-fous techniques (SIZE GUARD)

| Situation | Méthode à utiliser |
|---|---|
| Fichier < 20 000 caractères | `create_or_update_file` |
| Fichier ≥ 20 000 caractères | **`push_files` obligatoire** (create_or_update_file tronque silencieusement) |
| Loi avec > 50 articles | `push_files` systématiquement |

Après chaque push, vérifier :
- Le champ `size` dans la réponse API ≥ 90 % du nombre de caractères attendu.
- Refetch le fichier depuis le repo (pas depuis la mémoire) et confirmer qu'il se termine au bon article.
- `git diff` stats cohérentes avec la portée déclarée (un "fix de 6 articles" ne doit pas montrer des centaines de lignes supprimées).

---

## 7. Workflow standard par conversion

1. **Vérifier** `/legal_refs/README.md` — le fichier existe-t-il déjà ? Quel est son statut ?
2. **Lire le PDF** fourni dans la conversation (ne pas utiliser la mémoire d'une session précédente).
3. **Citer** le texte exact du PDF dans le chat avant de committer (règle CITE-BEFORE-COMMIT).
4. **Compter** les caractères → choisir `create_or_update_file` ou `push_files`.
5. **Pousser** avec un message de commit précis sur la portée.
6. **Refetch** le fichier depuis GitHub et confirmer la fin du contenu.
7. **Mettre à jour README** dans le même commit ou immédiatement après.
8. **Ajouter la note** `[CONVERTED — date]` dans la colonne Statut du README.

---

## 8. Coordination avec l'agent Perplexity (rôle ingénierie)

- L'agent Perplexity (rôle engineering) peut patcher des fichiers dans `/legal_refs/` pour des besoins d'ingénierie.
- Avant de commencer une conversion, vérifier le README pour des tags de phase en cours (ex. `W3x`).
- Après un push, noter `[CONVERTED — date]` dans le statut README pour signaler que le fichier est frais.
- Ne jamais écraser un fichier dont le statut README montre une phase Perplexity en cours sans confirmation de l'utilisateur.

---

## 9. Inventaire actuel de /legal_refs/ (au 2026-08-18)

| Fichier | Type | Taille approx. |
|---|---|---|
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | Arrêté | 6,6 KB |
| `arrete-interministeriel-2011-02-06-permis-construire-energie.md` | Arrêté | 22,7 KB |
| `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md` | Arrêté | 46,8 KB |
| `arrete-interministeriel-2025-05-07-hygiene-restauration.md` | Arrêté | 26,3 KB |
| `decret-01-102-creation-ona.md` | Décret | 21,9 KB |
| `decret-02-427-prevention-risques-professionnels.md` | Décret | 10,3 KB |
| `decret-04-410-regles-installations-traitement-dechets.md` | Décret | 13,1 KB |
| `decret-04-82-agrement-sanitaire-elevage.md` | Décret | 12,7 KB |
| `decret-05-315-declaration-dechets-speciaux-dangereux.md` | Décret | 6,6 KB |
| `decret-06-138-emissions-atmospheriques.md` | Décret | 13,9 KB |
| `decret-06-141-rejets-effluents-liquides.md` | Décret | 14,8 KB |
| `decret-06-198-etablissements-classes.md` | Décret | 33,1 KB |
| `decret-07-144-nomenclature-installations-classees.md` | Décret | 37,9 KB |
| `decret-07-205-schema-communal-dechets.md` | Décret | 9,4 KB |
| `decret-09-19.md` | Décret | 8,7 KB |
| `decret-09-335-plans-internes-intervention.md` | Décret | 7,2 KB |
| `decret-11-125-eau-consommation-humaine.md` | Décret | 9,4 KB |
| `decret-17-140-hygiene-alimentaire.md` | Décret | 39,3 KB |
| `decret-21-261-esp-equipements-hydrocarbures.md` | Décret | 72,7 KB |
| `decret-21-319-autorisation-exploitation-hydrocarbures.md` | Décret | 66,4 KB |
| `decret-21-430-gpl-carburant.md` | Décret | 6,2 KB |
| `decret-22-167-etablissements-classes-modification.md` | Décret amendant | 29 KB |
| `decret-24-196-etablissements-classes-modification.md` | Décret amendant | 7,6 KB |
| `decret-25-63-plans-intervention-catastrophes.md` | Décret | 22,7 KB |
| `decret-76-35-igh-incendie.md` | Décret | 16,1 KB |
| `decret-76-36-incendie-panique.md` | Décret | 2,3 KB |
| `decret-83-496-gpl-carburant.md` | Décret | 14,6 KB |
| `decret-90-245-appareils-pression-gaz.md` | Décret | 23,2 KB |
| `decret-91-05-hygiene-securite-milieu-travail.md` | Décret | 36 KB |
| `decret-93-120-medecine-du-travail.md` | Décret | 22,5 KB |
| `loi-01-19-gestion-dechets.md` | Loi | 35,9 KB |
| `loi-03-10-protection-environnement.md` | Loi | 73,7 KB |
| `loi-04-08-activites-commerciales.md` | Loi | 24,4 KB |
| `loi-04-20-risques-majeurs.md` | Loi | 42,5 KB |
| `loi-05-12-ressources-en-eau.md` | Loi | 84,1 KB |
| `loi-09-03-protection-consommateur.md` | Loi | 51,3 KB |
| `loi-18-11-sante-partie1-arts1-164.md` | Loi (partie 1) | 67,5 KB |
| `loi-18-11-sante-partie2-arts165-264.md` | Loi (partie 2) | 48 KB |
| `loi-18-11-sante-partie3-arts265-450.md` | Loi (partie 3) | 75,3 KB |
| `loi-19-02-incendie-panique.md` | Loi | 27,1 KB |
| `loi-88-07-hygiene-securite-medecine-travail.md` | Loi | 28,6 KB |
| `loi-90-11-relations-travail.md` | Loi | 76,2 KB |
| `loi-90-29-urbanisme.md` | Loi | 38,7 KB |
| `projet-arrete-gpl-installations-securite.md` | Projet d'arrêté | 47,6 KB |

---

## 10. Points d'attention appris en session

- **Repo name exact :** `SafeInspect-APP` (pas `SafeInspect`, pas `safeinspect`). L'API est dans `SafeInspect-API`.
- **Fichiers > 20 000 chars :** Utiliser `push_files` — `create_or_update_file` tronque sans avertissement.
- **Encodage arabe :** Les fichiers contenant du texte arabe doivent être sauvegardés en UTF-8. Vérifier l'encodage avec PowerShell : `Set-Content ... -Encoding UTF8`.
- **README drift :** Le README a tendance à dériver du contenu réel du dossier. Toujours le vérifier avant et après chaque opération.
- **Pour modifier un fichier via l'agent GitHub MCP :**
  1. Récupérer le SHA actuel via `get_file_contents`.
  2. Construire le nouveau contenu complet.
  3. Appeler `create_or_update_file` avec le SHA (obligatoire pour les mises à jour).
  4. Ou utiliser `push_files` pour plusieurs fichiers en un commit.
- **Jamais de réécriture complète sans autorisation** si un fichier existant est juste partiellement incorrect.

---

## 11. Pour démarrer une nouvelle conversation

1. Fournir ce fichier `HANDOVER.md` à l'agent.
2. Dire quel instrument vous voulez convertir et fournir le PDF correspondant.
3. L'agent vérifiera d'abord le README et `/legal_refs/` pour confirmer que le fichier n'existe pas encore.
4. L'agent citera le texte du PDF avant de committer.
5. Après le push, l'agent refetchera le fichier pour confirmer l'intégrité.

---

*Handover généré le 2026-08-18 — mettre à jour après chaque session de travail significative.*
