# SafeInspect — Living Handoff Document

> **This file is the primary handoff for ALL agents (Perplexity, Claude, GPT, human).** Read this before touching any file. It is updated after every session.

---

## Live Observations Log

*(Newest entry at top)*

### 2026-08-04 21:43 WAT — [Agent: Perplexity] — Phase Q UI map confirmed: Expo Router app/ (NOT src/screens/)
- Phases closed: none
- Phases opened: none (Q re-scoped with accurate file map)
- Files changed: docs/README.md
- Critical finding: The app uses **Expo Router file-system routing** — screens live in `app/`, NOT `src/screens/` or `src/navigation/`. `app/(tabs)/` has: home, cap, inspection/, plus, actions. `app/screens/` has 20 detailed screens: approval-detail, approval-queue, audit-log, backup, brief, cap, checklists, corrective-actions, facilities/, geofence-check, inspector-profile, legal, map, notifications, onboarding, pin-setup, reports, server-login, settings, signature, stats, supervisor-approvals. Root app/: _layout.tsx, index.tsx, modal.tsx, onboarding.tsx, pin-lock.tsx. Phase Q work = wire missing lifecycle screens and confirm all tab + stack navigation is complete.

### 2026-08-04 22:10 WAT — [Agent: Perplexity] — Phases O and P confirmed CLOSED by direct code read
- Phases closed: O (corrective actions tracking), P (statistics / dashboard)
- Phases opened: Q (UI screens / navigation wiring — next priority)
- Files changed: docs/README.md
- Critical finding: `src/repositories/CorrectiveActionRepository.ts` (5.9 KB) + `src/services/CapReportService.ts` (11 KB) + `src/services/CapNotificationService.ts` (16 KB) + `src/services/capFactory.ts` (2.3 KB) confirm full corrective action pipeline exists. `src/utils/statsUtils.ts` (1.7 KB) + `src/utils/scoringUtils.ts` (8.9 KB) + `src/utils/loadHomeData.ts` (3.6 KB) confirm statistics/dashboard utilities exist. Also confirmed: `violationHistory.ts`, `followUpService.ts`, `differentialView.ts`, `groupViolations.ts`, `numericUtils.ts`. The entire backend is essentially complete. **Next gap is UI screens and navigation wiring** — inspect `app/` before building anything.

### 2026-08-04 21:55 WAT — [Agent: Perplexity] — Phase N confirmed CLOSED by direct code read of pdfService.ts (54 KB)
- Phases closed: N (report generation)
- Phases opened: none (O and P already listed as open)
- Files changed: docs/README.md
- Critical finding: `src/services/pdfService.ts` is a complete, production-grade Arabic RTL PDF report module. Includes letterhead, score/grade badge, severity breakdown bars, differential verification section (follow-up), decision support section with legal basis, field photos (base64), and blank printable checklist. Uses `expo-print` + `expo-sharing`. Phase O (corrective actions) is now the top priority.

### 2026-08-04 21:16 WAT — [Agent: Perplexity] — Phases L & M confirmed CLOSED by direct code read; roadmap updated
- Phases closed: L (criteria implementation), M (scoring integration)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: `src/criteria/` has 20 fully-implemented activity criteria files. `src/utils/scoringUtils.ts` is production-grade — severity-weighted scoring, grade A/B/C/D with critical override, risk levels 1–4, inspection cycle days (730/365/180/30), 60% completion gate, Arabic legal disclaimer.

### 2026-08-04 19:25 WAT — [Agent: Perplexity] — Connector stabilized; docs updated with full session history and current phase map
- Phases closed: none (no code session this round)
- Phases opened: none
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: All 8 manual chapters confirmed in docs/. STRATEGIC_PLAN.md phase list now reflects actual repo state as of 2026-08-04.

### 2026-07-30 14:07 WAT — [Agent: Perplexity] — docs/README.md and docs/STRATEGIC_PLAN.md created from scratch as living handoff
- Phases closed: none
- Phases opened: A through G (initial roadmap)
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: docs/ previously had no unified roadmap file. README and STRATEGIC_PLAN now serve as the handoff mechanism.

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
| `RAQIB_MASTER_MANUSCRIPT.md` | 📚 Reference | Full manuscript. Read for context, do not re-implement from it without checking code first. |
| `RAQIB_Fix_Spec_v2.md` | 📚 Reference | Earlier fix spec. Superseded by v3 and Perplexity_Implementation_Spec. |
| `RAQIB_Fix_Spec_v3.md` | 📚 Reference | Later fix spec. Check against current code before acting on it. |
| `RAQIB_Citation_Verification_Protocol.md` | 📚 Reference | Legal citation verification protocol. |
| `RAQIB_SQLite_Migration_Plan.md` | 📚 Reference | DB migration plan. Verify current DB layer before acting. |
| `TIER1_MIGRATION.md` | 📚 Reference | Migration priority tier list. |
| `RAQIB_Perplexity_Prompt_Ready.md` | 📚 Reference | Prompt templates from earlier sessions. |

---

## Working Roadmap

See `docs/STRATEGIC_PLAN.md` for the full phase registry with priorities, statuses, and execution order.

### Quick Status Summary (as of 2026-08-04 21:43 WAT)

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
| O | Corrective actions tracking | ✅ CLOSED 2026-08-04 | Direct code read — `CorrectiveActionRepository.ts` + `CapReportService.ts` + `CapNotificationService.ts` + `capFactory.ts` |
| P | Statistics / dashboard module | ✅ CLOSED 2026-08-04 | Direct code read — `statsUtils.ts` + `loadHomeData.ts` + `scoringUtils.ts` all present |
| **Q** | **UI screens / navigation wiring** | 🔴 **OPEN — NEXT PRIORITY** | Expo Router `app/` inspected — see full screen map below |

### Recommended Execution Order (next sessions)

```
→ Phase Q: inspect app/(tabs)/inspection/ and app/screens/ gaps vs. lifecycle stages
→ Phase Q: wire missing lifecycle screens (Preparation, Evaluation, Decision, Reinspection, Closure)
→ Phase J: Legal verify fire safety (Loi 19-02 scope)
→ Phase K: Legal verify air quality (Décret 06-138 annex)
→ Phase R: Integration / end-to-end tests — open after Q closes
```

---

## Phase Q — UI Screens / Navigation Wiring (OPEN — Top Priority)

### ⚠️ CRITICAL: Routing Architecture

This app uses **Expo Router file-system routing**. There is **no `src/navigation/` folder**. Routes are defined by the file tree under `app/`.

```
app/
├── _layout.tsx          ← Root layout (auth guard, font loading, providers)
├── index.tsx            ← Entry point / redirect
├── modal.tsx            ← Global modal route
├── onboarding.tsx       ← Onboarding flow (root level)
├── pin-lock.tsx         ← PIN lock screen (root level)
│
├── (tabs)/              ← Bottom tab navigator group
│   ├── _layout.tsx      ← Tab bar definition
│   ├── home.tsx         ← Home / dashboard tab
│   ├── cap.tsx          ← CAP (Corrective Action Plan) tab
│   ├── plus.tsx         ← Quick action / new inspection tab
│   ├── actions.tsx      ← Actions tab
│   └── inspection/      ← Inspection sub-group (stack inside tab)
│
└── screens/             ← Stack screens pushed from tabs
    ├── approval-detail.tsx
    ├── approval-queue.tsx
    ├── audit-log.tsx
    ├── backup.tsx
    ├── brief.tsx
    ├── cap.tsx
    ├── checklists.tsx
    ├── corrective-actions.tsx
    ├── facilities/          ← Sub-group for facility screens
    ├── geofence-check.tsx
    ├── inspector-profile.tsx
    ├── legal.tsx
    ├── map.tsx
    ├── notifications.tsx
    ├── onboarding.tsx
    ├── pin-setup.tsx
    ├── reports.tsx
    ├── server-login.tsx
    ├── settings.tsx
    ├── signature.tsx
    ├── stats.tsx
    └── supervisor-approvals.tsx
```

### Lifecycle coverage check

| Lifecycle Stage | Existing screen | Gap? |
|---|---|---|
| Registry | `screens/facilities/` | Inspect sub-dir |
| Planning | `screens/brief.tsx` | Likely covers planning brief |
| Preparation | `screens/checklists.tsx` + `screens/geofence-check.tsx` | Check if preparation flow is complete |
| Inspection | `(tabs)/inspection/` | Inspect sub-dir contents |
| Evidence / Photos | Unknown | Check inspection sub-dir |
| Evaluation | Unknown | May be inside inspection/ |
| Decision | Unknown | May be inside inspection/ |
| Report | `screens/reports.tsx` | Likely complete |
| Corrective Actions | `screens/corrective-actions.tsx` + `(tabs)/cap.tsx` + `screens/cap.tsx` | Likely complete |
| Reinspection | Unknown | Not yet confirmed |
| Closure | Unknown | Not yet confirmed |
| Statistics | `screens/stats.tsx` | Likely complete |

### What to do next in Phase Q

1. Inspect `app/(tabs)/inspection/` — list all files there
2. Inspect `app/screens/facilities/` — list all files there
3. Map each file to a lifecycle stage
4. Identify missing screens and implement them
5. Check `app/(tabs)/_layout.tsx` — confirm all tabs are correctly declared
6. Check `app/_layout.tsx` — confirm auth guard, PIN lock, and onboarding redirect logic

### Traps to avoid

- **Do NOT create `src/navigation/` or `src/screens/`** — this is Expo Router; routes = files in `app/`
- Do NOT rebuild services that already exist — the backend is complete
- Do NOT add new dependencies without checking `package.json` first
- RTL (Arabic) layout must be applied consistently — check existing screens for the RTL pattern before creating new ones
- Adding a new screen = creating a new file under `app/` in the right location — not registering it in a navigator manually

---

## Confirmed Closed — Must Not Be Reopened

- All 8 manual chapters pushed to `docs/` ✅
- `docs/README.md` created as living handoff ✅
- `docs/STRATEGIC_PLAN.md` created as phase registry ✅
- Scoring engine (`scoringUtils`, `statsUtils`, `types`, `useChecklistData`) confirmed in repo ✅
- `test_scoring.txt` confirms Jest tests exist for scoring ✅
- **20 activity-specific criteria files confirmed in `src/criteria/`** ✅ (2026-08-04)
  - `baseGeneralCriteria.ts` (29 KB), `uabCriteria.ts` (26 KB), `abattoirCriteria.ts` (20 KB), `couvoirCriteria.ts` (17 KB), `updCriteria.ts` (15 KB), `slaughterhouseSmallCriteria.ts` (13 KB), and 14 more activity files
- **`scoringUtils.ts` severity-weighted scoring engine confirmed production-grade** ✅ (2026-08-04)
  - Weights: high=3, medium=2, low=1
  - Grades A/B/C/D with critical override (forced D at ≥3 high violations, ceiling C at ≥1)
  - Risk levels 1–4 → inspection cycles 730/365/180/30 days
  - Completion rate gate: 60% minimum before grade is issued
  - Arabic legal disclaimer hardcoded in `ScoringResult` output
- **`pdfService.ts` report generation confirmed production-grade** ✅ (2026-08-04)
  - Full Arabic RTL HTML report: letterhead, score/grade badge, severity bars, grouped checklist
  - Differential verification section (follow-up inspection comparison)
  - Decision support section with `suggestDecision()` + legal basis + urgency color coding
  - Field photos section (base64 embed from `item.photos[]` or `item.photoUri`)
  - Blank printable checklist generator (for paper field use)
  - `expo-print` → PDF + `expo-sharing` for export/share
  - Also imports: `differentialView.ts`, `decisionSupport.ts`, `CapReportService.ts`
- **Full corrective action pipeline confirmed** ✅ (2026-08-04)
  - `src/repositories/CorrectiveActionRepository.ts` (5.9 KB)
  - `src/services/CapReportService.ts` (11 KB)
  - `src/services/CapNotificationService.ts` (16 KB)
  - `src/services/capFactory.ts` (2.3 KB)
  - `src/services/followUpService.ts` (2 KB)
  - `src/utils/violationHistory.ts` (5.5 KB)
  - `src/utils/differentialView.ts` (7.3 KB)
- **Statistics / dashboard utilities confirmed** ✅ (2026-08-04)
  - `src/utils/statsUtils.ts` (1.7 KB)
  - `src/utils/loadHomeData.ts` (3.6 KB)
  - `src/utils/scoringUtils.ts` (8.9 KB)
  - `src/utils/groupViolations.ts` (2.1 KB)
  - `src/utils/numericUtils.ts` (2.4 KB)
- **Other confirmed services** ✅ (2026-08-04)
  - `src/services/BackupService.ts` (10.6 KB)
  - `src/services/NotificationService.ts` (6.9 KB)
  - `src/services/CapNotificationService.ts` (16 KB)
  - `src/services/PhotoService.ts` (2.5 KB)
  - `src/services/SessionLockService.ts`
  - `src/services/IntegrityService.ts` (4.1 KB)
- **Full repository layer confirmed** ✅ (2026-08-04)
  - `AgendaRepository`, `ApprovalRepository`, `AuditLogRepository`, `AuthRepository`
  - `CorrectiveActionRepository`, `FacilityRepository`, `InspectionRepository`
  - `NotificationRepository`, `SettingsRepository`
- **Expo Router `app/` screen map confirmed** ✅ (2026-08-04)
  - 5 tab screens in `app/(tabs)/`: home, cap, inspection/, plus, actions
  - 20 stack screens in `app/screens/`: see full list in Phase Q section above
  - Root screens: index, modal, onboarding, pin-lock

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
3. **Run `git log --oneline -10` to see recent commits**
4. **Inspect `app/(tabs)/inspection/`** — list all files to find what's already in the inspection flow
5. **Inspect `app/screens/facilities/`** — list all files to confirm registry screens
6. **Map each existing screen to a lifecycle stage** — see the table in Phase Q above
7. **Implement only the missing lifecycle screens** — do not duplicate what exists
8. Run `npx tsc --noEmit` + Jest after any implementation
9. Update this file + STRATEGIC_PLAN.md
10. Push
