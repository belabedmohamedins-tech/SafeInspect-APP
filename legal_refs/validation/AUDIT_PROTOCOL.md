# SAFEINSPECT — Protocole d'audit de conversion PDF → Markdown

> **Ce fichier est la source de vérité pour tout agent (Perplexity, Claude, Manus) chargé de l'audit.**  
> Ne pas modifier sans validation humaine.

---

## 1. Principe fondamental

| Rôle | Fichier | Statut |
|---|---|---|
| **Source de vérité légale** | `/legal_refs/pdf/*.pdf` | IMMUABLE — ne jamais modifier |
| **Représentation machine** | `/legal_refs/*.md` | Peut être corrigé après audit |
| **Registre d'audit** | `/legal_refs/validation/conversion_status.json` | Mis à jour après chaque audit |
| **Rapport détaillé** | `/legal_refs/validation/conversion_audit.md` | Mis à jour après chaque audit |

---

## 2. Ce que l'agent doit faire

Pour chaque paire PDF ↔ MD :

1. **Vérifier l'identité du document** : titre, numéro, date, référence JO.
2. **Comparer le contenu article par article** (ou section par section).
3. **Détecter les erreurs** selon la liste ci-dessous.
4. **Corriger le fichier MD** uniquement quand le PDF établit clairement le contenu correct.
5. **Ne jamais inventer** du contenu manquant — marquer `[MANQUANT — VÉRIFIER PDF p.X]`.
6. **Mettre à jour** `conversion_status.json` et `conversion_audit.md` après chaque document traité.
7. **Effectuer une seconde comparaison** après correction pour confirmer.

---

## 3. Types d'erreurs à détecter

### Erreurs CRITIQUES (HIGH) — Un seul suffit à invalider le document

- Numéro d'article incorrect ou manquant
- Numéro de loi/décret/arrêté incorrect
- Date incorrecte
- Seuil numérique modifié (ex : 50 mg/L → 500 mg/L)
- Unité modifiée (ex : mg → g, °C → °F)
- Pourcentage modifié
- Condition ou exception omise
- Annexe manquante
- Tableau avec valeurs incorrectes
- Référence légale incorrecte (ex : "Art. 12" cité comme "Art. 21")
- Article entier manquant
- Pénalité incorrecte

### Erreurs MINEURES (LOW)

- Faute de frappe sans impact légal
- Formatage Markdown incorrect (titres, listes)
- Espacement ou ponctuation mineure
- Ordre des tirets dans une liste non ordonnée
- Casse (majuscules/minuscules) sans impact légal
- Caractère corrompu dans un mot non critique

---

## 4. Format de signalement d'erreur

Dans `conversion_audit.md`, chaque erreur doit être documentée ainsi :

```
### Erreur #[N] — [CRITICAL|MINOR]

- **Document** : [nom du fichier .md]
- **Localisation PDF** : page X, paragraphe Y
- **Localisation MD** : ligne ~N ou Art. X
- **Contenu PDF (original)** : `[texte exact du PDF]`
- **Contenu MD (converti)** : `[texte tel qu'il apparaît dans le MD]`
- **Problème** : [description]
- **Correction requise** : [texte corrigé]
- **Statut** : CORRIGÉ / EN ATTENTE / VÉRIFICATION HUMAINE REQUISE
```

---

## 5. Statuts de validation

| Statut | Signification |
|---|---|
| `PENDING` | Pas encore audité |
| `VERIFIED` | Audité, aucune erreur détectée |
| `VERIFIED_MINOR_ISSUES` | Audité, erreurs mineures corrigées |
| `REQUIRES_CORRECTION` | Erreurs critiques détectées, correction en cours |
| `CORRECTED_PENDING_2ND_PASS` | Corrections appliquées, 2e vérification requise |
| `UNSAFE_FOR_LEGAL_USE` | Erreurs critiques non résolues — NE PAS UTILISER |
| `NO_PDF_AVAILABLE` | PDF source non disponible — audit impossible |

---

## 6. Règles importantes

- **Ne pas corriger en utilisant sa propre connaissance.** Le PDF est la source.
- **Si le PDF est illisible** sur une section : marquer `[ILLISIBLE — VÉRIFIER PDF p.X]` et ne pas deviner.
- **Ne pas réécrire un article entier** sans le citer mot pour mot depuis le PDF visible dans le contexte courant.
- **Un seul agent travaille sur un fichier à la fois.** Vérifier `conversion_status.json` avant de commencer.
- **Mettre à jour le statut en JSON** immédiatement après avoir terminé un document.
- **Les fichiers MD restent dans `/legal_refs/`** — ne pas les déplacer.
- **Les PDFs vont dans `/legal_refs/pdf/`** — ne jamais les modifier.

---

## 7. Convention de nommage des PDFs

Le PDF correspondant à un fichier MD doit avoir le même slug de base :

| Fichier MD | PDF attendu |
|---|---|
| `decret-21-261-esp-equipements-hydrocarbures.md` | `pdf/decret-21-261-esp-equipements-hydrocarbures.pdf` |
| `loi-03-10-protection-environnement.md` | `pdf/loi-03-10-protection-environnement.pdf` |

Si le PDF n'est pas encore uploadé, le statut est `NO_PDF_AVAILABLE`.

---

## 8. Instructions pour uploader les PDFs

1. Aller dans `/legal_refs/pdf/` dans le repo GitHub.
2. Uploader le PDF avec le nom exact correspondant au fichier MD (voir tableau ci-dessus).
3. Mettre à jour le champ `pdf_available` à `true` dans `conversion_status.json`.
4. L'agent peut alors démarrer l'audit pour ce document.

---

*Protocole créé le 2026-08-19. Toute modification doit être tracée dans un commit explicite.*
