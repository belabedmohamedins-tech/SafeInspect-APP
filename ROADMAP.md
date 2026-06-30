# SafeInspect — Checklist Improvement Roadmap

This file is the single source of truth for the checklist improvement plan.
Update the status column as each phase is completed. **Do not skip phases — dependencies are strict.**

---

## Phase Status

| Phase | What | Why / Dependency | Status |
|-------|------|-----------------|--------|
| 1 | Data model & types | Everything else depends on `src/types.ts` + DB schema | ✅ Done |
| 2 | Repeat-violation detection | Highest legal impact — needs Phase 1 | ✅ Done |
| 3 | Differential follow-up view | Closes the biggest inspector gap — needs Phase 2 | ✅ Done |
| 4 | New statuses (`observation-only`, `unable-to-verify`) | Parallel with Phase 2 — already in type, needs UI wiring | ✅ Done |
| 5 | Gated opening & closing meetings | Parallel with Phase 2 — fields exist, gate enforcement needed | 🔲 Pending |
| 6 | Decision support / suggested next step | Needs Phase 2 repeat data to be accurate | 🔲 Pending |
| 7 | Numeric fields for quantitative criteria | Needs Phase 1.2 (`numericValue` / `numericUnit`) | ✅ Done (model) / 🔲 UI pending |
| 8 | Standalone non-conformity notice PDF | Needs Phase 5 (meeting gates must be enforced first) | 🔲 Pending |
| 9 | Dynamic risk score | Needs Phases 2 + 3 history | 🔲 Pending |
| 10 | Supervisor tools | Needs good data from Phases 8 + 9 | 🔲 Pending |
| 11 | UX polish & wizard flow | **Last — do not start before Phases 1–8 are done** | 🔲 Pending |

---

## Phase Details

### ✅ Phase 1 — Data Model & Types
- `src/types.ts`: `ComplianceStatus` (6 states), `InspectionItem`, `SavedInspection`
- All sub-fields: numeric evidence (1.2), repeat-violation flags (1.3), root-cause (1.4),
  sanction tier (1.5), inspection type (1.6), follow-up linkage (1.7),
  meeting gate flags (1.8), report sequence number (1.9)

### ✅ Phase 2 — Repeat-Violation Detection
- `isRepeatViolation` and `priorInspectionStatus` populated automatically when
  `inspectionType === 'follow-up'`
- Score penalty logic for repeat violations

### ✅ Phase 3 — Differential Follow-up View
- `src/services/differentialView.ts`: `buildDifferentialView()`
- `DifferentialBanner` + `DiffStatusIndicator` components
- Wired into `checklist.tsx` — shows per-item diff pip for follow-up inspections

### ✅ Phase 4 — New Statuses
- `observation-only` and `unable-to-verify` types defined in `ComplianceStatus`
- `unable-to-verify` auto-generates a follow-up task (type defined; task creation wired via `capFactory.ts`)
- CAP UI: `app/(tabs)/cap.tsx`, `app/cap/[id].tsx`, `src/services/capFactory.ts`

### 🔲 Phase 5 — Gated Opening & Closing Meetings
- Fields exist: `openingMeetingDone`, `closingMeetingDone` on `SavedInspection`
- **Still needed:**
  - Opening-meeting screen/modal before checklist can start
  - Gate check: block checklist start until `openingMeetingDone === true`
  - Closing-meeting confirmation before PDF can be generated
  - Gate check: block PDF export until `closingMeetingDone === true`

### 🔲 Phase 6 — Decision Support / Suggested Next Step
- `sanctionTier` per criterion already in `InspectionItem`
- `escalationOverrideReason` on `SavedInspection`
- **Still needed:**
  - UI panel suggesting sanction tier based on violation summary + repeat flags
  - Override flow: inspector must enter reason to deviate from suggestion
  - Décret 06-198 article reference display per criterion

### 🔲 Phase 7 — Numeric Fields UI (model done, UI pending)
- `numericValue` + `numericUnit` fields exist on `InspectionItem`
- **Still needed:**
  - Numeric input widget in `InspectionItem` component (shown when criterion is quantitative)
  - Unit picker (°C, mg/L, dB, ppm…)
  - Out-of-range auto-flag to `non-compliant`

### 🔲 Phase 8 — Standalone Non-Conformity Notice PDF
- `reportSequenceNumber` format: `COMMUNE-YEAR-NNNN`
- **Still needed:**
  - Sequence number generator at report finalisation
  - PDF template for non-conformity notice (separate from inspection report)
  - Enforce Phase 5 meeting gates before allowing PDF generation

### 🔲 Phase 9 — Dynamic Risk Score
- `score`, `grade`, `riskLevel`, `nextInspectionDays` fields exist
- **Still needed:**
  - Historical trend calculation using prior inspection scores
  - Risk score UI in facility detail and home dashboard
  - Recalculate on every completed inspection

### 🔲 Phase 10 — Supervisor Tools
- `ApprovalStatus`, `approvedBy`, `approvedAt`, `returnedReason`, `approvalNote` on `SavedInspection`
- **Still needed:**
  - Supervisor review screen (approve / return / escalate)
  - Push notification to inspector on approval decision
  - Escalated reports queue

### 🔲 Phase 11 — UX Polish & Wizard Flow
- **Do not start before Phases 1–8 are complete**
- Multi-step wizard for new inspection setup (facility → type → meeting gate → checklist)
- Animated transitions, skeleton loaders, empty states
- Offline-first sync indicators
- Accessibility audit (RTL, font scaling, touch targets)

---

## Last updated
2026-06-30 — Phases 1–4 complete. Next: Phase 5 (meeting gates).
