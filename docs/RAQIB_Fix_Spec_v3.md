> ⛔ **SUPERSEDED — DO NOT USE**
> All phases in this document (A through F) have been confirmed **fully closed** via live code reads.
> **Single source of truth: `docs/STRATEGIC_PLAN.md`** — see Z12 for all remaining open items.
>
> | v3 Phase | Closed by | Date |
> |---|---|---|
> | Phase A — 5 air emissions criteria | Phase Y (confirmed already present) | 2026-08-06 |
> | Phase B — UAB-AX7-07 noise citation | Phase Z2 (confirmed already fixed) | 2026-08-06 |
> | Phase C — UAB-AX6-01 Décret 22-167 | Phase Z (confirmed already fixed) | 2026-08-06 |
> | Phase D — 3 duplicate license criteria | Phase Z3 (confirmed NOT duplicates) | 2026-08-06 |
> | Phase E — PRD-02-01 missing numericField | Phase Z4 (already split PRD-02-01 + b) | 2026-08-06 |
> | Phase F — G9/G10/G11/G12 | G9→Z6 DEFERRED, G10→Z7 closed, G11→Z8 DEFERRED, G12→Z5+Z10 closed | 2026-08-06 |
>
> Kept for historical reference only. Last verified: 2026-08-06 by Perplexity.

---

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

## Phase A — *(CLOSED — Phase Y, 2026-08-06)*

All 5 air emissions criteria (PNT-07-xx, MRB-07-xx, CRP-07-xx, PRT-07-xx, BSM-07-xx) confirmed already present in code via live read. No implementation needed.

---

## Phase B — *(CLOSED — Phase Z2, 2026-08-06)*

`UAB-AX7-07` noise citation already fixed — [INTL] flag applied. Confirmed by live read.

---

## Phase C — *(CLOSED — Phase Z, 2026-08-06)*

`UAB-AX6-01` Décret 22-167 mis-citation already corrected. Confirmed by live read.

---

## Phase D — *(CLOSED — Phase Z3, 2026-08-06)*

`BAK-10-01`, `CLD-17-01`, `PRD-01-01` confirmed NOT duplicates of BGN-01-01 — each carries distinct regulatory content. No change needed.

---

## Phase E — *(CLOSED — Phase Z4, 2026-08-06)*

`PRD-02-01` already split into `PRD-02-01` + `PRD-02-01b`. Confirmed by live read.

---

## Phase F — G9/G10/G11/G12

- **G9** (Décret 09-19 rollout) → 🔵 DEFERRED as Z6 in STRATEGIC_PLAN.md
- **G10** (facilityCategoriesFull.json) → ✅ CLOSED by Z7 + Z11 — file confirmed correct, wired into UI
- **G11** (BGN-03-06 septic pumping source) → 🔵 DEFERRED as Z8 in STRATEGIC_PLAN.md
- **G12** (AsyncStorage → SQLite migration) → ✅ CLOSED by Z5 + Z10 — all repositories on SQLite, AsyncStorage fallback intentionally retained as field-upgrade tool

---

## What's now closed — confirmed, not requiring any further action

For completeness: G1, G2, G5, G6, G8, G13, G14, G15, G16, G17a, G17b, G17c/G-CAP, G18 — all closed. See `RAQIB_MASTER_MANUSCRIPT.md` Chapter 5 §5.7.
