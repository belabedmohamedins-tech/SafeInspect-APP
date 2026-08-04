# SafeInspect / RAQIB — Checklist Code Fix Specification
## Implementation-Ready Instructions for Automated PR Generation

**Target repository:** `SafeInspect-APP-main`
**Files affected:** `src/criteria/*.ts`, `src/criteriaData.ts` (no changes required to `src/utils/scoringUtils.ts` — verified correct, do not touch)
**Source of truth for every change below:** direct inspection of the live source at `/mnt/user-data/uploads/SafeInspect-APP-main__3_.zip`, re-verified line-by-line while drafting this document (three items below were corrected from the original audit sessions after this final source check — see the "Corrections vs. prior sessions" callout after each affected phase).

---

## 1. Executive Summary

This document converts the findings of an 8-session, 9-dimension expert-panel audit of SafeInspect/RAQIB's inspection checklist (`src/criteria/*.ts`) into exact, file-level code changes. The goal is to bring the live checklist into compliance with the audit's recommendations: remove ~85 confirmed duplicate criteria (legacy numeric series never actually retired, plus hand-duplicated shared-module content), correct three confirmed legal-citation errors, consolidate the worst-offending redundant modules (universal operating-license check, pest control), and add ~15 criteria addressing confirmed coverage gaps (electrical safety, fire-alarm presence, occupational noise measurement, anti-obstruction enforcement, and others). No change is proposed to the scoring engine (`scoringUtils.ts`), which was independently verified to already correctly implement its documented specification.

---

## 2. Implementation Order

| Phase | Content | Risk | Files touched |
|---|---|---|---|
| **Phase 1** | Remove legacy duplicate blocks | Low — each block is a clean, contiguous, comment-delimited array tail | `abattoirCriteria.ts`, `uabCriteria.ts`, `couvoirCriteria.ts`, `updCriteria.ts` |
| **Phase 2** | Correct 3 confirmed legal citations | Low — string replacement only, no structural change | `gplCriteria.ts`, `printingCriteria.ts`, `uabCriteria.ts` |
| **Phase 3** | Merge duplicated shared-module content | Medium — removes criteria from 11+ facility files, requires `criteriaData.ts` no changes (removal only, no re-import needed since baseline is already spread everywhere) | `baseGeneralCriteria.ts`, 11 facility-specific files, `baseFoodCriteria.ts`, `bakeryCriteria.ts`, `coldRoomCriteria.ts` |
| **Phase 4** | Add new criteria for confirmed gaps | Medium — new content, must be added to both the source file and (where new) spread into the correct checklist arrays in `criteriaData.ts` | `baseGeneralCriteria.ts`, `baseFoodCriteria.ts`, `blacksmithCriteria.ts`, several `AX7`/`AX5` axes, `criteriaData.ts` |
| **Phase 5** | Typing/evidence-standard fixes | Low — single-field changes | `uabCriteria.ts` |

---

## 3. Phase 1 — Remove legacy duplicate blocks

Each of the four affected files still contains **both** the modern `AX`-series criteria and the legacy numeric series they were meant to replace, in the same live exported array. Each legacy series is cleanly delimited by a comment marker through the array's closing bracket — this makes the removal a single contiguous deletion per file, not a scattered multi-line edit.

### 3.1 `src/criteria/abattoirCriteria.ts`

**Change type:** REMOVE
**Delete lines 204–332** (from the comment `// ===== المعايير الجديدة (04) بعد الدمج الذكي =====` through the last criterion object, inclusive). **Keep line 333** (`];`, the array close) and everything after it unchanged.

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

Reason: confirmed near-word-for-word duplicates of `ABT-AX1-01` through `ABT-AX7-02` (wastewater separation, hazardous-waste containers, fire equipment, documentation, worker hygiene, pest control) — Sessions 2, 3, 4, 6, 7, 9.

### 3.2 `src/criteria/uabCriteria.ts`

**Change type:** REMOVE
**Delete lines 277–397** (from `// ===== المعايير الجديدة (01) التي تم دمجها =====` through the last object). **Keep line 398** (`];`).

IDs removed: `01-01` through `01-12`.

Reason: duplicates of `UAB-AX1-01` through `UAB-AX8-02` — Sessions 2, 3, 4, 6, 7, 8. **One correction from the original session findings:** Session 3 paired `01-02` with `UAB-AX1-03` under a "waste" rationale — `UAB-AX1-03` is actually the environmental-impact-study criterion (a documentation concept). The removal itself is still correct (it is a duplicate either way, of a different `AX` criterion than S3 stated); only the stated rationale in the original session was mislabeled. No code impact.

### 3.3 `src/criteria/couvoirCriteria.ts`

**Change type:** REMOVE
**Delete lines 244–354** (from `// ===== المعايير الجديدة (02) =====` through the last object). **Keep line 355** (`];`).

IDs removed: `02-01` through `02-11`.

### 3.4 `src/criteria/updCriteria.ts`

**Change type:** REMOVE
**Delete lines 237–337**, EXCEPT `03-02` — see the correction below. **Keep line 338** (`];`).

IDs removed: `03-01, 03-03, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09, 03-10`.

> **Correction found during this final source check — `03-02` must NOT be removed.** Session 8 listed `03-02` as a duplicate of `UPD-AX2-02`. Direct comparison of the two objects shows they are **not duplicates**: `UPD-AX2-02` covers layout/vegetative-barrier design to reduce odor/dust/noise reaching neighbors, while `03-02` covers **siting distance** from residential clusters ("موقع الحظائر بعيد عن التجمعات السكنية... بمسافة تتناسب مع درجة الخطر"). There is no `AX`-series equivalent of `03-02`'s content anywhere in the file. **Action: rename `03-02` to `UPD-AX2-03` (promoting it out of the legacy series, since it is not actually legacy content) rather than deleting it**, and apply the Phase 4 rewrite (add an actual distance figure) to it under its new ID. See Phase 4.5.

---

## 4. Phase 2 — Correct 3 confirmed legal citations

### 4.1 `src/criteria/gplCriteria.ts` — Décret 04-409 → Décret 21-430 / correct basis

Décret exécutif n° 04-409 (14 December 2004) governs transport of hazardous special waste. It does not govern LPG/C installation licensing, storage, or technical operations. Eight of the file's ten criteria cite it incorrectly. Replace with **Décret exécutif n° 21-430 (4 novembre 2021)**, which governs conditions for practicing the LPG/C equipment installation and maintenance activity (ministerial accreditation, technical competency certification, minimum premises requirements).

**Change type:** MODIFY (8 criteria, `legalReference` field only — no other field changes)

**Correction to this spec, found during the inspection manual's research phase (not caught when this spec was originally written): Décret 21-430 does NOT cover cylinder storage, fire-safety, or emergency-procedure content.** Its full text (now obtained) contains exactly three substantive articles — art. 4 (fuel usage), art. 7 (installer accreditation), art. 8 (equipment approval/use authorization) — all specific to **vehicle GPL-carburant conversion installation**, not LPG bottling/distribution/storage operations. Only `GPL-01-01` and `GPL-01-02` (licensing/accreditation) should cite it. `GPL-02-*` through `GPL-04-*` (cylinder storage, fire safety, emergency procedures) describe a different activity — LPG filling/distribution — and need a different legal basis, most likely Décret 07-144's rubric 1513 (LPG filling/distribution installations, confirmed via the manual's Chapter 6 research to set AM/AW/APAPC license tiers and buffer distances by installation type) rather than 21-430.

```typescript
// GPL-01-01 — BEFORE:
    legalReference: 'المرسوم التنفيذي 06-198 المادة 5 (رخصة الاستغلال للمؤسسات المصنفة) + المرسوم التنفيذي 04-409 المادة 3 (شروط توزيع GPL/C واشتراط الاعتماد المسبق).',
// GPL-01-01 — AFTER (precise, article-confirmed):
    legalReference: 'المرسوم التنفيذي 06-198 المادة 5 (رخصة الاستغلال للمؤسسات المصنفة) + المرسوم التنفيذي رقم 21-430 المؤرخ في 4 نوفمبر 2021 المعدل للمرسوم رقم 83-496، المادة 7 (اشتراط اعتماد وزير المناجم للقيام بتركيب تجهيزات الغاز البترولي المميع كوقود للسيارات).',
```

```typescript
// GPL-01-02 — BEFORE:
    legalReference: 'المرسوم التنفيذي 04-409 المادة 5 (اشتراط الكفاءة التقنية والاعتماد المهني في أنشطة توزيع وتركيب الغاز البترولي المميع).',
// GPL-01-02 — AFTER (precise, article-confirmed — this is now the best-grounded citation in the whole GPL file):
    legalReference: 'المرسوم التنفيذي رقم 21-430 المؤرخ في 4 نوفمبر 2021، المادة 7: شروط الاعتماد تشمل سجل تجاري في نشاط الميكانيك/الكهرباء/الميكاترونيك السياراتية، شهادة تأهيل من هيئة معتمدة من وزير المناجم، شهادة مستوى تعليمي لا يقل عن السنة الرابعة متوسط للعون المكلف بالتركيب، محل بمساحة لا تقل عن 60 م²، وقائمة بالعتاد اللازم لممارسة النشاط.',
```

```typescript
// GPL-02-01, GPL-02-02, GPL-03-01, GPL-03-02, GPL-04-01, GPL-04-02 —
// DO NOT cite Décret 21-430 for these (scope mismatch, per the correction above).
// Recommend citing Décret 07-144's rubric 1513 classification instead, e.g.:
    legalReference: 'المرسوم التنفيذي 07-144 المؤرخ في 19 مايو 2007، الملحق (البند 1513: منشآت تعبئة أو توزيع الغازات القابلة للاشتعال المميعة) + [يُستكمل بمرجع تقني خاص بشروط تخزين قوارير الغاز والسلامة، لم يُحدَّد بعد].',
// This is honest about what's confirmed (the classification/license-tier basis) vs. what
// still needs a dedicated technical-safety-standard citation this manual has not located.
```

> **Note for the PR author (human or AI):** `GPL-01-01` and `GPL-01-02`'s citations above are now confirmed against Décret 21-430's actual article text — no placeholder remains for those two. `GPL-02-*` through `GPL-04-*` still carry an incomplete citation by design (the 07-144/rubric-1513 classification basis is confirmed, but the specific technical-safety-standard component — cylinder storage conditions, spark-free tooling requirements — has not been located in any decree reviewed so far). **Do not fill that remaining gap with an invented article number; leave it flagged until a specific source is found**, consistent with this whole project's standard.

### 4.2 `src/criteria/gplCriteria.ts` and `src/criteria/uabCriteria.ts` — Décret 09-410 → Décret 09-335

Décret 09-410 (10 December 2009) governs security rules for sensitive/security-controlled equipment (night-vision devices, sonar, etc.) — unrelated to emergency intervention planning. The correct instrument is **Décret exécutif n° 09-335 (20 octobre 2009)**, which defines modalities for preparing and implementing internal intervention plans for industrial facility operators.

**Change type:** MODIFY (2 criteria)

```typescript
// GPL-03-03 — BEFORE:
    legalReference: 'القانون 19-02 المادة 12 (الخطة الداخلية للتدخل والإخلاء في المنشآت ذات الأخطار) + المرسوم التنفيذي 09-410 المادة 5 (خطط الطوارئ).',
// GPL-03-03 — AFTER:
    legalReference: 'القانون 19-02 المادة 12 (الخطة الداخلية للتدخل والإخلاء في المنشآت ذات الأخطار) + المرسوم التنفيذي رقم 09-335 المؤرخ في 20 أكتوبر 2009 الذي يحدد كيفيات إعداد وتنفيذ المخططات الداخلية للتدخل من طرف مستغلي المنشآت الصناعية.',
```

```typescript
// UAB-AX1-04 — BEFORE:
    legalReference: 'القانون 03-10 (إدارة المخاطر البيئية) + المرسوم 06-198 (دراسة الخطر للمنشآت ذات الأخطار الكبرى) + المرسوم 09-410 المتعلق بالتجهيزات الحساسة عند الاقتضاء.',
// UAB-AX1-04 — AFTER:
    legalReference: 'القانون 03-10 (إدارة المخاطر البيئية) + المرسوم 06-198 (دراسة الخطر للمنشآت ذات الأخطار الكبرى) + المرسوم التنفيذي رقم 09-335 المؤرخ في 20 أكتوبر 2009 (المخططات الداخلية للتدخل).',
```

### 4.3 `src/criteria/printingCriteria.ts` — Décret 04-409 removed from SDS basis

`PRT-03-03` attributes the SDS (safety data sheet) requirement to Décret 04-409 (hazardous waste transport — unrelated). SDS/chemical-storage obligations in Algerian workplace-safety practice trace to Loi 88-07's general workplace-safety framework, not to a waste-transport decree.

**Change type:** MODIFY

```typescript
// PRT-03-03 — BEFORE:
    legalReference: 'القانون 03-10 المادة 28 (التخزين الآمن للمواد الكيميائية) + المرسوم التنفيذي 04-409 المادة 3 مبدأ تطبيق SDS (بطاقة بيانات السلامة) لكل مادة كيميائية.',
// PRT-03-03 — AFTER:
    legalReference: 'القانون 03-10 المادة 28 (التخزين الآمن للمواد الكيميائية) + القانون 88-07 المتعلق بالوقاية الصحية والأمن وطب العمل (مبدأ توفر بطاقة بيانات السلامة SDS لكل مادة كيميائية خطرة).',
```

> **Note:** this audit could not confirm a single specific Algerian instrument that names "SDS" by that acronym. The AFTER text anchors to Loi 88-07's general chemical-safety framework rather than inventing a specific article number. Flag for legal review before merge if a more precise citation is available.

---

## 5. Phase 3 — Merge duplicated shared-module content

### 5.1 Universal operating-license duplication

`baseGeneralCriteria.ts`'s `BGN-01-01` ("valid operating license matching activity") is spread into all 18 checklists via `criteriaData.ts`. Eleven facility-specific files **also** carry their own independent restatement of the same check. **Change type: MERGE.**

**Step 1 — rewrite `BGN-01-01`** to adopt `MCH-29-01`'s superior phrasing (the only existing criterion that explicitly branches on "operating with no license at all," not just "license invalid"):

```typescript
// src/criteria/baseGeneralCriteria.ts — BGN-01-01 — BEFORE:
    criteria: 'رخصة الاستغلال سارية المفعول ومطابقة لنوع النشاط (منشأة مصنفة وفق الفئة الملائمة).',
    legalReference: 'المرسوم التنفيذي 06-198 المتعلق بالمؤسسات المصنفة (شروط وكيفيات استغلال المنشآت المصنفة).',
// BGN-01-01 — AFTER:
    criteria: 'توفر رخصة استغلال سارية المفعول ومطابقة لنوع النشاط المصرح به (منشأة مصنفة وفق الفئة الملائمة)، أو معاينة كون المنشأة تشتغل بدون أي ترخيص مع الإشارة إلى مخالفة تنظيم المؤسسات المصنفة.',
    legalReference: 'المرسوم التنفيذي 06-198 المتعلق بالمؤسسات المصنفة (شروط وكيفيات استغلال المنشآت المصنفة) والقانون 03-10 الذي يجرّم استغلال منشأة مصنفة دون ترخيص (المواد الجزائية).',
```

**Step 2 — remove** the following facility-specific criteria in their entirety (each is a restatement of the same check with only activity-specific phrasing, which should instead be appended as a short parenthetical inside the relevant facility file's *technical-file* criterion, not kept as a standalone license check):

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

No changes to `criteriaData.ts` are required for this merge — `BGN-01-01` is already spread into every checklist.

### 5.2 Pest control consolidation (the largest single duplication in the codebase)

Four independent layers currently exist. **Change type: MERGE**, consolidating into one module in `baseGeneralCriteria.ts`.

**Step 1 — rewrite `baseGeneralCriteria.ts`'s pest axis (`BGN-07-01` through `BGN-07-05`)** to fold in the strongest evidence standard found across all duplicate versions (`COU-AX8-02`'s trap-map/intervention-log requirement):

```typescript
// src/criteria/baseGeneralCriteria.ts — BGN-07-02 — BEFORE (illustrative; confirm exact current text before editing):
    criteria: 'وجود برنامج مكتوب لمكافحة الآفات (عقد مع متعامل معتمد أو تدخل ذاتي موثق).',
// BGN-07-02 — AFTER:
    criteria: 'وجود برنامج مكتوب لمكافحة الآفات (عقد مع متعامل معتمد أو تدخل ذاتي موثق)، مع خريطة لنقاط وضع المصائد وسجل تدخل مؤرخ يوضح تواريخ المراقبة والمعالجة.',
```

**Step 2 — add one food-specific add-on criterion** (insect screens on openings — `BFD-07-01`'s genuinely non-overlapping content) directly to `baseFoodCriteria.ts`, keeping it as the sole surviving food-specific pest item:

```typescript
// src/criteria/baseFoodCriteria.ts — KEEP BFD-07-01 (insect screens) AS-IS.
// REMOVE BFD-07-02 (trap map) — now redundant with the rewritten BGN-07-02 above.
```

**Step 3 — remove** the remaining independently-authored facility-specific pest criteria:

| File | ID(s) to remove | Reason |
|---|---|---|
| `abattoirCriteria.ts` | (covered by Phase 1 legacy removal — `04-10`) | — |
| `bakeryCriteria.ts` | `BAK-10-09` | Duplicate of consolidated `BGN-07-*` |
| `couvoirCriteria.ts` | `COU-AX8-01` | Duplicate; `AX8-02`'s trap-map language already folded into `BGN-07-02` above |
| `produceStorageCriteria.ts` | `PRD-04-01`, `PRD-04-02` | Duplicate |
| `slaughterhouseSmallCriteria.ts` | `SLH-05-10` | Duplicate |
| `updCriteria.ts` | `UPD-AX8-01`, `UPD-AX8-02` | Duplicate |

**Step 4 — keep `UPD-AX8-03`** (wild-bird/loose-animal exclusion) unchanged — this is genuinely distinct biosecurity content, not pest-control duplication.

**Step 5 — keep `COU-AX8-02`** but rewrite it to reference the now-shared standard rather than restate it independently, or remove it if `BGN-07-02`'s rewrite (Step 1) is judged to fully subsume it — **recommend removal**, since Step 1 already incorporates its content into the universal baseline.

### 5.3 Food-safety near-duplicates (from Session 5, re-confirm before deleting)

**Change type: REMOVE**, with one caution flag:

```
CLD-17-02, CLD-17-03, CLD-17-04, CLD-17-05  — remove (redundant against BFD-05-01–05)
BAK-10-07                                    — remove (redundant against BFD-05-05/07)
BAK-10-08                                    — MODIFY, not remove: keep only the
                                                 "no handling money then dough without
                                                 rewashing hands" clause; remove the
                                                 rest of the object's text (which restates
                                                 BFD-06-01/02/04)
```

> **Caution for the PR author:** unlike the Phase 1 legacy blocks, `CLD-17-*` and `BAK-10-*` are NOT comment-delimited duplicate blocks — they are interleaved with genuinely unique content (`CLD-17-06`, `CLD-17-07` traceability, `BAK-10-01` through `10`'s bakery-specific building/HACCP criteria). **Do not delete a contiguous line range here** — locate and remove each object individually by its `id` field, verifying the surrounding objects are not affected.

---

## 6. Phase 4 — Add new criteria for confirmed gaps

The codebase's `InspectionItem` type (`src/types.ts`) has no `applicableTo`/`facilityTypes` field — applicability is controlled entirely by which checklist array in `criteriaData.ts` a criterion is spread into. Every ADD below specifies exactly which checklist array(s) in `criteriaData.ts` must be updated to include it.

### 4.1 Basic electrical safety (zero coverage anywhere in the codebase — highest-priority ADD)

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts, within the fire-safety axis (near BGN-08-*):
  {
    id: 'BGN-08-04',
    axis: 'السلامة من الحريق',
    category: 'سلامة',
    criteria: 'اللوحة الكهربائية بحالة سليمة (غير مكشوفة، مؤرضة، بدون أسلاك عارية أو وصلات مؤقتة)، مع عدم وجود تحميل زائد ظاهر على المآخذ.',
    legalReference: 'القانون 88-07 المتعلق بالوقاية الصحية والأمن وطب العمل (الوقاية من مخاطر الحريق ذات المصدر الكهربائي) + القانون 19-02 المتعلق بالقواعد العامة للوقاية من أخطار الحريق والفزع.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```
**`criteriaData.ts` action:** none needed — `baseGeneralCriteria` is already spread into every checklist.

### 4.2 Fire-alarm / smoke-detection presence (mandatory tier: UAB, GPL, paint shop, printing; general baseline elsewhere)

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts, fire-safety axis:
  {
    id: 'BGN-08-05',
    axis: 'السلامة من الحريق',
    category: 'سلامة',
    criteria: 'توفر نظام كشف عن الدخان أو الحريق (كاشف دخان، جرس إنذار) بحالة تشغيل سليمة، مناسب لحجم ونوع النشاط.',
    legalReference: 'القانون 19-02 المتعلق بالقواعد العامة للوقاية من أخطار الحريق والفزع.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```
**`criteriaData.ts` action:** none — spread via baseline; severity/scoring naturally weights this higher risk-tier facilities already carry more critical criteria overall, so no special-casing is required at the data level.

### 4.3 Occupational noise-exposure measurement

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts, near the PPE-adjacent axis, reusing the numericField
// schema already proven in baseFoodCriteria.ts (BFD-05-02/03):
  {
    id: 'BGN-09-01',
    axis: 'الصحة والسلامة المهنية',
    category: 'سلامة',
    criteria: 'مستوى الضجيج في مركز العمل ضمن الحدود المسموح بها للتعرض المهني، أو توفر واستعمال وسائل حماية سمعية عند تجاوزه.',
    legalReference: 'القانون 88-07 المتعلق بالوقاية الصحية والأمن وطب العمل + المرسوم التنفيذي 93-120 المؤرخ في 15 مايو 1993 المتعلق بتنظيم طب العمل.',
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
**`criteriaData.ts` action:** spread via baseline; will apply to blacksmith, carpentry, marble, UAB, and every other activity as a universal check, which is correct since noise exposure is a facility-agnostic risk, not activity-type-hardcoded.

### 4.4 Machine guard for blacksmith (parity with carpentry/marble/printing)

```typescript
// ADD to src/criteria/blacksmithCriteria.ts:
  {
    id: 'BLS-04-05',
    axis: 'السلامة المهنية',
    category: 'سلامة',
    criteria: 'وجود واقيات على الأجزاء المتحركة للآلات (صنفرة، مطرقة آلية، مقص)، مع توفر أزرار توقف طارئ عند الاقتضاء.',
    legalReference: 'القانون 88-07 المادة 8 (وسائل الوقاية الجماعية على آلات الإنتاج).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```
**`criteriaData.ts` action:** none — already part of `blacksmithChecklist` composition once added to the source file.

### 4.5 UPD siting-distance rewrite (renamed from `03-02`, per the Phase 1.4 correction)

```typescript
// ADD to src/criteria/updCriteria.ts as UPD-AX2-03 (do NOT delete — rename from legacy 03-02):
  {
    id: 'UPD-AX2-03',
    axis: 'الموقع والعزل',
    category: 'بيئية',
    criteria: 'موقع الحظائر بعيد عن التجمعات السكنية والأراضي الفلاحية غير المرتبطة بالنشاط بمسافة لا تقل عن [يُحدَّد الرقم بناءً على مراجعة تصنيف المؤسسة وفق المرسوم 07-144]، تتناسب مع درجة الخطر (روائح، ضجيج، غبار).',
    legalReference: 'قانون 03-10 لحماية البيئة (حماية راحة الجوار) والمرسوم 07-144 حول تصنيف المؤسسات المصنفة ومساحة الإعلان حول المنشأة.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```
> **Flag for legal review before merge:** the bracketed placeholder marks that this audit could not independently confirm the specific minimum-distance figure in Décret 07-144's text — insert the actual figure before shipping; do not merge with the placeholder still in place.

### 4.6 Anti-obstruction / illegal-operation criterion, made universal

```typescript
// ADD to src/criteria/baseGeneralCriteria.ts (promoted from UAB-AX8-02):
  {
    id: 'BGN-01-03',
    axis: 'هوية المنشأة والوثائق',
    category: 'تنظيمية',
    criteria: 'عدم وجود استغلال للنشاط دون ترخيص، أو رغم صدور قرار تعليق أو غلق، أو عرقلة عمل المفتشين.',
    legalReference: 'القانون 03-10 (المواد الجزائية المتعلقة بالاستغلال دون ترخيص، عدم الامتثال للإعذار، عرقلة التفتيش، ومواصلة الاستغلال رغم الغلق).',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
```
**Then remove `UAB-AX8-02`** (now redundant with the universal baseline version) — add to the Phase 3 removal list.
**`criteriaData.ts` action:** none — spread via baseline to all 18 checklists automatically.

### 4.7 Traceability, added to the shared food baseline

```typescript
// ADD to src/criteria/baseFoodCriteria.ts:
  {
    id: 'BFD-08-01',
    axis: 'التتبعية',
    category: 'تنظيمية',
    criteria: 'مسك سجل تتبعية للمنتجات المستقبلة (اسم المورد، تاريخ الاستلام، طبيعة وكمية المنتوج، رقم الدفعة أو الوثيقة المرفقة).',
    legalReference: 'المرسوم التنفيذي 17-140 (شروط التتبعية في المنشآت الغذائية).',
    severity: 'medium',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
```
**Then remove** `CLD-17-07` and `PRD-05-02` as now-redundant facility-specific versions (already independently confirmed near-identical in Session 5).
**`criteriaData.ts` action:** `baseFoodCriteria` is already spread into abattoir/slaughterhouse/couvoir/UAB checklists (in addition to bakery/coldRoom/produceStorage/UPD), so this automatically closes the Session 5 gap where those four facility types had no traceability criterion at all.

### 4.8 HACCP plan, extended beyond bakery

```typescript
// ADD to src/criteria/abattoirCriteria.ts, src/criteria/slaughterhouseSmallCriteria.ts, and
// src/criteria/coldRoomCriteria.ts (adapt axis/ID prefix per file), modeled on BAK-10-10:
  {
    id: 'ABT-AX9-01',   // use SLH-06-01 / CLD-18-01 in the other two files respectively
    axis: 'HACCP',
    category: 'تنظيمية',
    criteria: 'توفر خطة تحليل المخاطر ونقاط التحكم الحرجة (HACCP) موثقة ومطبقة، تشمل تحديد نقاط التحكم الحرجة (CCP) وإجراءات المراقبة والتصحيح.',
    legalReference: 'المادة 4 من المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017 الذي يُلزم المنشآت الغذائية بتطبيق نظام HACCP وتوثيق إجراءاته.',
    severity: 'high',
    controlType: 'doc',
    complianceStatus: 'not-evaluated',
  },
```
> **Correction from Session 5:** the original session flagged `BAK-10-10`'s own citation as vague/undated. On direct re-check, `BAK-10-10` already cites Décret 17-140 art. 4 with a specific date (27 March 2017) — it does **not** carry the vague "2020 joint ministerial order" citation that was flagged. Only `BFD-05-01` needs a citation-precision fix (see Phase 2.4, next); `BAK-10-10` needs no change and is the correct template for this ADD.

### 4.9 `BFD-05-01` citation precision (Phase 2 addendum, food category)

```typescript
// src/criteria/baseFoodCriteria.ts — BFD-05-01 — BEFORE:
    legalReference: 'المرسوم 17-140 + أدلة GHP/القرار الوزاري المشترك 2020 المتعلق بـ HACCP.',
// BFD-05-01 — AFTER:
    legalReference: 'المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017 (المادة 4: إلزامية تطبيق إجراءات ترتكز على مبادئ HACCP) + أدلة الممارسات الصحية الجيدة (GHP) المصادق عليها.',
```

---

## 7. Phase 5 — Typing / evidence-standard fixes

```typescript
// src/criteria/uabCriteria.ts — UAB-AX7-04 — BEFORE:
    controlType: 'visual',
// AFTER (the criterion's own text requires "صيانة موثقة" — documented maintenance —
// which is a document check, not a visual one):
    controlType: 'doc',
```

---

## 8. New Shared Modules

**No new files are recommended.** The codebase's existing architecture (per-facility criteria files, composed via spreads into checklist arrays in `criteriaData.ts`) already provides the correct mechanism for shared content — `baseGeneralCriteria.ts` and `baseFoodCriteria.ts` are themselves the shared modules. Creating additional new files (e.g., a separate `sharedPestModule.ts`) would introduce a second competing shared-content pattern into a codebase whose core problem is already *too many* independently-maintained versions of the same content. All MERGE operations above target the two existing shared files instead.

---

## 9. Testing & Validation Checklist

- [ ] `npm run build` completes with no TypeScript errors after all phases.
- [ ] `grep -rn "id: '04-\|id: '01-\|id: '02-\|id: '03-'" src/criteria/abattoirCriteria.ts src/criteria/uabCriteria.ts src/criteria/couvoirCriteria.ts src/criteria/updCriteria.ts` returns **zero matches** (confirms legacy series fully removed), except `UPD-AX2-03` (renamed, not deleted).
- [ ] `grep -rn "04-409\|09-410" src/criteria/*.ts` returns **zero matches** (confirms all mis-citations corrected).
- [ ] Run the existing Jest suite (`src/__tests__/scoringUtils.test.ts`, `src/__tests__/utils.test.ts`, and any criteria-count/ID-assertion tests) — **expect failures** in any test that hardcodes a total criteria count or asserts specific legacy IDs exist; update those test fixtures to match the new counts, do not silence them.
- [ ] For each of the 18 entries in `criteriaData.ts`'s checklist map, manually confirm the resulting array has no duplicate `id` values (`new Set(checklist.map(c => c.id)).size === checklist.length`).
- [ ] Spot-check the couvoir and UPD checklists specifically — confirm pest-control item count has dropped from ~10 and ~12 respectively to 2–3 (per Session 9's count).
- [ ] Confirm `scoringUtils.ts` is untouched (`git diff src/utils/scoringUtils.ts` returns empty) — it was independently verified correct and is out of scope for this change set.
- [ ] Confirm the `BGN-01-03` (anti-obstruction) and `BGN-08-04`/`BGN-08-05` (electrical/alarm) additions appear in every one of the 18 checklists generated by `criteriaData.ts` (they should, automatically, via the `baseGeneralCriteria` spread — verify this is actually true rather than assuming it).
- [ ] Manually review every `legalReference` string touched in Phase 2 and Phase 4 against the actual Journal Officiel text before merging to production — this document flags several article-number placeholders that need human/legal verification, not just code-correctness verification.

---

## 10. Appendix — Full List of Changes

*Criteria not listed below are unchanged (KEEP). This table covers every ID referenced in Phases 1–5.*

| ID(s) | File | Disposition |
|---|---|---|
| `04-01…04-11` | abattoirCriteria.ts | REMOVE (legacy block) |
| `01-01…01-12` | uabCriteria.ts | REMOVE (legacy block) |
| `02-01…02-11` | couvoirCriteria.ts | REMOVE (legacy block) |
| `03-01, 03-03…03-10` | updCriteria.ts | REMOVE (legacy block, excl. 03-02) |
| `03-02` | updCriteria.ts | MODIFY → renamed `UPD-AX2-03`, rewritten with distance figure |
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
| `CLD-17-02, CLD-17-03, CLD-17-04, CLD-17-05, BAK-10-07` | respective files | REMOVE |
| `BAK-10-08` | bakeryCriteria.ts | MODIFY (trim to money-handling clause only) |
| `BGN-08-04` (new) | baseGeneralCriteria.ts | ADD |
| `BGN-08-05` (new) | baseGeneralCriteria.ts | ADD |
| `BGN-09-01` (new) | baseGeneralCriteria.ts | ADD |
| `BLS-04-05` (new) | blacksmithCriteria.ts | ADD |
| `UPD-AX2-03` (new, renamed) | updCriteria.ts | ADD (see `03-02` row above) |
| `BGN-01-03` (new) | baseGeneralCriteria.ts | ADD |
| `UAB-AX8-02` | uabCriteria.ts | REMOVE (superseded by `BGN-01-03`) |
| `BFD-08-01` (new) | baseFoodCriteria.ts | ADD |
| `CLD-17-07, PRD-05-02` | respective files | REMOVE (superseded by `BFD-08-01`) |
| `ABT-AX9-01, SLH-06-01, CLD-18-01` (new) | respective files | ADD (HACCP extension) |
| `BFD-05-01` | baseFoodCriteria.ts | MODIFY (citation precision) |
| `BAK-10-10` | bakeryCriteria.ts | KEEP unchanged (correction from Session 5) |
