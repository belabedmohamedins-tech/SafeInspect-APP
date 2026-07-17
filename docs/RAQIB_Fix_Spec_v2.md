# RAQIB — Verified Fix Specification v2
## Implementation-ready diffs for the bugs confirmed in RAQIB_MASTER_MANUSCRIPT.md Ch.6/Ch.8

**Source of truth for every change below:** direct inspection of
`SafeInspect-APP-main__5_.zip`, plus an actual `npm install --legacy-peer-deps` and
`npx tsc --noEmit` run against it. Every diff here fixes a *confirmed* error (either a
`tsc` compiler error, or a verified live data-mapping mismatch) — nothing here is
speculative. Companion document: `RAQIB_MASTER_MANUSCRIPT.md`, Chapters 6 and 8, which
contain the reasoning; this file contains only the mechanical fix.

**Target repository:** `SafeInspect-APP-main`
**No changes required to:** `src/utils/scoringUtils.ts`, the server's Prisma schema, any
`.tsx` screen files — all issues found are in `src/types.ts`, `src/criteria/*.ts`,
`src/services/*.ts`, `src/repositories/*.ts`, `src/criteriaData.ts`, `package.json`.

**⚠️ Staleness note:** Phases 0–6 were drafted against one zip snapshot; Phases 7–8 were
added in a follow-up session while active development was already happening separately
against the live GitHub repo via Perplexity, which may be ahead of that snapshot at any
given moment. This was confirmed directly, not hypothetically — re-checking before
drafting Phase 7 found that G5 (paint-shop/printing emissions) had already been resolved,
and drafting new content against the stale assumption would have produced duplicate,
conflicting criteria. **Before applying any phase below, re-verify its "BEFORE" code block
still matches the current repo** — each phase's verification step (grep/tsc check) exists
partly for this reason, not just to confirm the fix landed correctly.

---

## Phase 0 — Environment fix (G14)

### 0.1 `package.json`

**Change type:** MODIFY

```json
// BEFORE:
    "react-native-safe-area-context": "~5.0.0",
// AFTER:
    "react-native-safe-area-context": "~5.4.0",
```

**Reason:** `expo-router@56.2.15` (already the installed version) declares a peer
dependency of `react-native-safe-area-context >=5.4.0`. As shipped, a plain `npm install`
fails with `ERESOLVE` and requires `--legacy-peer-deps` to complete at all. This is a
one-line, low-risk version bump; run `npm install` (without the flag) afterward to confirm
it resolves cleanly, and smoke-test any screen using safe-area insets since this is a minor
version bump within the same major.

---

## Phase 1 — Facility↔checklist mapping (G1)

### 1.1 `src/criteriaData.ts`

**Change type:** MODIFY (replace the entire `criteriaByActivity` object body)

```typescript
// BEFORE:
export const criteriaByActivity: Record<string, InspectionItem[]> = {
  default: baseGeneralCriteria,
  'الديوان الوطني لأغذية الأنعام': uabChecklist,
  'وحدة مذابح الغرب': abattoirChecklist,
  'وحدة تفريخ الدواجن': couvoirChecklist,
  'وحدة تربية الدواجن': updChecklist,
  'مذبحة دواجن <500 كغ/يوم': slaughterhouseSmallChecklist,
  'مخبزة صناعية': bakeryChecklist,
  'غرفة تبريد': coldRoomChecklist,
  'ميكانيك سيارات': mechanicChecklist,
  'مذبحة دواجن ≤500 كغ/ي': slaughterhouseSmallChecklist,
  'منشأة صناعة تغذية حيوانية': uabChecklist,
  'إنتاج أغذية الأنعام (مؤسسة عمومية اقتصادية)': uabChecklist,
  'مفرخة الدواجن (مؤسسة عمومية اقتصادية)': couvoirChecklist,
  'تربية الدواجن (مؤسسة عمومية اقتصادية)': updChecklist,
  'ذبح وبيع الدواجن (مؤسسة عمومية اقتصادية)': slaughterhouseSmallChecklist,
  'ميكانيك': mechanicChecklist,
  'تربية الدواجن (07 حظائر)': updChecklist,
  'تربية الدواجن (03 حظائر)': updChecklist,
  'تربية الدواجن (حظيرتين)': updChecklist,
  'تربية الدواجن (حظيرة)': updChecklist,
  // ── New activity types ──────────────────────────────────────────────────
  'ورشة حدادة': blacksmithChecklist,
  'صناعة سياج': blacksmithChecklist,
  'ورشة نجارة': carpenteryChecklist,
  'ورشة ألمنيوم': carpenteryChecklist,
  'غسل وتشحيم السيارات': carWashChecklist,
  'تركيب GPL': gplChecklist,
  'تركيب GPL/C': gplChecklist,
  'صناعة الرخام': marbleChecklist,
  'ورشة طلاء السيارات': paintShopChecklist,
  'مطبعة': printingChecklist,
  'لوازم مدرسية ومكاتب': printingChecklist,
  'وحدة تخزين الزيتون والخضر': produceStorageChecklist,
  'تعبئة مواد شبه صيدلانية': semiPharmaChecklist,
};

// AFTER:
export const criteriaByActivity: Record<string, InspectionItem[]> = {
  default: baseGeneralCriteria,

  // ── Animal feed manufacturing (UAB) ───────────────────────────────────────
  'الديوان الوطني لأغذية الأنعام': uabChecklist,
  'منشأة صناعة تغذية حيوانية': uabChecklist,
  'إنتاج أغذية الأنعام (مؤسسة عمومية اقتصادية)': uabChecklist,

  // ── Poultry farming (UPD) ──────────────────────────────────────────────
  'تربية الدواجن (حظيرة)': updChecklist,
  'تربية الدواجن (حظيرتين)': updChecklist,
  'تربية الدواجن (03 حظائر)': updChecklist,
  'تربية الدواجن (07 حظائر)': updChecklist,
  'تربية الدواجن (مؤسسة عمومية اقتصادية)': updChecklist,

  // ── Hatchery (Couvoir) ─────────────────────────────────────────────────
  'مفرخة الدواجن (مؤسسة عمومية اقتصادية)': couvoirChecklist,

  // ── Slaughter & poultry processing ────────────────────────────────────
  'مذبحة دواجن ≤500 كغ/ي': slaughterhouseSmallChecklist,
  'ذبح وبيع الدواجن (مؤسسة عمومية اقتصادية)': slaughterhouseSmallChecklist,
  // FIX (G1): this activity string previously had no matching key at all and
  // silently fell to baseGeneralCriteria. Per RAQIB_Checklist_Audit_Report.docx
  // §7.1, medium-throughput slaughter (500kg–2t/day) uses identical criteria
  // to full abattoir — no dedicated checklist exists or is needed.
  'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)': abattoirChecklist,

  // ── Bakery ───────────────────────────────────────────────────────────
  'مخبزة صناعية': bakeryChecklist,

  // ── Cold storage ─────────────────────────────────────────────────────
  'غرفة تبريد': coldRoomChecklist,

  // ── Produce / agricultural storage ───────────────────────────────────
  'وحدة تخزين الزيتون والخضر': produceStorageChecklist,

  // ── Automotive workshops ──────────────────────────────────────────────
  'ميكانيك': mechanicChecklist,
  // FIX (G1): previously unmapped — real facility records use this exact
  // string ("auto mechanic" variant), not the shorter 'ميكانيك سيارات' alias.
  'ميكانيك السيارات': mechanicChecklist,
  'غسل وتشحيم السيارات': carWashChecklist,
  'ورشة طلاء السيارات': paintShopChecklist,

  // ── Metalwork / fabrication ────────────────────────────────────────────
  'ورشة حدادة': blacksmithChecklist,
  // FIX (G1): previously unmapped — real facility records use the full
  // parenthetical variant, not the standalone 'صناعة سياج' alias.
  'ورشة حدادة (صناعة السياج)': blacksmithChecklist,

  // ── Woodwork / aluminium joinery ────────────────────────────────────────
  'ورشة نجارة': carpenteryChecklist,
  // FIX (G1): previously unmapped — real facility records use this exact
  // string, not the shorter 'ورشة ألمنيوم' alias.
  'ورشة نجارة الألمنيوم': carpenteryChecklist,

  // ── Stone & marble ──────────────────────────────────────────────────────
  'صناعة الرخام': marbleChecklist,

  // ── Printing & stationery ──────────────────────────────────────────────
  // FIX (G1): previously unmapped — real facility records use the full name,
  // not either of the two shorter aliases that were here before.
  'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب': printingChecklist,

  // ── Gas installation ────────────────────────────────────────────────────
  'تركيب GPL/C': gplChecklist,

  // ── Semi-pharmaceutical packaging ──────────────────────────────────────
  'تعبئة مواد شبه صيدلانية': semiPharmaChecklist,
};
```

**Removed (dead keys, matched no facility record):** `'وحدة مذابح الغرب'`,
`'وحدة تفريخ الدواجن'`, `'وحدة تربية الدواجن'`, `'مذبحة دواجن <500 كغ/يوم'`,
`'ميكانيك سيارات'`, `'صناعة سياج'`, `'ورشة ألمنيوم'`, `'تركيب GPL'`, `'مطبعة'`,
`'لوازم مدرسية ومكاتب'`.

> **Note for whoever applies this diff:** Arabic string literals are exact-match keys.
> Copy every replacement string directly from this document (or better, from
> `src/facilitiesData.ts`'s actual `activity:` values) rather than retyping — a single
> character difference (e.g. a stray diacritic) silently recreates this exact bug class.

**Verification:** after applying, re-run the diff check:
```bash
python3 -c "
import re
fac = set(re.findall(r\"activity: '([^']*)'\", open('src/facilitiesData.ts').read()))
crit = open('src/criteriaData.ts').read()
m = re.search(r'criteriaByActivity: Record<string, InspectionItem\[\]> = \{(.*?)\n\};', crit, re.S)
keys = set(re.findall(r\"'([^']*)':\", m.group(1)))
keys.discard('default')
print('Unmapped:', sorted(fac - keys))
print('Dead keys:', sorted(keys - fac))
"
```
Both lists must print empty.

---

## Phase 2 — `types.ts` fixes (G15, plus the `CorrectiveAction.severity` piece of G17)

### 2.1 `src/types.ts` — `Category` type (G15)

**Change type:** MODIFY

```typescript
// BEFORE:
export type Category = 'تنظيمية' | 'بيئية' | 'صحيه' | 'سلامة' | 'نظافة' | 'عامة';

// AFTER:
export type Category = 'تنظيمية' | 'بيئية' | 'صحية' | 'سلامة' | 'نظافة' | 'عامة' | 'غذائية';
```

**Reason:** 33 criteria across 5 files (`abattoirCriteria.ts` ×9, `baseFoodCriteria.ts`
×9, `couvoirCriteria.ts` ×7, `uabCriteria.ts` ×3, `updCriteria.ts` ×5) use `'صحية'`
(the value actually used everywhere it appears) where the type declared `'صحيه'` (a
single-character orthographic variant), and `baseFoodCriteria.ts` additionally uses
`'غذائية'`, which had no member in the type at all. This fix changes the *type* to match
the *actual, already-shipped data* rather than changing 33 call sites across 5 files — the
lower-risk direction, since the data was consistent with itself, just not with the type
declaration.

**Do NOT edit any `.ts` file in `src/criteria/` for this fix.** This is a type-only change.

### 2.2 `src/types.ts` — `CorrectiveAction.severity` (part of G17)

**Change type:** MODIFY

```typescript
// BEFORE:
export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  inspectionItemId: string;
  facilityId: string;
  facilityName: string;
  criteria: string;
  severity: Severity;
  deadline: string;
  ...

// AFTER:
export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  inspectionItemId: string;
  facilityId: string;
  facilityName: string;
  criteria: string;
  /**
   * CAP-level severity. Usually mirrors the source criterion's Severity, but
   * can be independently escalated to 'critical' for items whose
   * sanctionTier === 'court-referral' (see capFactory.ts). This is a CAP-only
   * escalation tier — it does not exist on InspectionItem.severity or in the
   * scoring model (scoringUtils.ts), which remain 'high'|'medium'|'low' only.
   */
  severity: Severity | 'critical';
  deadline: string;
  ...
```

**Reason:** `src/services/capFactory.ts`'s own code comment already documents this exact
intent ("CorrectiveAction.severity also accepts 'critical'"), but the type was never
updated to match — a confirmed `tsc` error (`TS2678`, `TS2322`) at `capFactory.ts:13` and
`:48`, and the same pattern in `CapReportService.ts`'s two `Record<CorrectiveAction['severity'], ...>`
maps. This fix makes the type match the already-written, already-commented intent; no
change needed to `capFactory.ts` or `CapReportService.ts` themselves once this lands.

---

## Phase 3 — `numericField` schema fixes (G16, 4 files)

Apply the same shape correction in all 4 locations. Template (matches
`coldRoomCriteria.ts`'s already-correct `CLD-17-04`):

```typescript
numericField: {
  unit: '<unit>',
  labelAr: '<label>',
  max: <value>,        // or min, depending on direction
  warningMax: <value>,  // slightly inside the limit, for early-warning UI
  step: <value>,
  upperLimit: true,      // if only an upper bound applies
},
```

### 3.1 `src/criteria/baseFoodCriteria.ts` — `BFD-04-01` (chilled)

```typescript
// BEFORE:
    numericField: {
      label: 'درجة حرارة التبريد المقاسة (°C)',
      unit: '°C',
      threshold: 5,
      comparisonOperator: 'lte',
    },
// AFTER:
    numericField: {
      unit: '°C',
      labelAr: 'درجة حرارة التبريد المقاسة',
      max: 5,
      warningMax: 4,
      step: 0.1,
      upperLimit: true,
    },
```

### 3.2 `src/criteria/baseFoodCriteria.ts` — `BFD-04-02` (frozen)

```typescript
// BEFORE:
    numericField: {
      label: 'درجة حرارة التجميد المقاسة (°C)',
      unit: '°C',
      threshold: -18,
      comparisonOperator: 'lte',
    },
// AFTER:
    numericField: {
      unit: '°C',
      labelAr: 'درجة حرارة التجميد المقاسة',
      max: -18,
      warningMax: -16,
      step: 0.1,
      upperLimit: true,
    },
```

### 3.3 `src/criteria/blacksmithCriteria.ts` — `BLS-04-06` (occupational noise)

```typescript
// BEFORE:
    numericField: {
      label: 'مستوى الضجيج المقاس (ديسيبل)',
      unit: 'dB',
      threshold: 85,
      comparisonOperator: 'lte',
    },
// AFTER:
    numericField: {
      unit: 'dB',
      labelAr: 'مستوى الضجيج المقاس',
      max: 85,
      warningMax: 80,
      step: 1,
      upperLimit: true,
    },
```
> Also see Phase 5 (G2) — this criterion's `legalReference` needs the 93-120 correction.

### 3.4 `src/criteria/uabCriteria.ts` — `UAB-AX7-07` (occupational noise)

```typescript
// BEFORE:
    numericField: {
      label: 'مستوى الضجيج المقاس (ديسيبل)',
      unit: 'dB',
      threshold: 85,
      comparisonOperator: 'lte',
    },
// AFTER:
    numericField: {
      unit: 'dB',
      labelAr: 'مستوى الضجيج المقاس',
      max: 85,
      warningMax: 80,
      step: 1,
      upperLimit: true,
    },
```
> Also see Phase 5 (G2) — this criterion's `legalReference` needs the 93-120 correction,
> and its `category: 'صحية'` is already correct under the Phase 2.1 type fix — no change
> needed there once Phase 2.1 lands.

**If your `NumericFieldRenderer`/`NumericInputField` component reads `threshold`/
`comparisonOperator` anywhere, that component itself needs updating to read
`min`/`max`/`warningMax` instead — check this before shipping Phase 3.**

---

## Phase 4 — Repository refactor completion (G17)

### 4.1 `src/repositories/InspectionRepository.ts` and `src/repositories/ApprovalRepository.ts` — `AuditLogRepository.append()` call sites

`AuditLogRepository.append` is defined as:
```typescript
async append(
  action: AuditAction,
  inspectorName: string,
  opts?: { inspectionId?: string; facilityName?: string; detail?: string },
): Promise<void>
```

Every call site in both files currently uses the old, pre-refactor object-argument style.
**Change type: MODIFY, at every call site found by** `grep -n "AuditLogRepository.append(" src/repositories/InspectionRepository.ts src/repositories/ApprovalRepository.ts`.

```typescript
// BEFORE (example — InspectionRepository.ts save()):
await AuditLogRepository.append({
  action: 'INSPECTION_SAVED',
  inspectionId: toSave.id,
  facilityName: toSave.facilityName,
  inspectorName: toSave.inspectorName,
});

// AFTER:
await AuditLogRepository.append(
  'INSPECTION_SAVED',
  toSave.inspectorName,
  { inspectionId: toSave.id, facilityName: toSave.facilityName },
);
```

```typescript
// BEFORE (example — InspectionRepository.ts delete()):
await AuditLogRepository.append({
  action: 'INSPECTION_DELETED',
  inspectionId: id,
  facilityName: target.facilityName,
  inspectorName: target.inspectorName,
});

// AFTER:
await AuditLogRepository.append(
  'INSPECTION_DELETED',
  target.inspectorName,
  { inspectionId: id, facilityName: target.facilityName },
);
```

```typescript
// BEFORE (example — InspectionRepository.ts deleteMany()):
await AuditLogRepository.append({
  action: 'INSPECTION_BULK_DELETED',
  inspectorName: 'system',
  detail: `حذف ${ids.length} تقارير`,
});

// AFTER:
await AuditLogRepository.append(
  'INSPECTION_BULK_DELETED',
  'system',
  { detail: `حذف ${ids.length} تقارير` },
);
```

```typescript
// BEFORE (example — ApprovalRepository.ts, approve flow):
await AuditLogRepository.append({
  action: 'INSPECTION_SAVED',
  inspectionId,
  facilityName: q[idx].facilityName,
  inspectorName: supervisorName,
  detail: `اعتمد المشرف ${supervisorName}`,
});

// AFTER:
await AuditLogRepository.append(
  'INSPECTION_SAVED',
  supervisorName,
  { inspectionId, facilityName: q[idx].facilityName, detail: `اعتمد المشرف ${supervisorName}` },
);
```

The pattern is mechanical: first positional arg = old `action` field, second = old `inspectorName` field, everything else (`inspectionId`, `facilityName`, `detail`) moves into the third `opts` object.

### 4.2 `src/repositories/InspectionRepository.ts` — dangling reference to a removed method

```typescript
// BEFORE:
      await CorrectiveActionRepository.createFromInspection(toSave);
// AFTER:
      await createCapItemsFromInspection(toSave);
```
Add the import at the top of the file:
```typescript
import { createCapItemsFromInspection } from '../services/capFactory';
```
And remove `CorrectiveActionRepository` from this file's imports if it's no longer used
elsewhere in the file after this change.

**Reason:** `CorrectiveActionRepository.createFromInspection` does not exist. The function
that actually does "auto-create CAP items from a completed inspection" is
`capFactory.ts`'s `createCapItemsFromInspection`. **This is very likely why CAP items are
not being auto-created on inspection completion in the running app today** — worth an
end-to-end smoke test after this fix lands.

### 4.3 `src/services/SyncService.ts` — nonexistent `updatedAt` field

```typescript
// BEFORE:
    const existingTs = existing.updatedAt ?? existing.date ?? '';
    const incomingTs = inspection.updatedAt ?? inspection.date ?? '';
// AFTER:
    const existingTs = existing.date ?? '';
    const incomingTs = inspection.date ?? '';
```

**Reason:** `SavedInspection` has no `updatedAt` field — only `date`. The `?? existing.date`
fallback means this was silently absorbed at runtime, but it's dead, misleading code.

### 4.4 `src/services/PhotoService.ts` and `src/services/BackupService.ts` — `expo-file-system` import

**Change type: MODIFY**, identical in both files:

```typescript
// BEFORE:
import * as FileSystem from 'expo-file-system';
// AFTER:
import * as FileSystem from 'expo-file-system/legacy';
```

**Reason:** `CapReportService.ts` and `pdfService.ts` already correctly import from the
`/legacy` subpath in this same codebase; `PhotoService.ts` and `BackupService.ts` were
evidently not updated when that pattern was adopted.

### 4.5 `src/db/schema.ts` — flagged, not fixed here

3 "no overload matches" errors appear in this file's table-definition calls. This file is
mid-migration and not yet consumed by any repository — **do not fix in isolation**;
address as part of the dedicated SQLite migration work.

---

## Phase 5 — Sync endpoint path fix (G13)

Pick **one** of the two options — don't do both.

### Option A (recommended — smaller diff): fix the client

`src/services/SyncService.ts`

```typescript
// BEFORE:
  await apiClient('/sync/inspections', { method: 'POST', body: ... });
// AFTER:
  await apiClient('/sync', { method: 'POST', body: ... });
```

### Option B: add a route alias server-side

`server/src/routes/sync.ts` — add a second route registration for the same handler:
```typescript
router.post('/inspections', /* same handler as router.post('/', ...) */);
```
Only do this if `/sync/inspections` is already referenced elsewhere such that changing
the client path would break something else.

---

## Phase 6 — Legal citation corrections (G2)

### 6.1 Noise-limit citations (2 files) — Décret 93-120 → flag as unsourced

```typescript
// src/criteria/blacksmithCriteria.ts — BLS-04-06 — BEFORE:
    legalReference: 'المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل) + القانون 90-11.',
// AFTER (interim):
    legalReference: 'الحد الأقصى للضجيج المهني (85 ديسيبل) هو مرجع دولي شائع (منظمة الصحة العالمية/OSHA)، وليس قيمة مؤكدة في التشريع الجزائري حالياً — يُستخدم كأفضل ممارسة معتمدة إلى حين تأكيد نص جزائري محدد. + القانون 90-11 (علاقات العمل).',
```

```typescript
// src/criteria/uabCriteria.ts — UAB-AX7-07 — BEFORE:
    legalReference: 'المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل) + القانون 18-11 (السلامة في أماكن العمل).',
// AFTER (interim):
    legalReference: 'الحد الأقصى للضجيج المهني (85 ديسيبل) هو مرجع دولي شائع (منظمة الصحة العالمية/OSHA)، وليس قيمة مؤكدة في التشريع الجزائري حالياً — يُستخدم كأفضل ممارسة معتمدة إلى حين تأكيد نص جزائري محدد. + القانون 18-11 (السلامة في أماكن العمل).',
```

> Do this interim fix now; revisit once Research Task R1/R6 closes. Do not accept a
> specific article number as a "correction" unless paired with the actual source text.

### 6.2 `baseGeneralCriteria.ts` — `BGN-09-01` (neighbor-facing 70 dB figure)

Locate via `grep -n "70 ديسيبل\|93-120" src/criteria/baseGeneralCriteria.ts` and apply
the same interim treatment, citing Loi 03-10 art. 27 as the primary basis.

### 6.3 Machine-guarding / dust / general-PPE citations (7 files)

```bash
grep -rn "93-120" src/criteria/*.ts
```
For each hit (excluding medical-exam criteria), replace with:
- **Loi 88-07 art. 8** — machine-guarding, emergency stops
- **Loi 88-07 art. 10** — general PPE

**Leave every medical-exam citation untouched** — those are the correct uses of 93-120.

**Verification:** `grep -rn "93-120" src/criteria/*.ts` should return only medical-exam
criteria. Cross-check each remaining hit's `criteria` field contains "فحص طبي" /
"الطب المهني".

---

## Phase 7 — ⛔ SUPERSEDED, do not apply — mechanic checklist expansion (G8)

**Confirmed live: `mechanicCriteria.ts` already has `MCH-29-08`, `MCH-29-09`, and
`MCH-29-10`** (brake fluid, tyre waste, lead-acid battery). **Applying the draft below
would create duplicate/colliding IDs — do not apply it.** Left in place only as a record
of what was originally proposed.

<details>
<summary>Original draft (do not apply — kept for reference only)</summary>

```typescript
  {
    id: 'MCH-29-08',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'جمع سائل الفرامل المستعمل (المحتوي على الغليكول) في حاويات محكمة ومنفصلة عن الزيوت المستعملة، مع عدم خلطه بأي سائل تقني آخر قبل التسليم للمتعامل المعتمد.',
    legalReference: 'القانون 01-19 المتعلق بتسيير النفايات (تصنيف النفايات الخاصة الخطرة) + المرسوم التنفيذي 05-315 (وجوب التصريح والتعامل مع متعاملين معتمدين للنفايات الخاصة الخطرة).',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-09',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'تخزين الإطارات المستعملة في منطقة مخصصة، بعيداً عن مصادر الحرارة (خطر حريق)، وعدم تكديسها في الطريق العام أو حرقها في الهواء الطلق؛ التسليم لمتعامل معتمد لإعادة التدوير أو الاستعمال أو التثمين.',
    legalReference: 'القانون 01-19 المادة 22 (تثمين وإعادة تدوير النفايات) + القانون 03-10 المادة 56 (حظر الحرق العشوائي للنفايات في الهواء الطلق).',
    severity: 'medium',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
  {
    id: 'MCH-29-10',
    axis: 'النفايات الخطرة',
    category: 'بيئية',
    criteria: 'تخزين البطاريات المستعملة (رصاص-حمض) في مكان مخصص، على أرضية غير منفذة أو في حاوية مانعة للتسرب، بعيداً عن أي احتمال تلامس مع مياه الأمطار أو الصرف.',
    legalReference: 'القانون 01-19 المتعلق بتسيير النفايات + المرسوم التنفيذي 05-315.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```

</details>

---

## Phase 8 — G18, Décret 06-141 mis-cited for air emissions (6 instances, 3 files)

**Décret 06-141 is the wastewater/liquid-discharge decree.** The correct instrument for
VOC/air-emission limits is **Décret 06-138** — already correctly cited for this exact
purpose in `carpenteryCriteria.ts` and `marbleCriteria.ts`.

**Change type: MODIFY, all 6 locations:**

```typescript
// src/criteria/paintShopCriteria.ts — PNT-02-01 — BEFORE:
    legalReference: 'القانون 03-10 + المرسوم 06-141 (القيم القصوى للانبعاثات الهوائية الصناعية).',
// AFTER:
    legalReference: 'القانون 03-10 + المرسوم التنفيذي 06-138 (القيم القصوى للانبعاثات الهوائية الصناعية).',
```

```typescript
// src/criteria/paintShopCriteria.ts — PNT-02-02 — BEFORE:
    legalReference: 'المرسوم 06-141.',
// AFTER:
    legalReference: 'المرسوم التنفيذي 06-138.',
```

```typescript
// src/criteria/paintShopCriteria.ts — PNT-02-03 — BEFORE:
    legalReference: 'القانون 03-10 المادة 52 (التزام المنشآت المصنفة بمراقبة انبعاثاتها الهوائية) + المرسوم 06-141 (القيم القصوى للانبعاثات الهوائية الصناعية — VOC).',
// AFTER:
    legalReference: 'القانون 03-10 المادة 52 (التزام المنشآت المصنفة بمراقبة انبعاثاتها الهوائية) + المرسوم التنفيذي 06-138 (القيم القصوى للانبعاثات الهوائية الصناعية).',
```

```typescript
// src/criteria/printingCriteria.ts — PRT-02-01 — BEFORE:
    legalReference: 'القانون 03-10 + المرسوم 06-141.',
// AFTER:
    legalReference: 'القانون 03-10 + المرسوم التنفيذي 06-138.',
```

```typescript
// src/criteria/printingCriteria.ts — PRT-02-02 — BEFORE:
    legalReference: 'المرسوم 06-141 (القيم القصوى للانبعاثات الهوائية الصناعية).',
// AFTER:
    legalReference: 'المرسوم التنفيذي 06-138 (القيم القصوى للانبعاثات الهوائية الصناعية).',
```

```typescript
// src/criteria/printingCriteria.ts — PRT-02-03 — BEFORE:
    legalReference: 'القانون 03-10 المادة 52 (التزام المنشآت المصنفة بمراقبة انبعاثاتها الهوائية) + المرسوم 06-141 (القيم القصوى للانبعاثات الهوائية الصناعية — VOC).',
// AFTER:
    legalReference: 'القانون 03-10 المادة 52 (التزام المنشآت المصنفة بمراقبة انبعاثاتها الهوائية) + المرسوم التنفيذي 06-138 (القيم القصوى للانبعاثات الهوائية الصناعية).',
```

**`BLS-04-07` (blacksmith)** — same fix, same pattern.

---

## Phase 9 — 🔴 URGENT: revert two "corrections" that landed backwards

### 9.1 Décret 93-120 does not contain an "Art. 9" noise limit

The roadmap's Phase 10 asserts *"Workplace noise limit (85 dB) → Décret 93-120 Art. 9 ✅ CORRECT USE"*
and instructs `BLS-04-06` be left unchanged.

The legal manual's Occupational Health chapter states verbatim: *"Occupational noise-exposure
limit — [research gap, not confirmed]... neither source contained a specific dB(A) ceiling."*
**"Art. 9" is a level of specificity the underlying research never established — this reads
as fabricated precision.**

**Action:** revert `BLS-04-06`'s citation to the interim form from Phase 6.1 (85 dB
presented as an international reference, not a specific Algerian decree article). Treat
Research Task R1/R6 as still open.

### 9.2 Décret 06-141 still does not govern VOC/air emissions

The roadmap's "Known Correct Citations" table asserts *"Décret 06-141 | VOC emission
limits (printing, paint, blacksmith) ✅."* This is G18 from Phase 8 — written into the
roadmap as settled fact in the wrong direction.

The legal manual's Chapter 1 gives 06-141's full parameter table: flow, temperature, pH,
suspended solids, BOD5, COD, aluminum, phenol, oils/greases, cadmium, copper, lead,
chromium, nickel, zinc, iron, cobalt. **Every parameter is a liquid-discharge parameter.
None is an airborne concentration.**

**Action:** revert `PRT-02-03`, `PNT-02-03`, and `BLS-04-07` from 06-141 back to 06-138
per the diffs in Phase 8. **The roadmap did not fix this — it relabeled the error as correct.**

### 9.3 Lower-confidence flag: Décret 76-35's dual scope

The roadmap resolves R5 by asserting Décret 76-35 covers "generic compressed-gas storage"
for `CGS-01-xx`. May well be right — but `baseGeneralCriteria.ts`'s `BGN-08-03`
(electrical safety) also cited 76-35 and the roadmap doesn't address that second use.

**Action:** `grep -rn "76-35" src/criteria/*.ts` and sanity-check both uses are legitimate.

---

## Phase 10 — Status matrix (confirmed against live files)

| Gap | Confirmed status |
|---|---|
| G1 (facility mapping) | ✅ Fully fixed (Phase 1 above still needed for key-string corrections) |
| G2 (legal citations) | ⚠️ Partially fixed — Phase 6 + Phase 9 reversions still needed |
| G5 (paint-shop/printing emissions) | ✅ Already resolved before Phase 7 was drafted |
| G8 (mechanic checklist gaps) | ✅ Already resolved — Phase 7 SUPERSEDED |
| G13 (sync endpoint) | ❌ Still broken — Phase 5 needed |
| G14 (peer deps) | ❌ Still broken — Phase 0 needed |
| G15 (Category type) | ❌ Still broken — Phase 2.1 needed |
| G16 (numericField schema) | ❌ Still broken — Phase 3 needed |
| G17 (repository refactor) | ❌ Still broken — Phase 4 needed |
| G18 (06-141 mis-citation) | 🔴 Roadmap relabeled as correct — Phase 8 + Phase 9.2 needed |
