# SAFEINSPECT — JORADP PDF → MARKDOWN CONVERSION AUDIT

> **Ce fichier est le prompt officiel à donner à l'agent d'audit (Manus, Claude, GPT-4o, etc.).**
> Copiez-le tel quel. Ne le modifiez pas sans mettre à jour la date ci-dessous.
>
> Dernière mise à jour : 2026-08-19

---

## Contexte

Tu as accès au dépôt GitHub SafeInspect-APP (`belabedmohamedins-tech/SafeInspect-APP`).

Le dépôt contient :
- Des **fichiers Markdown** dans `/legal_refs/` — représentations machine-readable des textes juridiques algériens.
- Des **PDFs originaux** dans `/legal_refs/pdf/` — SOURCE OFFICIELLE JORADP/ministérielle.
- Un fichier d'état de validation dans `/legal_refs/validation/conversion_status.json`.
- Un rapport d'audit existant dans `/legal_refs/validation/conversion_audit.md`.

**Les PDFs sont la SOURCE AUTORITAIRE.**
Les fichiers Markdown sont uniquement des représentations AI-readable et ne doivent jamais être traités comme autoritaires avant validation.

---

## OBJECTIF

Audit de qualité de conversion : comparer chaque document Markdown contre le PDF original correspondant.

**Ne jamais modifier les PDFs originaux.**

---

## ÉTAPE 1 — INVENTAIRE

1. Lister tous les fichiers `.md` dans `/legal_refs/` (hors README, HANDOVER, CLEANUP_LOG, AGENT_INSTRUCTIONS).
2. Lister tous les fichiers `.pdf` dans `/legal_refs/pdf/`.
3. Établir le mapping PDF ↔ MD pour chaque instrument.
4. Identifier les MD **sans PDF correspondant** → marquer `NO_PDF_SOURCE`.
5. Identifier les PDF **sans MD correspondant** → marquer `MISSING_MD`.

Rapporter l'inventaire avant de commencer les comparaisons.

---

## ÉTAPE 2 — COMPARAISON PAGE PAR PAGE

Pour chaque paire PDF ↔ MD :

### 2.1 — Vérification d'identité du document
- Titre exact
- Numéro de loi/décret/arrêté
- Date de signature
- Numéro et date du Journal Officiel (JO/JORADP)
- Autorité signataire

### 2.2 — Vérification de complétude
- Tous les articles sont présents et dans l'ordre correct
- Aucun article manquant ou dupliqué
- Tous les Titres/Chapitres/Sections sont présents
- Les annexes sont présentes et complètes
- Les tableaux sont présents et correctement structurés
- Les notes de bas de page sont présentes

### 2.3 — Vérification du contenu verbatim

Détecter :
- Texte manquant (paragraphes, phrases, membres de phrase)
- Texte altéré (mots changés, reformulations)
- Erreurs OCR (caractères corrompus, lettres mal reconnues)
- Numéros d'articles incorrects ou manquants
- Paragraphes dupliqués
- Ordre incorrect des paragraphes
- Caractères corrompus (é→e, à→a, °→o, etc.)
- Notes de bas de page manquantes
- Annexes manquantes ou incomplètes
- Tableaux cassés ou incomplets
- En-têtes incorrects

---

## ÉTAPE 3 — VÉRIFICATION LÉGALE CRITIQUE

> ⚠️ **Une seule erreur sur l'un de ces éléments = ERREUR CRITIQUE (HIGH SEVERITY)**

Vérifier avec une attention absolue :

| Catégorie | Exemples |
|---|---|
| Numéros de loi/décret/arrêté | 21-261, 06-198, 03-10 |
| Numéros d'articles | Art. 50, Art. 12 |
| Dates | 15 Ramadan 1442, 27 juin 2021 |
| Amendements et renvois | « tel que modifié par... » |
| Catégories de classification | Classe I, II, III |
| Seuils numériques | 5 500 V, 40°C, 55°C |
| Quantités et unités | mg/L, m³/h, kPa, MPa |
| Pourcentages | 10%, 50%, 100% |
| Délais | 3 mois, 6 mois, 1 an |
| Conditions et exceptions | « sauf si... », « à l'exception de... » |
| Pénalités | montants d'amendes, durées de prison |
| Limites techniques | pressions, températures, débits |
| Références croisées | « conformément à l'article X du décret Y » |

---

## ÉTAPE 4 — RAPPORT D'AUDIT

### 4.1 — Tableau de synthèse

Créer un tableau :

| Document | Fichier MD | PDF disponible | Articles vérifiés | Erreurs critiques | Erreurs mineures | Statut |
|---|---|---|---:|---:|---:|---|

Statuts possibles :
- `✅ VERIFIED` — aucune erreur détectée
- `⚠️ VERIFIED_WITH_MINOR_ISSUES` — erreurs mineures uniquement (formatage, espaces)
- `🔴 REQUIRES_CORRECTION` — erreurs de contenu détectées, corrections possibles
- `🚫 UNSAFE_FOR_LEGAL_USE` — erreurs critiques non corrigibles sans PDF humain
- `❓ NO_PDF_SOURCE` — aucun PDF disponible, vérification impossible

### 4.2 — Détail de chaque erreur

Pour chaque erreur :

```
Document    : [nom du fichier MD]
Localisation PDF : page X, article Y
Localisation MD  : ligne N, section Z
Contenu PDF (original) : [citation exacte]
Contenu MD (actuel)    : [citation exacte]
Problème    : [description précise]
Correction requise : [texte exact à substituer]
Sévérité    : CRITIQUE | MAJEURE | MINEURE
```

---

## ÉTAPE 5 — CORRECTIONS

1. Corriger les fichiers MD **uniquement** là où le PDF établit clairement le contenu correct.
2. Ne pas modifier silencieusement un contenu incertain.
3. Si le PDF lui-même est illisible ou ambigu → marquer `[ILLISIBLE — VÉRIFIER PDF p.X]` dans le MD et arrêter.
4. Ne jamais inventer ou interpréter du contenu manquant.
5. Ne jamais utiliser des connaissances générales pour remplacer le texte source.

**Règle absolue : PDF = source de vérité. MD = représentation machine validée.**

---

## ÉTAPE 6 — VÉRIFICATION POST-CORRECTION

Après chaque correction :
1. Relire le passage corrigé dans le MD.
2. Confirmer qu'il correspond exactement au PDF.
3. Documenter la correction dans le rapport.
4. Mettre à jour `conversion_status.json` pour ce document.

---

## ÉTAPE 7 — MISE À JOUR DU FICHIER `conversion_status.json`

Après l'audit complet, mettre à jour chaque entrée dans `conversion_status.json` :

```json
{
  "filename": "decret-21-261-esp-equipements-hydrocarbures.md",
  "source_pdf": "decret-21-261.pdf",
  "conversion_status": "REQUIRES_CORRECTION",
  "pdf_available": true,
  "audit_date": "2026-08-XX",
  "audit_method": "PDF-to-Markdown comparison",
  "audited_by": "[nom ou identifiant de l'agent]",
  "critical_errors": 2,
  "minor_errors": 5,
  "safe_for_ai_use": false,
  "notes": "Art. 50 et Art. 53 divergent significativement du PDF source."
}
```

---

## IMPORTANT — CE QUE L'AGENT NE DOIT PAS FAIRE

- ❌ Ne pas rendre le Markdown visuellement identique au PDF (mise en page, sauts de page, en-têtes/pieds de page)
- ❌ Ne pas corriger en utilisant des connaissances propres
- ❌ Ne pas modifier les PDFs
- ❌ Ne pas marquer `VERIFIED` un document sans l'avoir comparé au PDF
- ❌ Ne pas inventer du contenu manquant
- ❌ Ne pas fusionner des instruments distincts
- ❌ Ne pas écraser un fichier sans rapport de correction

---

## LIVRABLE FINAL

À la fin de l'audit :

1. `/legal_refs/validation/conversion_audit.md` — rapport complet mis à jour
2. `/legal_refs/validation/conversion_status.json` — statuts mis à jour pour chaque document
3. Tous les fichiers MD corrigés avec un commit par document (message : `fix(legal_refs): [instrument] — corrections audit PDF↔MD`)
4. Un résumé final indiquant quels fichiers sont **sûrs pour usage AI/juridique** et lesquels nécessitent encore une vérification humaine.

---

## NOTE DE COORDINATION INTER-AGENTS

Ce dépôt est géré conjointement par :
- **Perplexity** (agent d'ingénierie SafeInspect) — conversion des PDFs en Markdown, patches ciblés
- **Agent d'audit** (Manus ou autre) — vérification PDF↔MD, rapport de qualité

Avant de modifier un fichier, vérifier dans `README.md` si une colonne de statut indique un travail en cours.
Ne jamais écraser un fichier dont le statut contient `[EN COURS]` sans confirmation explicite.
