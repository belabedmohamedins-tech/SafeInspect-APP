# Checklist Rework Roadmap

> 🔴 **Active work** — This is the current focus. Coverage tests come **after** this is done.

---

<!-- The spec file Perplexity_Implementation_Spec.md is the authoritative guide for this rework. Follow it. -->

## What Is This

Complete restructuring of the inspection criteria system:
- Deduplication of shared criteria (BGN base + facility-specific overrides)
- Removal of generic items restated from base (S9 dedup sessions)
- New axes and criteria additions per facility type
- Legal reference alignment

## Session Log

### S9 — Pest Control Dedup (completed)
- Removed pest duplicates from: `abattoirCriteria`, `couvoirCriteria`, `updCriteria`, `bakeryCriteria`, `produceStorageCriteria`, `slaughterhouseSmallCriteria`
- All pest control now covered by `BGN-07-01/02/04`
- ABT-AX10-01 (abattoir-specific biosecurity) kept — not a duplicate
- UPD-AX8-03 (wild bird exclusion) kept — genuine biosecurity, not generic pest

## Remaining Work

See `Perplexity_Implementation_Spec.md` for the full spec and remaining checklist items.

---

> ⏭️ After all checklist rework is confirmed complete, proceed to `COVERAGE_ROADMAP.md`.
