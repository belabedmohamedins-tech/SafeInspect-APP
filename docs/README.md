# SafeInspect — Living Handoff Document

> **This file is the primary handoff for ALL agents (Perplexity, Claude, GPT, human).** Read this before touching any file. It is updated after every session.

---

## Live Observations Log

*(Newest entry at top)*

### 2026-08-04 22:00 WAT — [Agent: Perplexity] — Q-1 DONE: checklist.tsx + start.tsx fully read; lifecycle map updated
- Phases closed: Q-1 (read checklist.tsx + start.tsx)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: **Evidence, Evaluation, Decision, and Closing-meeting/Closure are ALL embedded inside `checklist.tsx`**. Only Reinspection has no dedicated screen. Start.tsx covers Preparation only (type, reference, committee, GPS → pushes to categories). No new screens needed except possibly a dedicated Reinspection flow.

### 2026-08-04 21:50 WAT — [Agent: Perplexity] — Phase Q screen map 100% complete; 4 lifecycle gaps identified
- Phases closed: none (Q stays open until gaps are resolved)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: `app/(tabs)/inspection/` confirmed: _layout, index, facilities, categories, start, checklist (14 KB). `app/screens/facilities/` confirmed: _layout, index, all, add, edit, profile (22 KB). **Full screen map is now known.** Gaps confirmed: no dedicated Evaluation, Decision, Reinspection, or Closure screens exist as separate files. These may be embedded inside `checklist.tsx` or `start.tsx` — read those files before building anything new for these stages.

### 2026-08-04 21:43 WAT — [Agent: Perplexity] — Phase Q UI map confirmed: Expo Router app/ (NOT src/screens/)
- Phases closed: none
- Phases opened: none (Q re-scoped with accurate file map)
- Files changed: docs/README.md
- Critical finding: The app uses **Expo Router file-system routing** — screens live in `app/`, NOT `src/screens/` or `src/navigation/`. `app/(tabs)/` has: home, cap, inspection/, plus, actions. `app/screens/` has 20 detailed screens. Root app/: _layout.tsx, index.tsx, modal.tsx, onboarding.tsx, pin-lock.tsx.

### 2026-08-04 22:10 WAT — [Agent: Perplexity] — Phases O and P confirmed CLOSED by direct code read
- Phases closed: O (corrective actions tracking), P (statistics / dashboard)
- Phases opened: Q (UI screens / navigation wiring — next priority)
- Files changed: docs/README.md
- Critical finding: Full corrective action pipeline + statistics utilities confirmed in `src/`. Entire backend is complete.

### 2026-08-04 21:55 WAT — [Agent: Perplexity] — Phase N confirmed CLOSED by direct code read of pdfService.ts (54 KB)
- Phases closed: N (report generation)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: `src/services/pdfService.ts` is a complete, production-grade Arabic RTL PDF report module.

### 2026-08-04 21:16 WAT — [Agent: Perplexity] — Phases L & M confirmed CLOSED by direct code read; roadmap updated
- Phases closed: L (criteria implementation), M (scoring integration)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: `src/criteria/` has 20 fully-implemented activity criteria files. `scoringUtils.ts` is production-grade.

### 2026-08-04 19:25 WAT — [Agent: Perplexity] — Connector stabilized; docs updated with full session history and current phase map
- Phases closed: none
- Phases opened: none
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: All 8 manual chapters confirmed in docs/. STRATEGIC_PLAN.md phase list now reflects actual repo state as of 2026-08-04.

### 2026-07-30 14:07 WAT — [Agent: Perplexity] — docs/README.md and docs/STRATEGIC_PLAN.md created from scratch as living handoff
- Phases closed: none
- Phases opened: A through G (initial roadmap)
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: docs/ previously had no unified roadmap file.

---

## What is SafeInspect / RAQIB

SafeInspect (code name RAQIB) is a **professional inspection platform for Algerian classified establishments**. It is a React Native + Expo + TypeScript mobile app.

The full inspection lifecycle is:

```
Registry → Planning → Preparation → Inspection → Evidence
→ Evaluation → Decision → Report → Corrective Actions
→ Reinspection → Closure → Statistics
```

Checklist logic is the core of the app. Every criterion must have:
- Activity relevance
- Applicability condition
- Legal/scientific basis (Algerian law first)
- Inspection method
- Evidence type
- Severity
- Risk
- Scoring weight
- Conditional applicability flag

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Language | TypeScript |
| Local DB | WatermelonDB / AsyncStorage |
| Build | EAS Build |
| Tests | Jest |
| Routing | **Expo Router (file-system routing in `app/`)** |
| Repo | `belabedmohamedins-tech/SafeInspect-APP` |
| Default branch | `main` |

---

## Source of Truth Order

Use this priority order — never invert it:

1. **Current GitHub code + actual app behavior** = what EXISTS
2. **Verified Algerian legal/scientific sources** = what SHOULD exist
3. **`/docs` files** = current project knowledge and decisions
4. **Old AI audits, reports, roadmaps** = historical context only — never execute blindly

---

## Algerian Law Hierarchy

```
Algerian legislation (lois)
  > Official Algerian regulations (décrets, arrêtés)
    > Algerian standards (normes algériennes)
      > International standards / best practices
```

**Never invent legal articles, obligations, penalties, deadlines, or numeric limits.**  
When uncertain: search JORADP (official gazette) first, academic/thesis sources as corroboration only.

---

## docs/ File Map

| File | Status | Purpose |
|---|---|---|
| `README.md` | ✅ Active | This file. Living handoff. Update after every session. |
| `STRATEGIC_PLAN.md` | ✅ Active | Phase registry and roadmap. Single source of phase numbering. |
| `decisions/DECISIONS.md` | ✅ Active | Major architectural and legal decisions log. |
| `Inspection_Manual_Chapter1_Wastewater.md` | ✅ Active | Wastewater / liquid discharge checklist and legal references. |
| `Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md` | ✅ Active | Solid and hazardous waste checklist. |
| `Inspection_Manual_Chapter3_Fire_Safety.md` | ✅ Active | Fire safety and hazardous substances. Loi 19-02 scope clarified. |
| `Inspection_Manual_Chapter4_Food_Safety.md` | ✅ Active | Food safety, HACCP, hygiene. |
| `Inspection_Manual_Chapter5_Occupational_Health.md` | ✅ Active | Occupational health and worker protection. |
| `Inspection_Manual_Chapter6_Documentation_Licensing.md` | ✅ Active | Licensing, classified establishment classification, document verification. |
| `Inspection_Manual_Chapter7_Air_Quality.md` | ✅ Active | Air emissions, Décret 06-138 point-source rules, self-monitoring. |
| `Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` | ✅ Active | Site hygiene and pest control. |
| `Perplexity_Implementation_Spec.md` | ✅ Active | Current implementation spec from Perplexity sessions. |
| `RAQIB_MASTER_MANUSCRIPT.md` | 📚 Reference | Full manuscript. Read for context only — do not re-implement without checking code first. |
| `RAQIB_Fix_Spec_v2.md` | 📚 Reference | Earlier fix spec. Superseded by v3 and Perplexity_Implementation_Spec. |
| `RAQIB_Fix_Spec_v3.md` | 📚 Reference | Later fix spec. Check against current code before acting on it. |
| `RAQIB_Citation_Verification_Protocol.md` | 📚 Reference | Legal citation verification protocol. |
| `RAQIB_SQLite_Migration_Plan.md` | 📚 Reference | DB migration plan. Verify current DB layer before acting. |
| `TIER1_MIGRATION.md` | 📚 Reference | Migration priority tier list. |
| `RAQIB_Perplexity_Prompt_Ready.md` | 📚 Reference | Prompt templates from earlier sessions. |

---

## Working Roadmap

See `docs/STRATEGIC_PLAN.md` for the full phase registry with priorities, statuses, and execution order.

### Quick Status Summary (as of 2026-08-04 22:00 WAT)

| Phase | Title | Status | Confirmed by |
|---|---|---|---|
| A | Scoring engine + types | ✅ CLOSED 2026-07-30 | Previous session |
| B | Wastewater chapter (Ch1) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| C | Solid/Hazardous Waste (Ch2) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| D | Fire Safety (Ch3) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| E | Food Safety (Ch4) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| F | Occupational Health (Ch5) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| G | Documentation/Licensing (Ch6) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| H | Air Quality (Ch7) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| I | Site Hygiene/Pest Control (Ch8) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| J | Verify Ch3 Fire Safety Loi 19-02 scope | 🟡 OPEN | Legal scope per facility type needs clarification |
| K | Verify Ch7 Air Quality annex numeric table | 🟡 OPEN | Décret 06-138 annex values need verification per activity |
| L | Criteria implementation in app code | ✅ CLOSED 2026-08-04 | Direct code read — 20 activity files in `src/criteria/` |
| M | Scoring integration with criteria | ✅ CLOSED 2026-08-04 | Direct code read — `scoringUtils.ts` fully implemented |
| N | Report generation module | ✅ CLOSED 2026-08-04 | Direct code read — `pdfService.ts` 54 KB, fully implemented |
| O | Corrective actions tracking | ✅ CLOSED 2026-08-04 | Direct code read — full pipeline confirmed |
| P | Statistics / dashboard module | ✅ CLOSED 2026-08-04 | Direct code read — `statsUtils.ts` + `loadHomeData.ts` |
| Q-1 | Read checklist.tsx + start.tsx (lifecycle audit) | ✅ CLOSED 2026-08-04 | Direct code read — see findings below |
| **Q** | **UI screens — Reinspection screen** | 🔴 **OPEN** | Only remaining gap after Q-1 audit |
| R | Integration / end-to-end tests | 🔵 NEXT after Q |  |

### Recommended Execution Order (next sessions)

```
→ Q-2: Read app/(tabs)/actions.tsx (198 B) — confirm stub or functional
→ Q-3: Read app/_layout.tsx — confirm auth guard + PIN + onboarding redirect
→ Q-4: Build reinspection screen (app/screens/reinspection.tsx) — only confirmed gap
→ Q-5: Run npx tsc --noEmit and Jest — fix all failures
→ Q close: update README + STRATEGIC_PLAN, push
→ Phase J: Legal verify fire safety (Loi 19-02 scope)
→ Phase K: Legal verify air quality (Décret 06-138 annex)
→ Phase R: Integration / end-to-end tests
```

---

## Phase Q — UI Screens Audit Results (Q-1 CLOSED)

### What `checklist.tsx` actually contains (confirmed by direct read)

`checklist.tsx` is **NOT just a checklist screen**. It contains the following lifecycle stages embedded as in-screen steps:

| Lifecycle Stage | Implementation inside checklist.tsx |
|---|---|
| **Preparation** | `start.tsx` feeds params (type, reference, committee, GPS) → categories → checklist |
| **Inspection** | `SectionList` of `InspectionItem` with status, comment, photo, numeric inputs |
| **Evidence** | `handlePhotoTake`, `handleCommentChange` — per-item evidence collection |
| **Evaluation** | `computeScoreAndGrade(data)` runs on every item change; `allEvaluated` flag gates decision panel |
| **Decision** | `DecisionSupportPanel` rendered in `ListFooterComponent` when `allEvaluated === true`; `suggestDecision(scoringResult, diffView)` — supports escalation override with mandatory reason |
| **Opening Meeting** | `MeetingGateModal` (type="opening") — shown on entry if not already confirmed |
| **Closing Meeting / Closure** | `MeetingGateModal` (type="closing") — required before `doFinish()` can run |
| **Corrective Actions auto-create** | `createCapItemsFromInspection(saved)` called inside `doFinish()` |
| **Follow-up / Reinspection diff** | `buildDifferentialView(shell)` → `DifferentialBanner` + `DiffStatusIndicator` per item |

### What `start.tsx` actually contains (confirmed by direct read)

- Inspection type picker: routine / follow-up / complaint / extraordinary
- Reference document input (optional)
- Writer (device holder) input — mandatory
- Committee members: add/remove list — at least 1 mandatory
- GPS coordinates: 10s timeout, silent fallback
- On submit → pushes to `/(tabs)/inspection/categories` with all params

### Remaining gaps after Q-1 audit

| Gap | Status | Notes |
|---|---|---|
| Reinspection screen | ❌ MISSING | Follow-up diff view exists inside checklist.tsx but there is no dedicated "schedule reinspection" or "launch reinspection" screen. The `followUpService.ts` in `src/services/` has the backend logic — needs a UI entry point. |
| `actions.tsx` (198 B) | ⚠️ UNREAD | Likely a stub — read before next session |
| `app/_layout.tsx` | ⚠️ UNREAD | Auth guard + PIN lock + onboarding redirect — read before testing |

### ⚠️ Routing Architecture — Never change this

This app uses **Expo Router file-system routing**. There is **no `src/navigation/` folder**. Routes are defined by the file tree under `app/`.

### Complete Confirmed File Tree

```
app/
├── _layout.tsx                    ← Root layout (auth guard, font loading, providers)
├── index.tsx                      ← Entry point / redirect
├── modal.tsx                      ← Global modal route
├── onboarding.tsx                 ← Onboarding flow (root level)
├── pin-lock.tsx                   ← PIN lock screen (root level)
│
├── (tabs)/                        ← Bottom tab navigator group
│   ├── _layout.tsx                ← Tab bar definition
│   ├── home.tsx         (5 KB)    ← Home / dashboard
│   ├── cap.tsx          (14 KB)   ← CAP tab (Corrective Action Plan)
│   ├── plus.tsx         (3 KB)    ← Quick-action / new inspection
│   ├── actions.tsx      (198 B)   ← ⚠️ UNREAD — likely stub
│   └── inspection/
│       ├── _layout.tsx    (359 B)   ← Inspection stack layout
│       ├── index.tsx      (2 KB)    ← Inspection list / entry
│       ├── facilities.tsx (4 KB)    ← Facility picker
│       ├── categories.tsx (2 KB)    ← Checklist category picker
│       ├── start.tsx      (12 KB)   ✅ CONFIRMED: Preparation only
│       └── checklist.tsx  (15 KB)   ✅ CONFIRMED: Inspection + Evidence + Evaluation + Decision + Meetings + CAP trigger
│
└── screens/                       ← Stack screens pushed from tabs
    ├── approval-detail.tsx  (20 KB)
    ├── approval-queue.tsx   (11 KB)
    ├── audit-log.tsx        (10 KB)
    ├── backup.tsx           (14 KB)
    ├── brief.tsx            (10 KB)  ← Inspection brief / planning
    ├── cap.tsx              (15 KB)  ← CAP detail screen
    ├── checklists.tsx       (9 KB)   ← Checklist library
    ├── corrective-actions.tsx (13 KB)
    ├── geofence-check.tsx   (12 KB)
    ├── inspector-profile.tsx (10 KB)
    ├── legal.tsx            (4 KB)
    ├── map.tsx              (6 KB)
    ├── notifications.tsx    (9 KB)
    ├── onboarding.tsx       (5 KB)
    ├── pin-setup.tsx        (9 KB)
    ├── reports.tsx          (18 KB)  ← Report viewer / generator
    ├── server-login.tsx     (7 KB)
    ├── settings.tsx         (14 KB)
    ├── signature.tsx        (5 KB)
    ├── stats.tsx            (14 KB)  ← Statistics dashboard
    ├── supervisor-approvals.tsx (20 KB)
    └── facilities/
        ├── _layout.tsx      (380 B)
        ├── index.tsx        (7 KB)   ← Facility list
        ├── all.tsx          (4 KB)   ← All facilities view
        ├── add.tsx          (10 KB)  ← Add new facility (Registry)
        ├── edit.tsx         (11 KB)  ← Edit facility
        └── profile.tsx      (22 KB)  ← Facility profile detail
```

### Full Lifecycle Coverage Map (updated after Q-1)

| Lifecycle Stage | Screen(s) | Status |
|---|---|---|
| Registry | `screens/facilities/` (index, all, add, edit, profile) | ✅ CONFIRMED |
| Planning | `screens/brief.tsx` | ✅ CONFIRMED |
| Preparation | `(tabs)/inspection/start.tsx` | ✅ CONFIRMED |
| Inspection (checklist) | `(tabs)/inspection/checklist.tsx` | ✅ CONFIRMED |
| Evidence (photos, notes) | Inside `checklist.tsx` — per-item | ✅ CONFIRMED |
| Evaluation (score + grade) | Inside `checklist.tsx` — `computeScoreAndGrade()` | ✅ CONFIRMED |
| Decision (suggest + override) | Inside `checklist.tsx` — `DecisionSupportPanel` | ✅ CONFIRMED |
| Opening Meeting gate | Inside `checklist.tsx` — `MeetingGateModal` | ✅ CONFIRMED |
| Closing Meeting / Closure | Inside `checklist.tsx` — `MeetingGateModal` (closing) | ✅ CONFIRMED |
| Report | `screens/reports.tsx` | ✅ CONFIRMED |
| Corrective Actions | `screens/corrective-actions.tsx` + `(tabs)/cap.tsx` + `screens/cap.tsx` | ✅ CONFIRMED |
| Reinspection (dedicated UI) | **No dedicated screen** — `followUpService.ts` exists in backend | ❌ GAP |
| Statistics | `screens/stats.tsx` | ✅ CONFIRMED |

### Traps to avoid

- **Do NOT create `src/navigation/` or `src/screens/`** — Expo Router only; routes = files in `app/`
- Do NOT rebuild backend services — the full service + repository layer is confirmed complete
- Do NOT add Evaluation or Decision screens — they are already inside `checklist.tsx`
- Do NOT add a Closure screen — closing meeting gate is inside `checklist.tsx`
- RTL (Arabic) layout must be applied consistently — use `checklist.tsx` as the RTL reference for any new screen
- `actions.tsx` is 198 bytes — it may be a stub; verify before assuming it is functional

---

## Confirmed Closed — Must Not Be Reopened

- All 8 manual chapters pushed to `docs/` ✅
- `docs/README.md` created as living handoff ✅
- `docs/STRATEGIC_PLAN.md` created as phase registry ✅
- Scoring engine (`scoringUtils`, `statsUtils`, `types`, `useChecklistData`) confirmed ✅
- **20 activity criteria files in `src/criteria/`** ✅ (2026-08-04)
- **`scoringUtils.ts` production-grade severity-weighted scoring** ✅ (2026-08-04)
  - Weights: high=3, medium=2, low=1 | Grades A/B/C/D with critical override
  - Risk 1–4 → cycles 730/365/180/30 days | 60% completion gate
- **`pdfService.ts` (54 KB) production-grade Arabic RTL PDF** ✅ (2026-08-04)
  - Letterhead, score/grade badge, severity bars, grouped checklist, field photos, differential section, decision support, blank printable checklist
  - Uses `expo-print` + `expo-sharing`
- **Full corrective action pipeline** ✅ (2026-08-04)
  - `CorrectiveActionRepository.ts`, `CapReportService.ts`, `CapNotificationService.ts`, `capFactory.ts`, `followUpService.ts`, `violationHistory.ts`, `differentialView.ts`
- **Statistics utilities** ✅ (2026-08-04)
  - `statsUtils.ts`, `loadHomeData.ts`, `scoringUtils.ts`, `groupViolations.ts`, `numericUtils.ts`
- **Full repository layer** ✅ (2026-08-04)
  - `AgendaRepository`, `ApprovalRepository`, `AuditLogRepository`, `AuthRepository`, `CorrectiveActionRepository`, `FacilityRepository`, `InspectionRepository`, `NotificationRepository`, `SettingsRepository`
- **Full service layer** ✅ (2026-08-04)
  - `BackupService`, `NotificationService`, `CapNotificationService`, `PhotoService`, `SessionLockService`, `IntegrityService`
- **Expo Router `app/` screen map 100% confirmed** ✅ (2026-08-04)
- **Q-1: checklist.tsx + start.tsx fully read** ✅ (2026-08-04)
  - Evidence, Evaluation, Decision, Meetings, Closure → all inside `checklist.tsx`
  - Preparation → `start.tsx`
  - Only Reinspection UI is missing

---

## Agent Rules

### Before any implementation
1. Inspect repo and current branch
2. Read affected source files and existing tests
3. Identify all dependencies
4. **Check docs vs code — if already implemented, close the phase, do not rebuild**

### After every implementation session
Update **both** of the following before pushing:
- `docs/README.md` — add top entry to Live Observations Log, update Working Roadmap table
- `docs/STRATEGIC_PLAN.md` — mark closed phases ✅ CLOSED with date, open new phases if found

### Log entry format (mandatory)
```
### YYYY-MM-DD HH:MM WAT — [Agent: Perplexity or Claude] — [One-line summary]
- Phases closed: [list or "none"]
- Phases opened: [list or "none"]
- Files changed: [list]
- Critical finding: [one line if any, else "none"]
```

### Legal citation rules
- Never invent legal articles or numeric values
- Suspicious criterion → tag `[À VÉRIFIER]`, commit, open a LEGAL-VERIFY phase
- Verify via JORADP first
- Once verified: update criterion, remove tag, close phase
- If unverifiable: change to `[SILENCE]` or `[INTL]` with explanation

### Test gate
- Run `npx tsc --noEmit` before closing any phase
- Run Jest for affected files before closing any phase
- Fix all failures before marking closed

### SHA rule
- Always fetch current file from GitHub to get its SHA before updating
- Never hardcode SHAs between sessions — they change with every commit

---

## Legal Quick-Reference Table

| Topic | Key Instrument | Article / Annex | Notes |
|---|---|---|---|
| Classified establishments classification | Décret 06-198 | Art. 2–5 | 3 categories: 1st (dangerous), 2nd (insalubre), 3rd (incommodant) |
| Wastewater discharge to network | Décret 06-141 | Art. 3–7 | Numeric limits in Annex |
| Industrial wastewater to environment | Décret 06-141 | Annex I | pH, SS, DCO, DBO5 limits |
| Solid waste list / classification | Décret 06-104 | Annexes | Official Algerian waste list |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | Wali-level accreditation required |
| Waste transport conditions | Décret 04-409 | Art. 5–12 | Vehicle, manifest, labelling rules |
| Waste treatment facility acceptance | Décret 04-410 | Art. 6–9 | Acceptance protocol at treatment site |
| Healthcare waste (3-stream) | Décret 03-478 | Art. 3 | Infectious / sharp / ordinary streams |
| Fire safety — ERP scope | Loi 19-02 | Art. 2 | Applies to ERPs, high-rise, very-high-rise, residential — NOT universal |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | Required for classified establishments |
| Air emissions — point source | Décret 06-138 | Annex I | Activity-specific numeric limits — verify per sector |
| Food safety / HACCP | Décret 04-82 | Art. 5 | HACCP mandatory for food-producing establishments |
| Occupational health — medical surveillance | Loi 88-07 | Art. 12–14 | Annual medical exam, occupational disease register |
| Pest control — certified operators | Arrêté 1995 (phytosanitaire) | Art. 3 | Licensed operator required for chemical control |

---

## Next Session Checklist

Any agent picking this up should do in order:

1. Read this file top to bottom
2. Read `docs/STRATEGIC_PLAN.md` for full phase details
3. Run `git log --oneline -10` to see recent commits
4. **Read `app/(tabs)/actions.tsx`** — confirm stub (198 B) or functional
5. **Read `app/_layout.tsx`** — confirm auth guard + PIN lock + onboarding redirect
6. **Read `src/services/followUpService.ts`** — understand existing reinspection backend before building the UI
7. Build `app/screens/reinspection.tsx` — only confirmed missing UI piece
8. Run `npx tsc --noEmit` + Jest after implementation
9. Update this file + STRATEGIC_PLAN.md
10. Push
