> This spec is built from a fresh line-by-line re-check of the actual source, not just a reformatting of the nine session reports — which caught three real errors before they could turn into a bad PR:
>
> - `UPD-03-02` was wrongly marked for deletion. Session 8 called it a duplicate of `UPD-AX2-02`, but they're different criteria — one's about odor/noise buffer landscaping, the other's about actual siting distance from residential areas. Deleting it would have silently removed the checklist's only siting-distance check. Spec now renames it to `UPD-AX2-03` and keeps it.
> - `BAK-10-10` doesn't need the citation fix Session 5 flagged. It already cites Décret 17-140 art. 4 with a specific date — the vague "2020 joint ministerial order" citation only lives in `BFD-05-01`. Fixed the target.
> - Confirmed the legacy-series removals really are clean, contiguous, comment-delimited blocks in all four files (abattoir, UAB, couvoir, UPD) — so those four deletions are low-risk exact line ranges, while the food-safety near-duplicates (`CLD-17-*`, `BAK-10-*`) are interleaved with real content and need per-ID removal, not a range delete. The spec calls that distinction out explicitly.
>
> Also flagged rather than guessed: exact article numbers for the Décret 21-430 replacement citations, and the actual minimum-distance figure for the UPD siting criterion — both marked as placeholders needing human legal verification before merge, not invented.

# SafeInspect / RAQIB — Checklist Code Fix Specification
## Implementation-Ready Instructions for Automated PR Generation

**Target repository:** `SafeInspect-APP-main`  
**Files affected:** `src/criteria/*.ts`, `src/criteriaData.ts` (no changes required to `src/utils/scoringUtils.ts` — verified correct, do not touch)  
**Source of truth for every change below:** direct inspection of the live source, re-verified line-by-line while drafting this document.

---

## 1. Executive Summary

This document converts the findings of an 8-session, 9-dimension expert-panel audit of SafeInspect/RAQIB's inspection checklist (`src/criteria/*.ts`) into exact, file-level code changes. The goal is to bring the live checklist into compliance with the audit's recommendations: remove ~85 confirmed duplicate criteria (legacy numeric series never actually retired, plus hand-duplicated shared-module content), correct three confirmed legal-citation errors, consolidate the worst-offending redundant modules (universal operating-license check, pest control), and add ~15 criteria addressing confirmed coverage gaps (electrical safety, fire-alarm presence, occupational noise measurement, anti-obstruction enforcement, and others). No change is proposed to the scoring engine (`scoringUtils.ts`), which was independently verified to already correctly implement its documented specification.

---

## 2. Implementation Order

| Phase | Content | Risk | Files touched |
|---|---|---|---|
| **Phase 1** | Remove legacy duplicate blocks | Low — each block is a clean, contiguous, comment-delimited array tail | `abattoirCriteria.ts`, `uabCriteria.ts`, `couvoirCriteria.ts`, `updCriteria.ts` |
| **Phase 2** | Correct 3 confirmed legal citations | Low — string replacement only, no structural change | `gplCriteria.ts`, `printingCriteria.ts`, `uabCriteria.ts` |
| **Phase 3** | Merge duplicated shared-module content | Medium — removes criteria from 11+ facility files | `baseGeneralCriteria.ts`, 11 facility-specific files, `baseFoodCriteria.ts`, `bakeryCriteria.ts`, `coldRoomCriteria.ts` |
| **Phase 4** | Add new criteria for confirmed gaps | Medium — new content | `baseGeneralCriteria.ts`, `baseFoodCriteria.ts`, `blacksmithCriteria.ts`, several `AX7`/`AX5` axes, `criteriaData.ts` |
| **Phase 5** | Typing/evidence-standard fixes | Low — single-field changes | `uabCriteria.ts` |

---

## 3. Phase 1 — Remove legacy duplicate blocks

Each of the four affected files still contains **both** the modern `AX`-series criteria and the legacy numeric series they were meant to replace, in the same live exported array. Each legacy series is cleanly delimited by a comment marker through the array's closing bracket — this makes the removal a single contiguous deletion per file, not a scattered multi-line edit.

### 3.1 `src/criteria/abattoirCriteria.ts`

**Change type:** REMOVE  
**Delete lines 204–332** (from the comment `// ===== المعايير الجديدة (04) بعد الدمج الذكي =====` through the last criterion object, inclusive). **Keep line 333** (`];`) and everything after it unchanged.

IDs removed: `04-01, 04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09, 04-10, 04-11`.

```typescript
// BEFORE (lines 202–205, showing the boundary):
  },

  // ===== المعايير الجديدة (04) بعد الدمج الذكي =====
  {
    id: '04-01',
    ...

// AFTER:
  },

];
```

Reason: confirmed near-word-for-word duplicates of `ABT-AX1-01` through `ABT-AX7-02` — Sessions 2, 3, 4, 6, 7, 9.

### 3.2 `src/criteria/uabCriteria.ts`

**Change type:** REMOVE  
**Delete lines 277–397** (from `// ===== المعايير الجديدة (01) التي تم دمجها =====` through the last object). **Keep line 398** (`];`).

IDs removed: `01-01` through `01-12`.

Reason: duplicates of `UAB-AX1-01` through `UAB-AX8-02` — Sessions 2, 3, 4, 6, 7, 8.

### 3.3 `src/criteria/couvoirCriteria.ts`

**Change type:** REMOVE  
**Delete lines 244–354** (from `// ===== المعايير الجديدة (02) =====` through the last object). **Keep line 355** (`];`).

IDs removed: `02-01` through `02-11`.

### 3.4 `src/criteria/updCriteria.ts`

**Change type:** REMOVE  
**Delete lines 237–337**, EXCEPT `03-02` — see the correction below. **Keep line 338** (`];`).

IDs removed: `03-01, 03-03, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09, 03-10`.

> **Correction — `03-02` must NOT be removed.** Session 8 listed `03-02` as a duplicate of `UPD-AX2-02`. Direct comparison shows they are **not duplicates**: `UPD-AX2-02` covers layout/vegetative-barrier design to reduce odor/dust/noise reaching neighbors, while `03-02` covers **siting distance** from residential clusters. There is no `AX`-series equivalent of `03-02`'s content anywhere in the file. **Action: rename `03-02` to `UPD-AX2-03`** and apply the Phase 4 rewrite to it. See Phase 4.5.

---

## 4. Phase 2 — Correct 3 confirmed legal citations

### 4.1 `src/criteria/gplCriteria.ts` — Décret 04-409 → Décret 21-430

Décret 04-409 (14 December 2004) governs transport of hazardous special waste — it does not govern LPG/C installation licensing. Replace with **Décret exécutif n° 21-430 (4 novembre 2021)**.

**Change type:** MODIFY (8 criteria, `legalReference` field only)

```typescript
// GPL-01-01 — BEFORE:
    legalReference: '... + المرسوم التنفيذي 04-409 المادة 3 ...',
// GPL-01-01 — AFTER:
    legalReference: '... + المرسوم التنفيذي 21-430 المؤرخ في 4 نوفمبر 2021 ...',
```

Apply same substitution pattern to: `GPL-01-02`, `GPL-02-01`, `GPL-02-02`, `GPL-03-01`, `GPL-03-02`, `GPL-04-01`, `GPL-04-02`.

> **Note:** article numbers in the AFTER text have been deliberately omitted where this audit could not independently verify the exact article of Décret 21-430. **Before merging**, confirm specific article numbers against the Journal Officiel text.

### 4.2 `gplCriteria.ts` and `uabCriteria.ts` — Décret 09-410 → Décret 09-335

Décret 09-410 governs security-controlled equipment (unrelated to emergency planning). The correct instrument is **Décret exécutif n° 09-335 (20 octobre 2009)**, which defines modalities for internal intervention plans.

**Change type:** MODIFY (2 criteria)

```typescript
// GPL-03-03 — BEFORE:
    legalReference: '... + المرسوم التنفيذي 09-410 المادة 5 ...',
// GPL-03-03 — AFTER:
    legalReference: '... + المرسوم التنفيذي رقم 09-335 المؤرخ في 20 أكتوبر 2009 ...',

// UAB-AX1-04 — BEFORE:
    legalReference: '... + المرسوم 09-410 ...',
// UAB-AX1-04 — AFTER:
    legalReference: '... + المرسوم التنفيذي رقم 09-335 المؤرخ في 20 أكتوبر 2009 (المخططات الداخلية للتدخل).',
```

### 4.3 `src/criteria/printingCriteria.ts` — Décret 04-409 removed from SDS basis

`PRT-03-03` incorrectly attributes the SDS requirement to Décret 04-409.

```typescript
// PRT-03-03 — BEFORE:
    legalReference: '... + المرسوم التنفيذي 04-409 المادة 3 مبدأ تطبيق SDS ...',
// PRT-03-03 — AFTER:
    legalReference: '... + القانون 88-07 المتعلق بالوقاية الصحية والأمن وطب العمل (مبدأ توفر بطاقة بيانات السلامة SDS لكل مادة كيميائية خطرة).',
```

---

## 5. Phase 3 — Merge duplicated shared-module content

### 5.1 Universal operating-license duplication

`BGN-01-01` is spread into all 18 checklists via `criteriaData.ts`. Eleven facility-specific files also carry their own independent restatement of the same check.

**Step 1 — rewrite `BGN-01-01`** to adopt `MCH-29-01`'s superior phrasing (explicitly branching on "operating with no license at all"):

```typescript
// src/criteria/baseGeneralCriteria.ts — BGN-01-01 — BEFORE:
    criteria: 'رخصة الاستغلال سارية المفعول ومطابقة لنوع النشاط (منشأة مصنفة وفق الفئة الملائمة).',
    legalReference: 'المرسوم التنفيذي 06-198 ...',
// BGN-01-01 — AFTER:
    criteria: 'توفر رخصة استغلال سارية المفعول ومطابقة لنوع النشاط المصرح به، أو معاينة كون المنشأة تشتغل بدون أي ترخيص مع الإشارة إلى مخالفة تنظيم المؤسسات المصنفة.',
    legalReference: 'المرسوم التنفيذي 06-198 + القانون 03-10 الذي يجرّم استغلال منشأة مصنفة دون ترخيص.',
```

**Step 2 — remove** the following facility-specific duplicate license criteria:

| File | ID to remove |
|---|---|
| `blacksmithCriteria.ts` | `BLS-01-01` |
| `carpentryCriteria.ts` | `CAR-01-01` |
| `carWashCriteria.ts` | `CWS-01-01` |
| `marbleCriteria.ts` | `MRB-01-01` |
| `paintShopCriteria.ts` | `PNT-01-01` |
| `printingCriteria.ts` | `PRT-01-01` |
| `mechanicCriteria.ts` | `MCH-29-01` |
| `gplCriteria.ts` | `GPL-01-01` |
| `semiPharmaCriteria.ts` | `SPH-01-01` |
| `bakeryCriteria.ts` | `BAK-10-01` |
| `coldRoomCriteria.ts` | `CLD-17-01` |
| `produceStorageCriteria.ts` | `PRD-01-01` |

No changes to `criteriaData.ts` are required — `BGN-01-01` is already spread into every checklist.

### 5.2 Pest control consolidation

**Step 1 — rewrite `BGN-07-02`** to fold in `COU-AX8-02`'s trap-map/intervention-log requirement:

```typescript
// BGN-07-02 — AFTER:
    criteria: 'وجود برنامج مكتوب لمكافحة الآفات (عقد مع متعامل معتمد أو تدخل ذاتي موثق)، مع خريطة لنقاط وضع المصائد وسجل تدخل مؤرخ يوضح تواريخ المراقبة والمعالجة.',
```

**Step 2 — keep `BFD-07-01`** (insect screens) in `baseFoodCriteria.ts` as the sole surviving food-specific pest item. **Remove `BFD-07-02`** (trap map — now redundant).

**Step 3 — remove** remaining facility-specific pest criteria:

| File | ID(s) to remove |
|---|---|
| `bakeryCriteria.ts` | `BAK-10-09` |
| `couvoirCriteria.ts` | `COU-AX8-01`, `COU-AX8-02` |
| `produceStorageCriteria.ts` | `PRD-04-01`, `PRD-04-02` |
| `slaughterhouseSmallCriteria.ts` | `SLH-05-10` |
| `updCriteria.ts` | `UPD-AX8-01`, `UPD-AX8-02` |

**Step 4 — keep `UPD-AX8-03`** (wild-bird/loose-animal exclusion) — genuinely distinct biosecurity content.

### 5.3 Food-safety near-duplicates

```
CLD-17-02, CLD-17-03, CLD-17-04, CLD-17-05  — REMOVE (redundant against BFD-05-01–05)
BAK-10-07                                    — REMOVE (redundant against BFD-05-05/07)
BAK-10-08                                    — MODIFY: keep only the money-handling/handwashing clause
```

> **Caution:** unlike Phase 1 legacy blocks, `CLD-17-*` and `BAK-10-*` are NOT comment-delimited blocks — they are interleaved with genuinely unique content. **Do not delete a contiguous line range here** — locate and remove each object individually by its `id` field.

---

## 6. Phase 4 — Add new criteria for confirmed gaps

The `InspectionItem` type has no `applicableTo`/`facilityTypes` field — applicability is controlled entirely by which checklist array in `criteriaData.ts` a criterion is spread into.

### 4.1 Basic electrical safety (zero coverage anywhere — highest-priority ADD)

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts, fire-safety axis (near BGN-08-*):
  {
    id: 'BGN-08-04',
    axis: 'السلامة من الحريق',
    category: 'سلامة',
    criteria: 'اللوحة الكهربائية بحالة سليمة (غير مكشوفة، مؤرضة، بدون أسلاك عارية أو وصلات مؤقتة)، مع عدم وجود تحميل زائد ظاهر على المآخذ.',
    legalReference: 'القانون 88-07 + القانون 19-02.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```

**`criteriaData.ts` action:** none — spread via baseline automatically.

### 4.2 Fire-alarm / smoke-detection presence

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts, fire-safety axis:
  {
    id: 'BGN-08-05',
    axis: 'السلامة من الحريق',
    category: 'سلامة',
    criteria: 'توفر نظام كشف عن الدخان أو الحريق (كاشف دخان، جرس إنذار) بحالة تشغيل سليمة.',
    legalReference: 'القانون 19-02.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```

### 4.3 Occupational noise-exposure measurement

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts, using the numericField schema:
  {
    id: 'BGN-09-01',
    axis: 'الصحة والسلامة المهنية',
    category: 'سلامة',
    criteria: 'مستوى الضجيج في مركز العمل ضمن الحدود المسموح بها، أو توفر واستعمال وسائل حماية سمعية.',
    legalReference: 'القانون 88-07 + المرسوم التنفيذي 93-120.',
    severity: 'medium',
    controlType: 'measurement',
    complianceStatus: 'not-evaluated',
    numericField: {
      unit: 'dB(A)',
      labelAr: 'مستوى الضجيج المقاس (8 ساعات)',
      min: 0,
      max: 85,
      warningMax: 90,
      step: 1,
    },
  },
```

### 4.4 Machine guard for blacksmith (parity with carpentry/marble/printing)

```typescript
// ADD to src/criteria/blacksmithCriteria.ts:
  {
    id: 'BLS-04-05',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'وجود واقيات على الأجزاء المتحركة للآلات، مع توفر أزرار توقف طارئ.',
    legalReference: 'القانون 88-07 المادة 8.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```

### 4.5 UPD siting-distance rewrite (renamed from `03-02`)

```typescript
// ADD to src/criteria/updCriteria.ts as UPD-AX2-03:
  {
    id: 'UPD-AX2-03',
    axis: 'الموقع والعزل',
    category: 'بيئية',
    criteria: 'موقع الحظائر بعيد عن التجمعات السكنية بمسافة لا تقل عن [يُحدَّد بناءً على مراجعة المرسوم 07-144].',
    legalReference: 'قانون 03-10 + المرسوم 07-144.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```

> **Flag for legal review:** the bracketed placeholder marks an unconfirmed minimum-distance figure. Insert the actual figure before merging; do not merge with the placeholder in place.

### 4.6 Anti-obstruction / illegal-operation (universal)

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts:
  {
    id: 'BGN-01-03',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'عدم وجود استغلال للنشاط دون ترخيص، أو رغم صدور قرار تعليق أو غلق، أو عرقلة عمل المفتشين.',
    legalReference: 'القانون 03-10 (المواد الجزائية).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
```

**Then remove `UAB-AX8-02`** (now redundant with the universal version).

### 4.7 Traceability — shared food baseline

```typescript
// ADD to src/criteria/baseFoodCriteria.ts:
  {
    id: 'BFD-08-01',
    axis: 'التتبعية',
    category: 'تنظيمية',
    criteria: 'مسك سجل تتبعية للمنتجات المستقبلة (اسم المورد، تاريخ الاستلام، طبيعة وكمية المنتوج، رقم الدفعة).',
    legalReference: 'المرسوم التنفيذي 17-140.',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
```

**Then remove** `CLD-17-07` and `PRD-05-02` as now-redundant facility-specific versions.

### 4.8 HACCP plan — extended beyond bakery

Add modeled on `BAK-10-10` to: `abattoirCriteria.ts` (`ABT-AX9-01`), `slaughterhouseSmallCriteria.ts` (`SLH-06-01`), `coldRoomCriteria.ts` (`CLD-18-01`).

```typescript
  {
    id: 'ABT-AX9-01',   // adapt prefix per file
    axis: 'HACCP',
    category: 'تنظيمية',
    criteria: 'توفر خطة HACCP موثقة ومطبقة، تشمل تحديد نقاط التحكم الحرجة (CCP) وإجراءات المراقبة والتصحيح.',
    legalReference: 'المادة 4 من المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
```

### 4.9 `BFD-05-01` citation precision

```typescript
// src/criteria/baseFoodCriteria.ts — BFD-05-01 — BEFORE:
    legalReference: 'المرسوم 17-140 + أدلة GHP/القرار الوزاري المشترك 2020 المتعلق بـ HACCP.',
// BFD-05-01 — AFTER:
    legalReference: 'المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017 (المادة 4) + أدلة الممارسات الصحية الجيدة (GHP) المصادق عليها.',
```

---

## 7. Phase 5 — Typing / evidence-standard fixes

```typescript
// src/criteria/uabCriteria.ts — UAB-AX7-04 — BEFORE:
    controlType: 'visual',
// AFTER (criterion requires documented maintenance — a doc check, not visual):
    controlType: 'doc',
```

---

## 8. New Shared Modules

**No new files are recommended.** `baseGeneralCriteria.ts` and `baseFoodCriteria.ts` are already the shared modules. Creating additional new shared files would introduce a competing pattern into a codebase whose core problem is already too many independently-maintained versions of the same content.

---

## 9. Testing & Validation Checklist

> ⚠️ **Note:** Jest coverage tests for the criteria changes should be written **after** the checklist rework is complete, not during. The items below are build/grep/manual verification steps only — not Jest test authoring tasks.

- [ ] `npm run build` completes with no TypeScript errors after all phases.
- [ ] `grep -rn "id: '04-\|id: '01-\|id: '02-\|id: '03-'" src/criteria/abattoirCriteria.ts src/criteria/uabCriteria.ts src/criteria/couvoirCriteria.ts src/criteria/updCriteria.ts` returns **zero matches** (confirms legacy series fully removed), except `UPD-AX2-03`.
- [ ] `grep -rn "04-409\|09-410" src/criteria/*.ts` returns **zero matches** (confirms all mis-citations corrected).
- [ ] For each of the 18 entries in `criteriaData.ts`'s checklist map, manually confirm no duplicate `id` values (`new Set(checklist.map(c => c.id)).size === checklist.length`).
- [ ] Spot-check the couvoir and UPD checklists — confirm pest-control item count has dropped from ~10/~12 to 2–3.
- [ ] Confirm `scoringUtils.ts` is untouched (`git diff src/utils/scoringUtils.ts` returns empty).
- [ ] Confirm `BGN-01-03`, `BGN-08-04`, `BGN-08-05` appear in every one of the 18 checklists via the `baseGeneralCriteria` spread.
- [ ] Manually review every `legalReference` string touched in Phase 2 and Phase 4 against the Journal Officiel before merging — several article-number placeholders need human/legal verification.

---

## 10. Appendix — Full Disposition Table

| ID(s) | File | Disposition |
|---|---|---|
| `04-01…04-11` | abattoirCriteria.ts | REMOVE (legacy block) |
| `01-01…01-12` | uabCriteria.ts | REMOVE (legacy block) |
| `02-01…02-11` | couvoirCriteria.ts | REMOVE (legacy block) |
| `03-01, 03-03…03-10` | updCriteria.ts | REMOVE (legacy block, excl. 03-02) |
| `03-02` | updCriteria.ts | MODIFY → renamed `UPD-AX2-03`, rewritten with distance placeholder |
| `GPL-01-01, 01-02, 02-01, 02-02, 03-01, 03-02, 04-01, 04-02` | gplCriteria.ts | MODIFY (citation: 04-409 → 21-430) |
| `GPL-03-03` | gplCriteria.ts | MODIFY (citation: 09-410 → 09-335) |
| `UAB-AX1-04` | uabCriteria.ts | MODIFY (citation: 09-410 → 09-335) |
| `PRT-03-03` | printingCriteria.ts | MODIFY (citation: remove 04-409) |
| `UAB-AX7-04` | uabCriteria.ts | MODIFY (`controlType`: visual → doc) |
| `BGN-01-01` | baseGeneralCriteria.ts | MODIFY (adopt no-license branch) |
| `BLS-01-01, CAR-01-01, CWS-01-01, MRB-01-01, PNT-01-01, PRT-01-01, MCH-29-01, GPL-01-01, SPH-01-01, BAK-10-01, CLD-17-01, PRD-01-01` | respective files | REMOVE (merged into `BGN-01-01`) |
| `BGN-07-02` | baseGeneralCriteria.ts | MODIFY (add trap-map/log requirement) |
| `BFD-07-02` | baseFoodCriteria.ts | REMOVE (redundant with rewritten `BGN-07-02`) |
| `BAK-10-09, COU-AX8-01, COU-AX8-02, PRD-04-01, PRD-04-02, SLH-05-10, UPD-AX8-01, UPD-AX8-02` | respective files | REMOVE (pest-control consolidation) |
| `UPD-AX8-03` | updCriteria.ts | KEEP unchanged |
| `CLD-17-02…17-05, BAK-10-07` | respective files | REMOVE |
| `BAK-10-08` | bakeryCriteria.ts | MODIFY (trim to money-handling clause only) |
| `BGN-08-04` (new) | baseGeneralCriteria.ts | ADD |
| `BGN-08-05` (new) | baseGeneralCriteria.ts | ADD |
| `BGN-09-01` (new) | baseGeneralCriteria.ts | ADD |
| `BLS-04-05` (new) | blacksmithCriteria.ts | ADD |
| `UPD-AX2-03` (new) | updCriteria.ts | ADD (renamed from 03-02) |
| `BGN-01-03` (new) | baseGeneralCriteria.ts | ADD |
| `BFD-08-01` (new) | baseFoodCriteria.ts | ADD |
| `ABT-AX9-01, SLH-06-01, CLD-18-01` (new) | respective files | ADD (HACCP extension) |
| `BFD-05-01` | baseFoodCriteria.ts | MODIFY (citation precision) |
| `UAB-AX8-02` | uabCriteria.ts | REMOVE (merged into BGN-01-03) |
| `CLD-17-07, PRD-05-02` | respective files | REMOVE (merged into BFD-08-01) |
