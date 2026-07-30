# RAQIB — Verified Fix Specification v2
## Implementation-ready diffs for the bugs confirmed in RAQIB_MASTER_MANUSCRIPT.md Ch.6/Ch.8

**⚠️ SUPERSEDED by `RAQIB_Fix_Spec_v3.md`.** Nearly everything in this document (Phases 0,
1, 2, 3, 4, 5, 6, 8, 9) has since been confirmed applied via live GitHub verification —
several with code comments citing this document's own phase numbers. Phase 7 was already
marked superseded within this document itself. **Use v3 for anything still actionable —
it contains only what's genuinely open, plus one new high-priority item (correct
emissions thresholds for Research Task R7) that v2 never covered.** This document is kept
only as a historical record of what was found and fixed.

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
`'لوازم مدرسية ومكاتب'`, `'الديوان الوطني لأغذية الأنعام'` (this one is legitimately
kept above under UAB — the *duplicate*/near-miss removed here was a second,
differently-spelled dead entry; verify against your actual file before deleting, since
the near-duplicate Arabic strings are easy to conflate visually).

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

**If your `NumericFieldRenderer`/`NumericInputField` component (not reviewed in this
spec — locate via `grep -rn "NumericInputField" src/`) reads `threshold`/
`comparisonOperator` anywhere, that component itself needs updating to read
`min`/`max`/`warningMax` instead — check this before shipping Phase 3, since fixing the
data shape without checking the consumer could silently break rendering the other
direction.**

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

**Apply the same object→positional-args transform to every remaining call site** — the
pattern is mechanical and identical at each location: first positional arg is the old
`action` field, second is the old `inspectorName` field, everything else (`inspectionId`,
`facilityName`, `detail`) moves into the third `opts` object argument.

### 4.2 `src/repositories/InspectionRepository.ts` — dangling reference to a removed method

```typescript
// BEFORE:
      await CorrectiveActionRepository.createFromInspection(toSave);
// AFTER:
      await createCapItemsFromInspection(toSave);
```
And add the import at the top of the file:
```typescript
import { createCapItemsFromInspection } from '../services/capFactory';
```
And remove `CorrectiveActionRepository` from this file's imports if it's no longer used
elsewhere in the file after this change (`grep -n "CorrectiveActionRepository"` on the
file to check).

**Reason:** `CorrectiveActionRepository.createFromInspection` does not exist and never has
in this codebase's current shape — `CorrectiveActionRepository.ts`'s actual export list is
`getAll`, `getByInspection`, `getByFacility`, `getOpen`, `getOverdue`, `getStats`,
`persistOverdueEscalation`, `save`, `updateStatus`, `delete`, `deleteByInspection`. The
function that actually does "auto-create CAP items from a completed inspection" —
matching this call site's intent exactly, including duplicate-prevention logic — is
`capFactory.ts`'s `createCapItemsFromInspection`, which is never called from
`InspectionRepository.ts` as currently written. **This is very likely why CAP items are
not being auto-created on inspection completion in the running app today** — worth an
end-to-end smoke test (complete a mock inspection with a non-compliant item, confirm a CAP
entry appears) after this fix lands, since it may be closing a real functional gap, not
just a type error.

### 4.3 `src/services/SyncService.ts` — nonexistent `updatedAt` field

```typescript
// BEFORE:
    const existingTs = existing.updatedAt ?? existing.date ?? '';
    const incomingTs = inspection.updatedAt ?? inspection.date ?? '';
// AFTER:
    const existingTs = existing.date ?? '';
    const incomingTs = inspection.date ?? '';
```

**Reason:** `SavedInspection` (confirmed via `types.ts`) has no `updatedAt` field — only
`date`. The `?? existing.date` fallback in the original code means this bug was silently
absorbed at runtime (the `.updatedAt` access just evaluates to `undefined`, falling
through to `.date`), so this hasn't caused a visible failure — but it's dead, misleading
code that should be simplified rather than left as a trap for the next person reading it.
If a genuine "last-modified" timestamp distinct from the inspection `date` field is
actually wanted here (arguably more correct for conflict resolution — `date` is when the
*inspection* happened, not when the *record* was last edited), that's a small, separate
enhancement: add `updatedAt?: string` to `SavedInspection` and set it on every `save()` —
flagged here as an option, not prescribed, since it's a design choice, not a bug fix.

### 4.4 `src/services/PhotoService.ts` and `src/services/BackupService.ts` — `expo-file-system` import

**Change type: MODIFY**, identical in both files:

```typescript
// BEFORE:
import * as FileSystem from 'expo-file-system';
// AFTER:
import * as FileSystem from 'expo-file-system/legacy';
```

**Reason:** the installed `expo-file-system` version no longer exposes
`documentDirectory` from its default export — `CapReportService.ts` and `pdfService.ts`
already correctly import from the `/legacy` subpath in this same codebase; `PhotoService.ts`
and `BackupService.ts` were evidently not updated when that pattern was adopted. No other
code change needed in either file — the rest of the `FileSystem.*` API surface used
(`getInfoAsync`, `makeDirectoryAsync`, `writeAsStringAsync`, `EncodingType`) is present on
the legacy import too.

### 4.5 `src/db/schema.ts` — flagged, not fixed here

3 "no overload matches" errors appear in this file's table-definition calls. This file is
mid-migration (manuscript Chapter 1 §1.1, "Phase A") and not yet consumed by any
repository — fixing it is entangled with the SQLite migration itself (manuscript Chapter 6
G12/Chapter 7 Phase 5), not a standalone mechanical fix. **Do not fix in isolation** —
address as part of the dedicated SQLite migration work, since the correct fix depends on
decisions (column types, indexing) that should be made once, deliberately, not patched
twice.

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
Only do this if `/sync/inspections` is already referenced elsewhere (e.g. API
documentation, another client) such that changing the client path would break something
else — otherwise Option A is strictly simpler and there's no reason to carry two paths for
one endpoint.

**After either fix:** this integration has never been exercised end-to-end (manuscript
Ch.8 §8.2) — a real smoke test (run the server locally, point a dev build of the mobile
app at it, complete and sync one inspection) is the only way to confirm this actually
works beyond "the URL now matches."

---

## Phase 6 — Legal citation corrections (G2)

Full rationale in `RAQIB_MASTER_MANUSCRIPT.md` Chapter 2 §2.4.1 / Chapter 4 §4.3. This
phase is citation-text-only — no `id`, `severity`, `controlType`, or `numericField`
changes (those were handled in Phase 3 for the two files that overlap).

### 6.1 Noise-limit citations (2 files) — Décret 93-120 → flag as unsourced, do not silently swap in 93-184 without R6

```typescript
// src/criteria/blacksmithCriteria.ts — BLS-04-06 — BEFORE:
    legalReference: 'المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل) + القانون 90-11.',
// AFTER (interim — until Research Task R1/R6 resolves the correct instrument):
    legalReference: 'الحد الأقصى للضجيج المهني (85 ديسيبل) هو مرجع دولي شائع (منظمة الصحة العالمية/OSHA)، وليس قيمة مؤكدة في التشريع الجزائري حالياً — يُستخدم كأفضل ممارسة معتمدة إلى حين تأكيد نص جزائري محدد. + القانون 90-11 (علاقات العمل).',
```

```typescript
// src/criteria/uabCriteria.ts — UAB-AX7-07 — BEFORE:
    legalReference: 'المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل) + القانون 18-11 (السلامة في أماكن العمل).',
// AFTER (interim):
    legalReference: 'الحد الأقصى للضجيج المهني (85 ديسيبل) هو مرجع دولي شائع (منظمة الصحة العالمية/OSHA)، وليس قيمة مؤكدة في التشريع الجزائري حالياً — يُستخدم كأفضل ممارسة معتمدة إلى حين تأكيد نص جزائري محدد. + القانون 18-11 (السلامة في أماكن العمل).',
```

> **Do this interim fix now; revisit once R1 (find the actual Algerian noise-exposure
> decree, if one exists) or R6 (re-verify Décret 93-184 as the correct citation) closes.**
> This directly implements the instruction already recorded in the legal manual's own
> front matter — presenting 85 dB(A) as international best practice, not dressed up as a
> specific Algerian decree.

### 6.2 `baseGeneralCriteria.ts` — `BGN-09-01` (neighbor-facing 70 dB figure)

Locate the criterion (`grep -n "70 ديسيبل\|93-120" src/criteria/baseGeneralCriteria.ts`)
and apply the same interim treatment as 6.1, adjusted for the neighbor-facing (not
occupational) context — cite Loi 03-10 art. 27 (already the correct general
neighbor-protection citation used elsewhere in this same file) as the primary basis, and
apply the same "85 dB → international reference, not confirmed Algerian law" caveat
pattern to the 70 dB figure if no better citation is found.

### 6.3 Machine-guarding / dust / general-PPE citations (7 files)

Locate every remaining `93-120` citation not already handled in 6.1/6.2:
```bash
grep -rn "93-120" src/criteria/*.ts
```
For each, replace with **Loi 88-07 art. 8** (machine-guarding, emergency stops — already
correctly used for this purpose in `carpenteryCriteria.ts`'s `CAR-04-02` and
`marbleCriteria.ts`'s equivalent) or **Loi 88-07 art. 10** (general PPE — already correctly
used in `baseGeneralCriteria.ts`'s `BGN-09-02`), matching whichever subject the specific
criterion actually covers. **Leave every medical-exam citation untouched** — those are the
correct uses of 93-120 (10 confirmed instances across `abattoirCriteria.ts`,
`bakeryCriteria.ts`, `uabCriteria.ts`, and others).

**Verification after Phase 6:** `grep -rn "93-120" src/criteria/*.ts` should return only
medical-exam criteria. Cross-check each remaining hit's `criteria` field text contains
"فحص طبي" / "الطب المهني" / equivalent — if any remaining hit is *not* about medical
exams, it was missed and needs the same treatment.

---

## Phase 7 — ⛔ SUPERSEDED, do not apply — mechanic checklist expansion (G8)

**Confirmed live: `mechanicCriteria.ts` already has `MCH-29-08`, `MCH-29-09`, and
`MCH-29-10`** (brake fluid, tyre waste, lead-acid battery — the same three gaps this
phase originally targeted), added independently with different but equally reasonable
content. **Applying the draft below would create duplicate/colliding IDs — do not apply
it.** Left in place only as a record of what was originally proposed, for comparison if
anyone wants to review whether the live version or this draft is the better wording.

<details>
<summary>Original draft (do not apply — kept for reference only)</summary>

**Change type: ADD**, appended to the array in `src/criteria/mechanicCriteria.ts`, after
`MCH-29-07`.

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
    criteria: 'تخزين البطاريات المستعملة (رصاص-حمض) في مكان مخصص، على أرضية غير منفذة أو في حاوية مانعة للتسرب، بعيداً عن أي احتمال تلامس مع مياه الأمطار أو الصرف؛ عدم فتح أو إفراغ البطاريات داخل الورشة؛ التسليم لمتعامل معتمد لجمع النفايات الخاصة الخطرة.',
    legalReference: 'القانون 01-19 المتعلق بتسيير النفايات (تصنيف النفايات الخاصة الخطرة) + المرسوم التنفيذي 05-315 (وجوب التعامل مع متعاملين معتمدين). ملاحظة: لم يتم تحديد مرسوم خاص برموز تصنيف بطاريات الرصاص-الحمض ضمن المرسوم 06-104 في هذا البحث — يوصى بالتحقق من الرمز الدقيق ضمن قائمة النفايات قبل الاعتماد النهائي.',
    severity: 'high',
    controlType: 'visual',
    complianceStatus: 'not-evaluated',
  },
```

</details>

---

## Phase 8 — G18, Décret 06-141 mis-cited for air emissions — CONFIRMED, and wider than first scoped (6 instances, 3 files)

**Fully re-verified live.** `paintShopCriteria.ts`'s `PNT-02-03` and
`printingCriteria.ts`'s `PRT-02-03` do cite Décret 06-141 for VOC air emissions, as
originally found. **But `PNT-02-01`, `PNT-02-02`, `PRT-02-01`, and `PRT-02-02` also cite
06-141 for the same subject** — 4 additional instances not caught in the first pass,
bringing the confirmed total to 6 across 3 files (the 2 paint-shop, 2 printing, plus
`blacksmithCriteria.ts`'s `BLS-04-07`, already covered).

**Décret 06-141 is the wastewater/liquid-discharge decree** — confirmed at length in the
legal manual's Chapter 1 ("Sets the maximum permissible values for industrial *liquid*
discharge") and this manuscript's Chapter 4 §4.1. The correct instrument, already used
correctly for this exact purpose elsewhere in this same codebase (`carpenteryCriteria.ts`'s
`CAR-05-02`, `marbleCriteria.ts`'s `MRB-05-05`), is **Décret 06-138**.

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

**`BLS-04-07` (blacksmith)** — same fix, see Phase 9.2 for the exact diff (kept there
since it's grouped with the other confirmed-live blacksmith fixes).

**Also worth doing while touching these (optional):** none of the 6 states a numeric VOC
threshold or uses `numericField` — recommend a Research Task (per Chapter 6 R-numbering)
for an actual concentration ceiling rather than inventing one here.

---

## Phase 9 — 🔴 URGENT: revert two "corrections" that landed backwards

**Source: `CHECKLIST_PROFESSIONAL_ROADMAP.md`, fetched live from
`belabedmohamedins-tech/SafeInspect-APP` on GitHub.** This file shows active,
substantial work has landed since Phases 0–8 above were drafted — most of it genuinely
closes real gaps from the manuscript (see the status matrix below). **Two specific
entries, however, assert a citation is "✅ CORRECT" when the manuscript's own source
material — the legal manual this roadmap explicitly claims to be grounded in — says the
opposite.** Both need reverting before more work builds on top of them.

### 9.1 Décret 93-120 does not contain an "Art. 9" noise limit — this needs to come back out

The roadmap's Phase 10 and "Known Correct Citations" table assert:
*"Workplace noise limit (85 dB) → Décret 93-120 Art. 9 ✅ CORRECT USE"* and instruct
`BLS-04-06` be left unchanged.

The legal manual's Occupational Health chapter — cited by the roadmap itself as a
grounding source — states, verbatim: *"Occupational noise-exposure limit — [research gap,
not confirmed [SILENCE]]... neither source contained a specific dB(A) ceiling, and both
explicitly defer the numeric standard to an unnamed separate regulatory text."* Its front
matter goes further: *"Occupational Health will need to... explicitly document the
noise-limit [SILENCE] rather than dress up 85 dB(A) as Algerian law."* No article-level
content of Décret 93-120 was ever retrieved in any research session beyond its
title-level subject (organization of occupational medicine). **"Art. 9" is a level of
specificity the underlying research never established — this reads as fabricated
precision, not a verified correction, and should not have been marked "do not change."**

**Action:** revert `BLS-04-06`'s citation to the interim form from Phase 6.1 of this
document (85 dB presented as an international reference, not a specific Algerian decree
article), or — better — treat this as **Research Task R1/R6 still open**, not closed.
Whoever is prompting Perplexity should be told explicitly: *do not accept a specific
article number as a "correction" unless it's paired with the actual source text that
contains it* — the pattern here (a plausible-sounding article number with no retrievable
source) is exactly the failure mode this whole project has been fighting since Session 1.

### 9.2 Décret 06-141 still does not govern VOC/air emissions — confirmed again, not resolved

The roadmap's "Known Correct Citations" table asserts: *"Décret 06-141 | VOC emission
limits (printing, paint, blacksmith) ✅."* This is G18 from Phase 8 of this document,
written into the roadmap as settled fact in the wrong direction. The legal manual's
Chapter 1 — the most extensively researched chapter in the whole manual, specifically on
this decree — gives 06-141's full parameter table: flow, temperature, pH, suspended
solids, BOD5, COD, aluminum, phenol, oils/greases, cadmium, copper, lead, chromium,
nickel, zinc, iron, cobalt. **Every parameter is a liquid-discharge parameter. None is an
airborne concentration.** Décret 06-138 — already correctly cited for this exact purpose
in this same codebase (carpentry, marble, and — per the roadmap's own Phase 7 — the very
`PRT-02-03`/`PNT-02-03`/`BLS-04-07` criteria this table is describing) — is the correct
instrument.

**Action:** revert `PRT-02-03`, `PNT-02-03`, and `BLS-04-07`'s legal references from
06-141 back to 06-138, per the diffs already drafted in Phase 8 above. **These diffs are
still valid and should be applied — the roadmap did not actually fix this, it relabeled
the error as correct.**

### 9.3 Lower-confidence, flag for a light check: Décret 76-35's dual scope

The roadmap resolves Research Task R5 by asserting Décret 76-35 covers "generic
compressed-gas storage" specifically for `CGS-01-xx` (blacksmith/welding). This may well
be right — but `baseGeneralCriteria.ts`'s `BGN-08-03` (electrical safety) also cited
76-35 as of the last verified snapshot, and the roadmap doesn't address that second use at
all. Not asserted as wrong here (unlike 9.1/9.2, this manuscript never independently
verified 76-35 either way) — just flagged as a loose end the roadmap's "resolved" framing
glossed over. Worth a `grep -rn "76-35" src/criteria/*.ts` and a quick sanity check that
both uses are legitimate before trusting it fully.

---

## Phase 10 — Status matrix: CONFIRMED against live files (superseded the earlier speculative version)

Everything below was fetched directly from `belabedmohamedins-tech/SafeInspect-APP` on
GitHub and read in full — no longer "per roadmap self-report." Nine files checked:
`types.ts`, `criteriaData.ts`, `mechanicCriteria.ts`, `blacksmithCriteria.ts`,
`printingCriteria.ts`, `paintShopCriteria.ts`, `uabCriteria.ts`, `capFactory.ts`,
`InspectionRepository.ts`.

| Gap | Confirmed status |
|---|---|
| G1 (facility mapping) | **✅ Fully fixed.** All 5 previously-broken activity strings now map correctly (added as new alias entries rather than replacing the old dead keys — 11 dead keys remain, harmless, cosmetic-only cleanup left). One design difference from this document's Phase 1: medium-throughput slaughter now routes to `slaughterhouseSmallChecklist`, not `abattoirChecklist` as recommended — a legitimate alternate call, not a bug. |
| G2 (93-120 sweep) | **Partially fixed, confirmed inconsistent.** Machine-guarding, PPE, and chemical-storage citations in `printingCriteria.ts` (`PRT-03-03`, `PRT-05-01`, `PRT-05-02`) are correctly fixed with explicit "why" comments. The same fix was **not** applied to `paintShopCriteria.ts`'s `PNT-04-01` (still plain `93-120` for PPE) or to any noise-limit citation anywhere (`BLS-04-06`, `UAB-AX7-07` both still cite 93-120 for the 85 dB figure). |
| G3 (4 remaining license merges) | Not re-verified this pass — still genuinely unknown, budget went to higher-confidence items. |
| G4 (GPL↔CGS) | Confirmed via roadmap text only (not re-fetched) — a documented decision not to merge, not a silent gap. Low priority to re-verify. |
| G5 (paint/print emissions) | **✅ Confirmed added** — `PNT-02-03`/`PRT-02-03` exist with real VOC-measurement criteria. Citation is wrong (see G18 below). |
| G6 (carpentry/marble numericField) | Not re-fetched this pass — presumed still open per the roadmap's silence on it. |
| G7 / G16 (numericField schema) | **Confirmed 3 of 4 fixed**, 1 of 4 still broken: `BFD-04-01`/`BFD-04-02` and `BLS-04-06` now correctly use `labelAr`/`warningMax`/`step`/`upperLimit`. **`uabCriteria.ts`'s `UAB-AX7-07` still uses the old broken shape** (`label`/`threshold`/`comparisonOperator`) — confirmed unchanged, verbatim match to the original error. |
| G8 (mechanic expansion) | **✅ Confirmed done**, independently — `MCH-29-08/09/10` (brake fluid, tyres, lead-acid battery) exist with different but equally reasonable content than this document's Phase 7 draft. **Do not apply Phase 7 above — it would collide with these existing IDs.** |
| G13 (sync path mismatch) | Not re-checked this pass (would need `SyncService.ts` + `server/src/routes/sync.ts` refetched) — presumed still open, nothing in any confirmed file suggests otherwise. |
| G14 (peer-dep version) | Not re-checked — presumed still open (cosmetic/setup-only, low priority). |
| **G15 (`Category` type/value drift)** | **🔴 Confirmed completely unaddressed.** `types.ts`'s `Category` type is byte-for-byte unchanged: still `'تنظيمية' \| 'بيئية' \| 'صحيه' \| 'سلامة' \| 'نظافة' \| 'عامة'`. Meanwhile `uabCriteria.ts` (re-confirmed live) still uses `'صحية'` on `UAB-AX7-01`, `-02`, `-07`. This is despite substantial, well-designed feature work landing in the same file since the original snapshot (sanction tiers, root-cause classification, meeting gates, differential-view scaffolding, escalation-override reasons) — none of which touched this. **This remains the single highest-confidence, highest-volume, completely unaddressed bug in the whole project.** |
| **G17a (`AuditLogRepository.append()` signature)** | **🔴 Confirmed completely unaddressed.** `InspectionRepository.ts`, re-fetched live, still calls the old object-argument form in all 3 locations (`save`, `delete`, `deleteMany`), unchanged from the version that produced the original `tsc` errors. |
| **G17b (`CorrectiveAction.severity`/`'critical'`)** | **🔴 Confirmed completely unaddressed.** `capFactory.ts`, re-fetched live, still assigns `'critical'` to `CorrectiveAction['severity']`, and `types.ts`'s `CorrectiveAction` interface still declares `severity: Severity` with no `'critical'` member. Still a real `tsc` error. |
| **G17c — `createCapItemsFromInspection` is dead code; CAP auto-creation does not work** | **🔴 Confirmed, and confirmed more serious than originally scoped.** `InspectionRepository.ts`'s `save()` still calls `CorrectiveActionRepository.createFromInspection(toSave)` — a method that has never existed on `CorrectiveActionRepository`. A repo-wide `search_code` for `createCapItemsFromInspection` (the function that actually does this job, in `capFactory.ts`) returns **zero results outside its own definition** — it is called from nowhere. **This means no CAP item has ever been auto-created by this app, for any inspection, despite the feature being fully implemented and specifically documented as wired into the save flow** (`capFactory.ts`'s own header comment: *"Called by checklist.tsx immediately after the inspection is saved as 'completed'"* — it isn't). This is the single most consequential confirmed finding of this whole verification pass — a core workflow feature that appears complete and shouldn't be, silently. |
| G18 (06-141 for VOC) | **🔴 Confirmed, and confirmed wider than Phase 8 originally scoped.** Not just `PRT-02-03`/`PNT-02-03` — **`PRT-02-01`, `PRT-02-02`, `PNT-02-01`, and `PNT-02-02` all also cite 06-141** for VOC/air-emission content, 5 total instances beyond the 1 in `BLS-04-07` already covered = **6 total confirmed instances across 3 files.** Phase 9.2's fix needs to be applied to all 6, not the 3 originally listed. |
| New: Décret 22-167 mis-cited for equipment maintenance | `uabCriteria.ts`'s `UAB-AX6-01` cites Décret 22-167 for "صيانة التجهيزات الصناعية" (industrial equipment maintenance). Per the legal manual's Chapter 6 research, Décret 22-167 is specifically the **19 April 2022 amendment to Décret 06-198** (classified-establishment licensing) — not a standalone equipment-maintenance instrument. **Lower confidence than G2/G18** (not independently re-verified against 22-167's actual full text, only against what the manual's dedicated research session concluded about its subject) — flag as a **Research Task (R7)**, not an auto-apply fix. |



## Testing checklist

- [ ] `npm install` (no flag) succeeds after Phase 0.
- [ ] `npx tsc --noEmit` — `src/` error count drops from 110 to 0. (`server/` and
      `__tests__/` were out of scope for this spec; re-run this manuscript's isolation
      command — `grep "error TS" | grep -v "^server/" | grep -v "__tests__/"` — to confirm.)
- [ ] Re-run the Phase 1 Python verification script — both lists empty.
- [ ] Complete a mock inspection with ≥1 non-compliant item on a device/simulator build;
      confirm a CAP entry is auto-created (Phase 4.2 — this may have been silently broken
      before this fix).
- [ ] Spot-check 2–3 cold-chain and 2 noise criteria in the running app's checklist UI to
      confirm the `numericField` min/max/warning rendering still displays correctly after
      Phase 3 (confirm the renderer component reads the new shape — see the note at the
      end of Phase 3).
- [ ] `grep -rn "93-120" src/criteria/*.ts` returns only medical-exam criteria.
- [ ] `grep -rn "06-141" src/criteria/paintShopCriteria.ts src/criteria/printingCriteria.ts`
      returns nothing (Phase 8) — 06-141 has no legitimate use in either file.
- [ ] New `MCH-29-08/09/10` IDs render correctly in the mechanic checklist screen and
      don't collide with anything else in `mechanicChecklist`.
- [ ] Existing Jest suite (`__tests__/`) — expect some currently-passing tests to start
      failing if they assert the old `AuditLogRepository.append()` call signature or the
      old `numericField` shape; update test fixtures to match, per this spec, don't revert
      the fix to make old tests pass.
- [ ] If Phase 5 is applied: manually exercise `POST /sync` against a locally-run
      `server/` instance from a dev build of the app.

---

*This spec still does not cover G9–G11 (verification-only tasks with no code change
implied), G6's leftover carpentry/marble `numericField` gap (covered in Phase 3's sibling
note, not repeated here), or G12 (SQLite migration — a dedicated project, not a diff).
G5, G8, and G18 are now covered by Phases 7–8 above. See `RAQIB_MASTER_MANUSCRIPT.md`
Chapter 7 for anything still open.*
