# RAQIB — Verified Fix Specification v3
## What's actually still open, as of live GitHub verification

**This supersedes `RAQIB_Fix_Spec_v2.md`.** That document is kept for historical record —
its Phases 0, 1, 2, 3, 4, 5, 6, 8, and 9 have all been confirmed **applied and closed**
via live reads of `belabedmohamedins-tech/SafeInspect-APP`, several with code comments
directly citing this project's G-numbers and phase numbers. Only Phase 7 (superseded —
don't apply, would collide with independently-added content) and a handful of narrower
remaining items are still relevant. This document contains only what's genuinely open.

**Companion document:** `RAQIB_MASTER_MANUSCRIPT.md`, Chapters 5–6, which has the full
closure log and reasoning behind every item below.

---

## Phase A — 🔴 Highest priority: get the correct numbers in before R7's new criteria ship

`CHECKLIST_PROFESSIONAL_ROADMAP.md` reports Research Task R7 (Décret 06-138 Annex I
emissions thresholds) as resolved, with a plan to add 5 new criteria: `PNT-07-01`,
`MRB-07-01`, `CRP-07-01`, `PRT-07-01`, `BLS-07-01`. **Confirmed live: none of these exist
in the code yet** (`paintShopCriteria.ts` was read in full and ends at `PNT-04-03`) — so
this is a prevention task, not a revert.

**The numbers currently on record for this task are wrong**, verified against two
independent primary sources (`me.gov.dz` and `and.dz`, both official copies of Décret
06-138):

| Parameter | On record (do not use) | Confirmed correct — Annex I general limit |
|---|---|---|
| Poussières totales (total dust) | 30 mg/Nm³ (50 mg/Nm³ old installations) | **50 mg/Nm³ (100 mg/Nm³ old installations)** |
| Composés organiques volatils (VOC) | 20 mg/Nm³ (100 mg/Nm³ old installations) | **150 mg/Nm³ (200 mg/Nm³ old installations)** |

The wrong dust figure is traceable to **Annex II category 2** (cement/plaster/lime
manufacturing) — a real number, wrong table. None of the five target facility types
(paint shop, marble, carpentry, printing, blacksmith) are cement/lime facilities; Annex I's
general limit applies. The wrong VOC figure doesn't match anything found in the decree at
all.

**Template for the 5 new criteria, using the correct numbers** (adapt axis/category/id
per file, following each file's existing numbering convention — e.g. `PNT-07-01` for
paint shop):

```typescript
  {
    id: 'PNT-07-01',
    axis: 'التهوية ومنع التلوث الهوائي',   // or the file's equivalent air-quality axis
    category: 'بيئية',
    criteria: 'عدم تجاوز تركيز الغبار الكلي في الانبعاثات الهوائية للحد الأقصى المحدد قانوناً.',
    legalReference: 'المرسوم التنفيذي 06-138 (الملحق 1 — القيم القصوى العامة لتركيز الملوثات في الانبعاثات الجوية للمنشآت الصناعية).',
    severity: 'medium',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/Nm³',
      labelAr: 'تركيز الغبار الكلي المقاس',
      max: 50,
      warningMax: 45,
      step: 1,
      upperLimit: true,
    },
  },
  {
    id: 'PNT-07-02',
    axis: 'التهوية ومنع التلوث الهوائي',
    category: 'بيئية',
    criteria: 'عدم تجاوز تركيز المركبات العضوية المتطايرة (VOC) في الانبعاثات الهوائية للحد الأقصى المحدد قانوناً.',
    legalReference: 'المرسوم التنفيذي 06-138 (الملحق 1 — القيم القصوى العامة لتركيز المركبات العضوية المتطايرة في الانبعاثات الجوية للمنشآت الصناعية).',
    severity: 'medium',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'mg/Nm³',
      labelAr: 'تركيز المركبات العضوية المتطايرة المقاس',
      max: 150,
      warningMax: 135,
      step: 1,
      upperLimit: true,
    },
  },
```

**Note the 100/200 mg/Nm³ "old installations" tolerance is not represented above** — if
the app's schema has a way to distinguish pre-existing vs. new installations elsewhere
(check `Facility` type / any "established before X date" field), that tolerance should be
wired in rather than dropped; if not, defaulting to the stricter general limit (50/150) is
the safer choice for a first pass, not the 100/200 tolerance figures.

**Before implementing:** get independent confirmation of these two numbers from whoever
is driving the Perplexity prompts — this document's own verification, while sourced from
two independent primary copies of the decree, is still a single verification pass on a
document with known PDF-extraction reliability issues (the first `me.gov.dz` fetch this
session produced corrupted numeric output; only the second, `and.dz` copy gave clean
values). A third independent check costs little given how consequential a wrong emissions
threshold is.

---

## Phase B — HIGH: one remaining 93-120 noise citation

`uabCriteria.ts`'s `UAB-AX7-07` still cites plain `المرسوم 93-120 (الحد الأقصى للضجيج في
بيئة العمل: 85 ديسيبل)`. The identical issue in `blacksmithCriteria.ts`'s `BLS-04-06` was
already fixed correctly — apply the same treatment:

```typescript
// src/criteria/uabCriteria.ts — UAB-AX7-07 — legalReference field — BEFORE:
    legalReference: 'المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل) + القانون 18-11 (السلامة في أماكن العمل).',
// AFTER (match BLS-04-06's already-applied pattern — fetch that file's current exact
// wording before applying, to keep phrasing consistent across the two criteria):
    legalReference: 'الحد الأقصى للضجيج المهني (85 ديسيبل) هو مرجع دولي شائع (منظمة الصحة العالمية/OSHA)، وليس قيمة مؤكدة في التشريع الجزائري حالياً — يُستخدم كأفضل ممارسة معتمدة إلى حين تأكيد نص جزائري محدد (انظر مهمة البحث R1/R6). + القانون 18-11 (السلامة في أماكن العمل).',
```

---

## Phase C — 🔴 CONFIRMED (primary source) — Décret 22-167 mis-cited in UAB-AX6-01

**Upgraded from "verify before editing" — now independently confirmed.** Fetched the
actual Journal Officiel text of Décret 22-167 from three sources (`faolex.fao.org`,
`me.gov.dz`, `cnas.dz`), all agreeing: Article 1 states unambiguously *"Le présent décret
a pour objet de modifier et de compléter certaines dispositions du décret exécutif n°
06-198"* — it redefines terms, subdivides establishment categories, and sets
environmental-audit terms of reference (an annex titled *"TERMES DE REFERENCE DE L'AUDIT
ENVIRONNEMENTAL"* is attached). **Nothing in it concerns equipment maintenance.**

This is a fourth confirmed instance of the same failure pattern in this codebase (after
93-120/noise, 06-141/VOC, and Phase A's wrong emissions numbers): a real, correctly-
numbered decree cited for a subject it doesn't cover. It also looks like a **regression**
— the pre-2026 project-files version of this criterion cited Décret 06-198 art. 13 (the
base classified-establishment decree, which plausibly does cover equipment-maintenance-
as-technical-file-compliance) — suggesting a correct citation was replaced with an
incorrect one during implementation, the same pattern as the earlier 93-184→93-120 noise
swap.

```typescript
// src/criteria/uabCriteria.ts — UAB-AX6-01 — legalReference field
// Fetch the exact current wording before applying — not captured verbatim in this
// session's notes, only its substance ("22-167... equipment maintenance").
// BEFORE (approximate — confirm exact text first):
    legalReference: 'المرسوم التنفيذي 22-167 (صيانة التجهيزات الصناعية).',  // or similar
// AFTER (reverting to the pre-2026 citation, which is plausible and specific):
    legalReference: 'المرسوم التنفيذي 06-198 المادة 13 (التزام المنشأة بمطابقة التجهيزات للملف التقني وصيانتها في حالة جيدة).',
```

**This citation was NOT independently re-verified against Décret 06-198 art. 13's actual
text this session** (only 22-167 was checked, to confirm it's wrong) — before applying,
either confirm art. 13's content directly, or treat this as "known wrong, correct source
still needs final confirmation" rather than a fully closed loop.

---

## Phase D — MEDIUM: 3 remaining license-criterion duplicates (G3)

`bakeryCriteria.ts`'s `BAK-10-01`, `coldRoomCriteria.ts`'s `CLD-17-01`, and
`produceStorageCriteria.ts`'s `PRD-01-01` are all confirmed live, still standalone
restatements of `BGN-01-01`'s operating-license check. **Note: `gplCriteria.ts`'s
equivalent (`GPL-01-01`) is no longer in this category** — it was rewritten to include
Décret 24-196 grace-period logic and Décret 06-198 art. 4 non-substitution language,
genuinely new content, not a duplicate. Consider whether these three should get the same
treatment (each has a real regulatory nuance it could carry — bakery/cold-room/produce
storage licensing under Décret 17-140's food-safety regime) rather than simply being
removed. This is a design decision, not a mechanical fix — flagging rather than
prescribing a specific diff.

---

## Phase E — LOW: `PRD-02-01` missing `numericField`

`produceStorageCriteria.ts`'s `PRD-02-01` is typed `controlType: 'measurement'` but has
no `numericField` object, despite stating two numeric ranges in prose (0–5°C for
vegetables, 7–15°C for olives — different ranges per product, which is itself a small
design wrinkle since `numericField` only supports one min/max pair per criterion; may
need splitting into two criteria, one per product type, rather than a single numericField
addition).

```typescript
// Illustrative only — the two-product-range issue above needs a decision first:
// either split into PRD-02-01a (vegetables) / PRD-02-01b (olives), or keep as
// visual/doc rather than forcing an ill-fitting single numeric range.
```

---

## Phase F — Not re-verified this pass, still flagged from the manuscript

- **G9** — Décret 09-19 rollout across every "approved operator" criterion beyond the
  files already confirmed to have it.
- **G10** — `facilityCategoriesFull.json` remains unused; may contain the Décret 07-144
  category mapping. Needs domain-expert review, not a code check.
- **G11** — `BGN-03-06`'s septic-pumping-frequency figure (≤90 days/80% capacity) still
  has no stated legal source.
- **G12 — confirmed still fully open.** `BackupService.ts` (re-fetched live this session)
  reads/writes AsyncStorage directly, bypassing repositories entirely — the storage layer
  is unchanged. `src/db/schema.ts` (Phase A: schema + migration runner) exists but Phase B
  (repositories switching over) has not started, as far as any file checked this session
  shows.
- **Server end-to-end integration** — the `/sync` path is now correct (confirmed), but
  whether it's actually been exercised against a running server instance is unconfirmed.

None of these are diff-ready — G9/G10/G11 need research or a broader audit pass, G12 is a
dedicated migration project. See manuscript Chapter 7 for the engineering-scale framing.

---

## What's now closed — confirmed, not requiring any further action

For completeness, so nothing here gets mistakenly re-opened: G1 (facility mapping), G2
(93-120, all instances except UAB-AX7-07 above), G5 (paint/print emissions criteria
exist), G6 (carpentry/marble numericField), G8 (mechanic expansion), G13 (sync path),
G14 (peer-dep version), G15 (Category type), G16 (all 4 numericField instances), G17a
(AuditLogRepository signature), G17b (`CorrectiveAction.severity`), G17c / G-CAP (the
CAP auto-creation bug — this project's single highest-priority finding), G18 (Décret
06-141 → 06-138, all 6 originally-found instances). Full detail and code-comment
citations for each: `RAQIB_MASTER_MANUSCRIPT.md` Chapter 5 §5.7.

---

## Testing checklist (revised)

- [ ] Phase A: before merging the 5 new criteria, get a third independent confirmation of
      the 50/150 mg/Nm³ figures (or the 100/200 tolerance variants if wired in).
- [ ] Phase B: confirm `UAB-AX7-07`'s new citation text matches `BLS-04-06`'s exact
      already-applied wording (fetch live before writing the diff, don't copy this
      document's illustrative text verbatim without checking).
- [ ] Phase C: fetch Décret 22-167's actual text before editing `UAB-AX6-01`.
- [ ] Run `npx tsc --noEmit` — should now be at or near 0 errors in `src/`, given G15/
      G16/G17a/G17b are all confirmed fixed. Any remaining errors are new information,
      not previously-known items.
- [ ] Smoke-test CAP auto-creation end-to-end on a device build (complete a mock
      inspection with a non-compliant item, confirm a CAP entry appears) — the code path
      is confirmed correct, but this manuscript has not observed it running.
- [ ] `grep -rn "93-120" src/criteria/*.ts` should, after Phase B, return only genuine
      medical-exam criteria.
