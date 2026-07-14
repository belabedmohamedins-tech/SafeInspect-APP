# SafeInspect-APP — Session Handover

> Last updated: 2026-07-14
> Repo: `belabedmohamedins-tech/SafeInspect-APP`
> Stack: React Native + Expo, Jest + --experimental-vm-modules, TypeScript, AsyncStorage, EAS Build

---

## 🚫 CURRENT FOCUS — Checklist Rework (NOT Coverage)

> **Tests are deferred. Do NOT work on Jest coverage until ALL five phases of the checklist rework are complete.**
> Criteria files (`src/criteria/*.ts`) are actively being modified — tests written now will break on every rework commit.

**Full implementation spec:** [`Perplexity_Implementation_Spec.md`](./Perplexity_Implementation_Spec.md)
Read it before touching any `src/criteria/` file. Every change below traces back to it.

---

## 🏗️ Architecture in 30 seconds

```
src/
├── __mocks__/          L2 mocks — native modules → mock implementations
├── __tests__/          All test files (flat + components/ + repositories/ + utils/ subdirs)
├── components/         React Native UI components (5 files, historically 0% coverage)
├── criteria/           Inspection criteria data files (one per facility type, pure data)
├── repositories/       DB repository layer
├── services/           Business logic (pdfService, serverAuth, CapNotificationService…)
├── utils/              Pure utility functions
├── criteriaData.ts     Maps facility type → criteria array
├── facilitiesData.ts   Static facility list
└── types.ts            All shared TypeScript types
```

### 4-Layer Mock System
| Layer | File | Purpose |
|---|---|---|
| L1 | `jest.polyfill.js` | Global polyfills |
| L2 | `moduleNameMapper` in jest.config.js | Native modules → `__mocks__/` |
| L3 | `jest.setup.ts` | Behavioral overrides + console suppression |
| L4 | Individual test files | Domain-specific mocks only |

**Critical mapper order**: `expo-secure-store` and `expo-local-authentication` MUST appear before `expo-modules-core` — changing this order silently breaks `getItemAsync` across all auth tests.

---

## 📋 Checklist Rework — Phase Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Remove legacy duplicate blocks (abattoir, uab, couvrir, upd) | ✅ Done |
| Phase 2 | Correct 3 confirmed legal citations | ✅ Done |
| Phase 3 | Merge duplicated shared-module content (license dedup, pest control, food-safety near-duplicates) | ✅ Done |
| Phase 4 | Add new criteria for confirmed gaps | 🔴 In progress |
| Phase 5 | Typing/evidence-standard fixes | ⬜ Not started |

### Phase 3 — What was done
- Removed duplicate operating-license criteria from 12 files — `BGN-01-01` is now the single authoritative check
- Upgraded `BGN-07-02` with trap-map/intervention-log detail (absorbed from `COU-AX8-02`)
- Removed pest duplicates from: `abattoirCriteria`, `couvoirCriteria`, `updCriteria`, `bakeryCriteria`, `produceStorageCriteria`, `slaughterhouseSmallCriteria`
- Kept `UPD-AX8-03` (wild-bird exclusion) and `ABT-AX10-01` (abattoir biosecurity) — genuine content, not duplicates
- Removed food-safety near-duplicates: `CLD-17-02–05`, `BAK-10-07`, modified `BAK-10-08`

---

## 🔴 Phase 4 — Next Actions (in order)

All changes are in `src/criteria/`. Every item here is directly from `Perplexity_Implementation_Spec.md §6`.

### 4.1 Electrical safety — ADD `BGN-08-04` to `baseGeneralCriteria.ts`
```typescript
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

### 4.2 Fire alarm — ADD `BGN-08-05` to `baseGeneralCriteria.ts`
```typescript
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

### 4.3 Occupational noise — ADD `BGN-09-01` to `baseGeneralCriteria.ts`
```typescript
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

### 4.4 Machine guard — ADD `BLS-04-05` to `blacksmithCriteria.ts`
```typescript
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

### 4.5 UPD siting distance — ADD `UPD-AX2-03` to `updCriteria.ts`
> ⚠️ The bracketed distance placeholder requires legal verification before merging. Do not merge with placeholder in place.
```typescript
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

### 4.6 Anti-obstruction — ADD `BGN-01-03` to `baseGeneralCriteria.ts`, then REMOVE `UAB-AX8-02` from `uabCriteria.ts`
```typescript
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

### 4.7 Traceability — ADD `BFD-08-01` to `baseFoodCriteria.ts`, then REMOVE `CLD-17-07` and `PRD-05-02`
```typescript
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

### 4.8 HACCP extension — ADD to `abattoirCriteria.ts` (`ABT-AX9-01`), `slaughterhouseSmallCriteria.ts` (`SLH-06-01`), `coldRoomCriteria.ts` (`CLD-18-01`)
```typescript
// Adapt the id prefix per file
{
  id: 'ABT-AX9-01',
  axis: 'HACCP',
  category: 'تنظيمية',
  criteria: 'توفر خطة HACCP موثقة ومطبقة، تشمل تحديد نقاط التحكم الحرجة (CCP) وإجراءات المراقبة والتصحيح.',
  legalReference: 'المادة 4 من المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017.',
  severity: 'high',
  controlType: 'doc',
  complianceStatus: 'not-evaluated',
},
```

### 4.9 `BFD-05-01` citation precision — MODIFY in `baseFoodCriteria.ts`
```typescript
// BEFORE:
legalReference: 'المرسوم 17-140 + أدلة GHP/القرار الوزاري المشترك 2020 المتعلق بـ HACCP.',
// AFTER:
legalReference: 'المرسوم التنفيذي 17-140 المؤرخ في 27 مارس 2017 (المادة 4) + أدلة الممارسات الصحية الجيدة (GHP) المصادق عليها.',
```

---

## ⬜ Phase 5 — After Phase 4 is done

Single change in `uabCriteria.ts`:
```typescript
// UAB-AX7-04 — controlType: 'visual' → 'doc'
// (criterion requires documented maintenance — not a visual check)
```

---

## ✅ Phase 4 Verification (run after all adds/removes)

These are grep/build checks — NOT Jest tests:

```bash
# No TypeScript errors
npm run build

# Legacy series fully gone
grep -rn "id: '04-\|id: '01-\|id: '02-\|id: '03-'" \
  src/criteria/abattoirCriteria.ts src/criteria/uabCriteria.ts \
  src/criteria/couvoirCriteria.ts src/criteria/updCriteria.ts
# Expected: zero matches (except UPD-AX2-03)

# Bad citations fully gone
grep -rn "04-409\|09-410" src/criteria/*.ts
# Expected: zero matches

# No duplicate IDs
node -e "
const d = require('./src/criteriaData').criteriaData;
Object.entries(d).forEach(([k,v]) => {
  const ids = v.map(c => c.id);
  const uniq = [...new Set(ids)];
  if (ids.length !== uniq.length) console.log('DUPLICATE in', k);
});
"
```

---

## 📊 Coverage — PARKED until rework is done

> ⚠️ Do NOT start coverage work until Phase 5 is marked ✅.

Last known state: ~74% statements (target 95%). Regression from new July 2026 features shipped without tests.

### Priority order when coverage resumes

1. **`CapNotificationService`** — broken mock on `getStats`. Fix: add `CorrectiveActionRepository.getStats = jest.fn().mockResolvedValue({...})` in test `beforeEach`
2. **`serverAuth.ts`** — ~12% statements. Lines 23–205 uncovered. Read fully before writing.
3. **`CorrectiveActionRepository.ts` lines 135–210** — bulk ops / stats. Unblocks #1.
4. **`pdfService.ts` lines 751–1143** — `expo-print` already mocked at L2.
5. **`decisionSupport.ts`** — 55% statements, lines 104–164. Complex branches, read first.
6. **`src/components/`** — 0% coverage, needs React Testing Library. Check `package.json` before installing.

### Thresholds (do NOT lower)
| Metric | Target |
|---|---|
| Statements | 95% |
| Branches | 83% |
| Functions | 97% |
| Lines | 96% |

---

## ⚠️ Known Traps

- **`.env` is committed to git** — secrets are exposed. Do NOT add new secrets.
- **jest.config.js mapper order** — `expo-secure-store` and `expo-local-authentication` MUST come before `expo-modules-core`. Reordering silently breaks all auth tests.
- **AsyncStorage timing** — never call `__resetStore()` in `beforeEach` when storage is seeded in `beforeAll`.
- **Timezone-safe dates** — never hardcode expected date strings. Compute dynamically from the same `Date` object.
- **TESTING.md is stale** — claims "zero uncovered files". Ignore it. The coverage report is the truth.
- **Threshold trap** — thresholds are now failing (~74% statements). Do NOT lower them without user confirmation.

---

## 🗂️ Test File Inventory (for when coverage resumes)

| Test File | Source File | Notes |
|---|---|---|
| `CapNotificationService.test.ts` | `services/CapNotificationService.ts` | Mock bug on `getStats` |
| `CorrectiveActionRepository.test.ts` | `repositories/CorrectiveActionRepository.ts` | Lines 135–210 uncovered |
| `serverAuth.test.ts` | `services/serverAuth.ts` | Shallow — most of file uncovered |
| `pdfService.test.ts` | `services/pdfService.ts` | Lines 751–1143 missing |
| `decisionSupport.test.ts` | `utils/decisionSupport.ts` | 55% stmts, needs edge cases |
| `useChecklistData.test.ts` | `hooks/useChecklistData.ts` | 39KB — large |
| `loadHomeData.test.ts` | loadHomeData util | 13KB |
| `utils.test.ts` | multiple utils | 24KB |
| `BackupService.test.ts` | `services/BackupService.ts` | 18KB |
| `SyncService.test.ts` | `services/SyncService.ts` | 13KB |

---

## 📁 Criteria Files — Status

> ⚠️ Actively being reworked. Do NOT write tests for these files until all phases are complete.

`InspectionItem` type shape (current):
```ts
{
  id: string;
  axis: string;
  category: string;
  criteria: string;
  legalReference: string;
  severity: 'high' | 'medium' | 'low';
  controlType: 'doc' | 'visual' | 'measurement';
  complianceStatus: 'not-evaluated';
  numericField?: {
    labelAr: string;
    unit: string;
    min: number;
    max: number;
    warningMax?: number;
    step: number;
  };
}
```

---

## 🚀 Working Method

1. User gives short instruction
2. AI reads actual source file first — never assumes structure
3. AI pushes changes directly to repo via MCP tools
4. User runs `npm run build` or `npm run test:coverage` locally to verify
5. Confirm before moving to next file
6. Always on branch `main` unless user says otherwise

---

## 🔑 Key Commands

```bash
npm run build                                        # TypeScript check
npm run test:coverage                                # Full coverage run
npm run test:coverage -- --testPathPattern=CapNotif  # Single file
npm test                                             # All tests, no coverage
```
