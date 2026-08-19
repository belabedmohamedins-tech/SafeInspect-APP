# AGENT INSTRUCTIONS — SafeInspect Legal Pipeline

> Ce fichier décrit les règles de coordination entre les agents AI qui travaillent sur le dépôt.
> Mis à jour : 2026-08-19 (restructuration — chemins mis à jour pour legal_refs/md/)

---

## Architecture du pipeline

```
/legal_refs/
├── README.md               ← Index de tous les textes légaux (ce répertoire)
├── AGENT_INSTRUCTIONS.md   ← Ce fichier
├── md/                     ← Tous les textes légaux en Markdown
│   ├── audit.js            ← Script d'audit natif (ne pas déplacer)
│   ├── CLEANUP_LOG.md
│   ├── HANDOVER.md
│   ├── SOURCE_MANIFEST.json
│   └── *.md                ← Textes légaux verbatim JORADP
├── pdf/                    ← PDFs originaux JORADP (SOURCE AUTORITAIRE — NE JAMAIS MODIFIER)
└── validation/
    ├── AUDIT_PROMPT.md     ← Prompt officiel pour l'agent d'audit
    ├── AUDIT_PROTOCOL.md   ← Protocole technique détaillé
    ├── conversion_audit.md ← Rapport d'audit en cours
    └── conversion_status.json ← État de chaque document
```

---

## Règles absolues

1. **PDF = source de vérité.** Aucun agent ne modifie les PDFs dans `pdf/`.
2. **MD = représentation validée.** Un MD n'est fiable que si `conversion_status` = `VERIFIED` ou `VERIFIED_WITH_MINOR_ISSUES`.
3. **Un instrument = un fichier.** Jamais deux fichiers pour le même texte.
4. **Avant toute déclaration légale citant un article**, l'agent doit pouvoir tracer vers le PDF source.
5. **Tous les nouveaux fichiers `.md` vont dans `legal_refs/md/`** — jamais à la racine de `legal_refs/`.

---

## Agents actifs

| Agent | Rôle | Périmètre autorisé |
|---|---|---|
| **Perplexity** | Ingénierie SafeInspect, conversion PDF→MD, patches | Modifier les `md/*.md`, `README.md`, `conversion_status.json` |
| **Agent d'audit** (Manus/autre) | Vérification PDF↔MD, rapport qualité | Lire les `md/*.md` et `pdf/`, corriger les `.md` après comparaison, mettre à jour `validation/conversion_audit.md` et `validation/conversion_status.json` |

---

## Coordination inter-agents — Protocole anti-conflit

### Avant de modifier un fichier
1. Consulter la colonne **Statut** dans `legal_refs/README.md`.
2. Si le statut contient `[EN COURS — Perplexity]` ou `[AUDIT EN COURS]` → **STOP, attendre confirmation**.
3. Si le statut est libre → procéder.

### Après avoir modifié un fichier
1. Mettre à jour la colonne **Statut** dans `legal_refs/README.md` avec la date et l'identifiant de l'agent.
2. Mettre à jour `validation/conversion_status.json` pour le document concerné.
3. Commit avec un message descriptif et précis.

---

## Usage des fichiers Markdown par les agents AI

### Règle d'usage

```
Pour toute recherche ou synthèse juridique :
  → Utiliser /legal_refs/md/*.md pour la recherche rapide
  → Si la déclaration est légalement critique (seuils, pénalités, conditions, exceptions) :
      → Vérifier que conversion_status = VERIFIED
      → Si non VERIFIED → indiquer explicitement : "Non vérifié — source PDF à consulter"
```

### Champs de confiance dans conversion_status.json

| Champ | Signification |
|---|---|
| `conversion_status: VERIFIED` | Contenu confirmé contre PDF — usage AI autorisé |
| `conversion_status: VERIFIED_WITH_MINOR_ISSUES` | Confiance élevée, vérifier les points notés |
| `conversion_status: REQUIRES_CORRECTION` | Ne pas utiliser pour décisions légales |
| `conversion_status: UNSAFE_FOR_LEGAL_USE` | Usage AI interdit pour toute décision légale |
| `conversion_status: NO_PDF_SOURCE` | Aucune validation possible — traiter comme non vérifié |
| `pdf_available: false` | Aucun PDF dans le repo — contenu non vérifiable |
| `safe_for_ai_use: true/false` | Résumé binaire pour filtrage rapide |

---

## Comment démarrer l'audit

1. Ouvrir `/legal_refs/validation/AUDIT_PROMPT.md`
2. Copier le contenu complet
3. Le donner comme instruction à l'agent d'audit (Manus, Claude, GPT-4o, etc.)
4. L'agent a accès au repo via l'API GitHub ou un clone local
5. L'agent met à jour `validation/conversion_status.json` et `validation/conversion_audit.md` au fur et à mesure

---

## Priorités d'audit recommandées

Ordonner l'audit par criticité métier SafeInspect :

| Priorité | Documents | Raison |
|---|---|---|
| 🔴 P1 | `md/decret-21-261-esp-equipements-hydrocarbures.md` | Fichier le plus volumineux (72KB), hydrocarbures/ESP, incohérences connues |
| 🔴 P1 | `md/decret-21-319-autorisation-exploitation-hydrocarbures.md` | 66KB, exploitation hydrocarbures |
| 🟠 P2 | `md/decret-06-198-etablissements-classes.md` | 33KB, établissements classés — base SafeInspect |
| 🟠 P2 | `md/decret-07-144-nomenclature-installations-classees.md` | 37KB, nomenclature — critique pour classification |
| 🟡 P3 | Tous les autres décrets dans `md/` | Par ordre décroissant de taille |
| 🟢 P4 | Lois dans `md/` (loi-03-10, loi-04-20, etc.) | Moins susceptibles d'erreurs critiques de seuils |
