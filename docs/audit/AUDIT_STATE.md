# SafeInspect Master Checklist & Inspection Logic Audit — State Document

**Purpose:** Track progress of the multi-session regulatory audit. This file is the single source of truth for what has been audited, what is pending, and what legal references remain unverified. Every session reads this file first and updates it before ending.

> **Note on this file's own history:** this document was briefly overwritten by a Perplexity
> session ("Session 8", 2026-08-08) that logged only its own `legal_refs/` cleanup work and did
> not carry forward the Claude-side findings from Sessions 1–7. Session 9 merged both histories.
> **`legal_refs/CLEANUP_LOG.md` is the authoritative source for `legal_refs/` file status** — it
> has lagged behind the actual folder contents more than once; confirm against the live folder
> listing before trusting it blindly.

**Status:** IN PROGRESS. `legal_refs/` now ~28 content files. Critical defect F1 confirmed. Two
major citation-error clusters found (Décret 91-05: F3; Loi 01-19: F4). F7 CLOSED (2026-08-17).
F8 CLOSED (2026-08-17) — scope confirmed + all phantom articles already patched in W43/W60.
**Last updated:** 2026-08-17 (Session 11)

---

## 1. Source-of-truth hierarchy

1. GitHub code (this repo, branch `main`) — what the app currently does.
2. `legal_refs/` — canonical legal-text folder. `docs/legal_sources/` was deleted 2026-08-09 —
   do not recreate it or look for sources there.
3. `docs/Inspection_Manual_Chapter1-8_*.md` — project's own methodology docs. Not yet
   cross-checked against criteria files.
4. `docs/SafeInspect_Audit_Consolidated_2026-08-06 (1).md`, `docs/STRATEGIC_PLAN.md` — prior
   AI/human audit work. Historical context only, not trusted as verified law.

---

## 2. Full scope inventory

### 2a. Criteria files — `src/criteria/` (17 activity-specific + 3 base)
| File | Size | Status |
|---|---|---|
| baseGeneralCriteria.ts | 31.7 KB | ✅ FULLY TRIAGED (Session 11) — all criteria checked and patched. BGN-08-03 confirmed correct (Décret 91-05 Art.17, W49). BGN-09-02 confirmed correct (Décret 02-427 = formation/information workers on occupational risks — exact match for EPI-training criterion). No open [À VÉRIFIER] remain. |
| baseFoodCriteria.ts | 10.7 KB | DONE — 12/12 criteria audited |
| baseCompressedGasCriteria.ts | 2.8 KB | NOT AUDITED |
| abattoirCriteria.ts | 20.4 KB | ✅ F7 CLOSED (Session 11) — Décret 06-141 Annexe II §1a read and confirmed. ABT-AX6-01/02/04 switched from Annexe I generic mg/L to Annexe II sector-specific g/t (F7-fix 2026-08-17). No open [À VÉRIFIER] remain in this file. |
| bakeryCriteria.ts | 8.6 KB | NOT AUDITED |
| blacksmithCriteria.ts | 7.3 KB | NOT AUDITED |
| carWashCriteria.ts | 10.1 KB | PARTIAL — read in full, swept for the Loi 01-19 citation-offset pattern (none found). Individual citations not otherwise verified. |
| carpenteryCriteria.ts | 6.0 KB | NOT AUDITED |
| coldRoomCriteria.ts | 7.6 KB | NOT AUDITED |
| couvoirCriteria.ts | 16.7 KB | NOT AUDITED |
| gplCriteria.ts | 11.9 KB | ✅ F8 CLOSED (Session 11) — scope confirmed by user: `تركيب GPL/C` = vehicle GPL/C conversion workshops. Décret 21-430/83-496 is therefore the **correct** instrument. All phantom article numbers (21-430 Art.5/6/10/15/16 — non-existent) were already eliminated in W43 (2026-08-?). GPL-05-01 Loi 03-10 range corrected Art.15–22 → Art.15–21 in W60 (2026-08-17). Remaining open: AIM GPL2 `[À VÉRIFIER — W51]` tag across GPL-02-01/02/03, GPL-03-01/02, GPL-04-01 — source not confirmed in JORADP (Scribd draft). |
| marbleCriteria.ts | 10.0 KB | NOT AUDITED |
| mechanicCriteria.ts | 6.2 KB | NOT AUDITED |
| paintShopCriteria.ts | 8.7 KB | PARTIAL — read in full, swept for Loi 01-19 pattern (none found). Leans heavily on Décret 06-138 (industrial air emissions) — NOT yet verified, no source file. Also cites Loi 04-08, Loi 88-07 — not yet verified. |
| printingCriteria.ts | 8.3 KB | NOT AUDITED |
| produceStorageCriteria.ts | 5.5 KB | NOT AUDITED |
| semiPharmaCriteria.ts | 7.6 KB | NOT AUDITED — note: Loi 18-11 (santé publique) now available in legal_refs/, likely relevant here |
| slaughterhouseSmallCriteria.ts | 12.9 KB | ✅ F7 CLOSED (Session 11) — SLH-05-04/04B/04C/04D switched to Décret 06-141 Annexe II §1a g/t values (F7-fix 2026-08-17). No open [À VÉRIFIER] remain. F6 (SLH-08-01 redundancy with BGN-10-01) still open — criterion present but flagged for removal. |
| uabCriteria.ts | 25.8 KB | NOT AUDITED |
| updCriteria.ts | 15.1 KB | NOT AUDITED |
| src/criteria/index.ts | 3.0 KB (aggregator) | AUDITED — see Finding F2 (dead-code hazard) |
| src/criteriaData.ts | 9.1 KB | AUDITED — applicability engine, see Finding F1 (critical defect) |

### 2b. Classification & facility data
| File | Size | Status |
|---|---|---|
| src/facilityCategoriesFull.json | 88.0 KB | AUDITED — verified high-fidelity transcription of Décret 07-144 nomenclature |
| src/facilityCategories.ts | 0.4 KB | AUDITED (consumed by add.tsx/edit.tsx) |
| src/facilitiesData.ts | 25.3 KB | AUDITED — static seed data, 26 legacy activity strings, no `rubrique` field |
| src/facilitiesService.ts | 5.9 KB | NOT AUDITED |
| src/repositories/FacilityRepository | — | NOT AUDITED directly (referenced by edit.tsx) |

### 2c. Core model / logic
| File | Status |
|---|---|
| src/types.ts (15.3 KB) | READ — see Session 1 notes |
| src/hooks/useChecklistData.ts | AUDITED — confirmed root cause of Finding F1 |
| app/screens/facilities/add.tsx | AUDITED — confirmed source of Finding F1 |
| app/screens/facilities/edit.tsx | AUDITED — confirmed same defect as add.tsx |
| scoringUtils.ts | NOT LOCATED yet |
| src/db/, src/repositories/, src/services/, src/stores/ | NOT AUDITED (except FacilityRepository indirectly) |

### 2d. Documentation (methodology, not code)
8 Inspection Manual chapters — NOT AUDITED. Should be cross-checked against criteria files.

### 2e. Deferred (lower priority per protocol)
`server/`, `components/`, `hooks/` (non-checklist), `scripts/`, `.github/`.

---

## 3. CRITICAL FINDINGS

### F1 — Activity/checklist mismatch (CRITICAL, confirmed, Sections 4 & 11)
**Every facility created or edited through the app's real UI silently receives the wrong checklist.**

`add.tsx` and `edit.tsx` both write `activity` as `"{rubrique} - {label} ({regime})"` (e.g.
`"2210 - ذبح الحيوانات (> 2 طن/يوم) (تصريح)"`), sourced from the full 07-144 nomenclature
(`facilityCategories.ts` / `facilityCategoriesFull.json`). `criteriaByActivity` in
`src/criteriaData.ts` does a **strict exact-string match** against 26 hardcoded keys in a
completely different plain-phrase format, inherited from static seed data
(`src/facilitiesData.ts`) that predates the current UI. `useChecklistData.ts` resolves with
`criteriaByActivity[p.activity] ? ... : criteriaByActivity.default` — no normalization, no
rubrique-based lookup, even though both `add.tsx` and `edit.tsx` already capture and persist
`rubrique` as its own field ("Z11" — a prior partial fix never wired into checklist selection).

**Effect:** any real-world facility silently gets `baseGeneralCriteria` only instead of its
correct activity-specific checklist — no warning to the inspector.

**Verdict: MODIFY (implementation, not this audit's scope).** Re-key `criteriaByActivity` by
`rubrique`; build coverage from `facilityCategoriesFull.json`; add a visible fallback warning.

**Evidence:** `app/screens/facilities/add.tsx`, `edit.tsx`, `src/hooks/useChecklistData.ts`,
`src/criteriaData.ts`.

### F2 — Dead-code hazard: `allCriteria` (Section 6, low severity, live risk)
`src/criteria/index.ts` exports `allCriteria`, a flat concatenation of every criterion with no
activity filtering. Confirmed unused by both real consumers (`checklists.tsx`,
`useChecklistData.ts`). Not live today, but one accidental import from bypassing all
applicability logic. Recommend deleting or clearly marking test-only.

### F3 — Décret 91-05 citation cluster (baseGeneralCriteria.ts) — ALL PATCHED
Verified full 68-article text. All 6 confirmed-wrong citations were corrected in W39 (2026-08-09)
and subsequent passes. Summary for the record:

| Criterion | Was wrong | Corrected to |
|---|---|---|
| BGN-02-05 (cleanable floors/walls) | Art. 14 | Art. 3–4 ✅ |
| BGN-02-07 (minimum lighting) | Art. 16 | Art. 13 ✅ |
| BGN-03-04 (drainage channel design) | Art. 14 | Art. 9 ✅ |
| BGN-03-05 (water-trap siphons) | Art. 14 | Art. 9 ✅ |
| BGN-04-03 (daily cleaning program) | Art. 7 | Art. 2–3 ✅ |
| BGN-07-04 (sealing cracks/pests) | Art. 14 | Art. 2–3 + [حكم مهني] ✅ |
| BGN-09-01 (noise limit) | Art. 9 | Art. 15 ✅ |

### F4 — Loi 01-19 citation-offset pattern — ALL PATCHED
Full 72-article text verified. All 4 wrong citations corrected:

| Criterion | Was wrong | Corrected to |
|---|---|---|
| BGN-04-06 (hazardous waste bordereau) | Art. 32 | Art. 19 ✅ (W40) |
| BGN-04-07 (self-incineration ban) | Art. 30 | Art. 15 + Art. 19 + Art. 63 + Décret 07-205 ✅ (W40-CLOSE 2026-08-17) |
| SLH-05-04 (blood/entrails separation) | Art. 34 | Loi 03-10 Art.30 retained; Loi 01-19 ref removed ✅ |
| SLH-05-05 (closed containers + handler) | Art. 17 | Art. 15/16 ✅ |

### F5 — Loi 03-10 spot-checks — ALL PATCHED
- BGN-10-01: Art. 15–22 → Art. 14–21 ✅ (W41 2026-08-10)
- BGN-08-06: Art. 18 → Art. 63 + Art. 77 ✅ (W41 2026-08-10)
- BGN-02-01: Art. 37 → Art. 4 + [حكم مهني] ✅ (W45 2026-08-10)
- BGN-02-02: Art. 8 added as primary ✅ (W48 2026-08-10)

### F6 — Redundancy: SLH-08-01 duplicates BGN-10-01 — OPEN
`slaughterhouseSmallCriteria.ts`'s EIE criterion (`SLH-08-01`) cites nearly identical legal bases
to the universal `BGN-10-01`. **Verdict: REMOVE `SLH-08-01`** — straight duplicate. Pending
implementation decision.

### F7 — Décret 06-141 wastewater units — ✅ CLOSED (2026-08-17, Session 11)
Décret 06-141 Annexe II §1a read in full (legal_refs/ confirmed ✅ VÉRIFIÉ 2026-08-11).
Sector-specific values for abattoirs et transformation de la viande confirmed:
- DBO5 ≤ 250 g/t | DCO ≤ 800 g/t | Matière décantable ≤ 200 g/t
- Volume ≤ 6 m³/t carcasse | pH 5.5–8.5

Both `abattoirCriteria.ts` (ABT-AX6-01/02/04) and `slaughterhouseSmallCriteria.ts`
(SLH-05-04/04B/04C/04D) patched to Annexe II g/t values in F7-fix (2026-08-17). No open items.

Secondary F7 item — Décret 04-82 (veterinary ante/post-mortem inspection, Art.6 and Art.9 cited
in slaughterhouseSmallCriteria.ts): source still not in legal_refs/. Article numbers appear
plausible but remain unverified. Low risk — not an instrument known to have phantom-article
problems.

### F8 — `gplCriteria.ts` wrong-decree citation cluster — ✅ CLOSED (2026-08-17, Session 11)
**Scope confirmed by user:** `تركيب GPL/C` = vehicle GPL/C conversion workshops.
Therefore Décret 21-430/83-496 (vehicle-fuel GPL conversion accreditation) **is** the correct
instrument — F8's concern that the decree was wrong for the activity is resolved.

All phantom article numbers were already corrected in W43:
- 21-430 Art.3/4/5/6/10/15/16 phantom refs → replaced with correct 83-496 Art.7/8/10/11/16
  (as amended by 21-430 Art.2) across GPL-01-01, GPL-01-02, GPL-02-02, GPL-03-01, GPL-04-01,
  GPL-04-02.
- GPL-05-01: Loi 03-10 Art.15–22 → Art.15–21 corrected in W60 (2026-08-17).
  *(Note: Art.15 = root EIE obligation; Art.14 = définition only — distinct from BGN-10-01
  which correctly starts at Art.14 as its obligation root because that file's range was
  Art.14–21. Both are now internally consistent.)*

**Remaining open in gplCriteria.ts:** AIM GPL2 `[À VÉRIFIER — W51]` tag on GPL-02-01/02/03,
GPL-03-01/02, GPL-04-01 — source has no confirmed JORADP publication trace (Scribd draft only).
Technical values retained as [حكم مهني]. Not a citation-error — a source-status flag.

### Legacy items still open
- `BFD-08-01` (Loi 09-03 Art. 19): confirmed INCORRECT — Art. 19 = consumer right of
  withdrawal, unrelated to traceability. Needs correct citation (likely Décret 17-140) or
  `[حكم مهني]` tag. MODIFY pending.
- `BFD-02-02`: cites Décret 17-140 generically for specific storage clearances (≥15cm floor,
  ≥5cm wall) not found in the decree's actual text. MODIFY pending.
- `BGN-01-02` `[À VÉRIFIER]`: no explicit record-keeping register article found in Loi 03-10 or
  Décret 06-198 — still open. Low risk (Art. 62 retained as best available).

### Verified correct (positive findings, not exhaustive)
- `BGN-01-01`: Décret 24-196 3-year grace period confirmed. Exact end-date still open.
- `BGN-08-03`: Décret 91-05 Art.17 confirmed correct (W49 2026-08-17).
- `BGN-09-02`: Décret 02-427 confirmed correct — decree is specifically about worker
  instruction/information/training on occupational risks; exact match for EPI-training criterion.
- `BGN-08-05`: Loi 19-02 Art. 5 confirmed correct.
- `BFD-05-01`: Décret 17-140 Art. 5 confirmed as HACCP obligation article.
- `BFD-04-01`/`BFD-04-02`: cold-chain citation confirmed sound.
- `facilityCategoriesFull.json`: spot-checked — high fidelity against Décret 07-144.
- Décret 06-198, 07-144, 22-167, 24-196, 09-19, 17-140, 91-05, 21-430, 83-496: confirmed real.
- Loi 03-10, Loi 01-19, Loi 90-29: fully verified.
- **GPL-02-01, GPL-02-03, GPL-03-02** (AIM GPL2 numeric claims): all 3 confirmed internally
  consistent. Caveat: AIM GPL2 source unverified against JORADP (Scribd origin).

---

## 4. `legal_refs/` — current inventory (Session 11)

**Confirmed present and usable (full text):**
loi-09-03-protection-consommateur.md, loi-03-10-protection-environnement.md,
loi-01-19-gestion-dechets.md, loi-19-02-incendie-panique.md, loi-90-29-urbanisme.md,
loi-90-11-relations-travail.md, loi-05-12-ressources-en-eau.md, loi-04-20-risques-majeurs.md,
loi-18-11-sante.md (189 KB — not yet audited against criteria files),
decret-17-140-hygiene-alimentaire.md, decret-06-198-etablissements-classes.md, decret-09-19.md,
decret-91-05-hygiene-securite-milieu-travail.md (verified, F3 resolved),
decret-93-120-medecine-du-travail.md,
decret-22-167-etablissements-classes-modification.md (full, 28.9 KB),
decret-24-196-etablissements-classes-modification.md (full),
decret-06-141-rejets-effluents-liquides.md (full, ✅ VÉRIFIÉ 2026-08-11 — F7 resolved),
decret-21-430-gpl-carburant.md (verified, F8 resolved),
decret-83-496-gpl-carburant.md (verified, F8 resolved),
decret-02-427-prevention-risques-professionnels.md (✅ read Session 11 — BGN-09-02 confirmed),
decret-76-35-igh-incendie.md (present — BGN-08-03 confirmed correct via Décret 91-05 Art.17;
  76-35 is IGH-only, not applicable to general workplace electrical safety),
4 arrêtés, aim-gpl2-regles-techniques-securite.md (verified internally, non-JORADP source).

**⚠️ Partial:** decret-07-144-nomenclature-installations-classees.md — rubriques 1243–2922
missing.

**Still missing entirely:** Décret 11-125 (drinking water — abattoirCriteria.ts chlorine levels),
Décret 06-138 (industrial air emissions — paintShopCriteria.ts), Décret 04-82 (veterinary
sanitary accreditation — slaughter files), Loi 04-08 (commercial activity conditions), Loi 88-07
(occupational health/safety — cited in gplCriteria.ts and paintShopCriteria.ts).

**docs/legal_sources/ was deleted 2026-08-09** — do not recreate, do not look for sources there.

---

## 5. Legal references — verification tracker

**VERIFIED:** Décret 06-198, 07-144 (partial), 22-167, 24-196, 09-19, 17-140, 91-05, 21-430,
83-496, 02-427, 06-141, Loi 03-10, Loi 01-19, Loi 90-29 (all: existence + identity + subject
matter). Specific articles confirmed: Loi 19-02 Art. 5 & 13; Décret 17-140 Art. 5 & 24; Loi
03-10 Art. 41, 44, 54, 56, 58, 62, 82, 84; Loi 01-19 Art. 8, 11, 15, 19, 21, 63; Décret 91-05
Art. 3–4, 9, 13, 15, 17; Loi 90-29 Art. 4, 8, 52, 56/75; Décret 02-427 Arts. 1–24 (full);
Décret 06-141 Annexe II §1a (abattoirs sector values confirmed); Décret 83-496 Art. 7, 8, 10,
11, 16 (as amended by 21-430 Art.2).

**CONFIRMED INCORRECT (historical):** Loi 09-03 Art. 19 (BFD-08-01); Loi 01-19 Art. 32/30/17/34
(F4 — all patched); Décret 91-05 Art. 14/7/16/9 misapplied (F3 — all patched); Loi 03-10 Art.
18 (BGN-08-06 — patched) and Art. 15–22 range (BGN-10-01 — patched); Loi 90-29 Art. 37
(BGN-02-01 — patched); Décret 21-430 phantom Art. 5/6/10/15/16 (F8 — all patched in W43).

**UNVERIFIED — DO NOT IMPLEMENT AS VERIFIED LAW:**
- BFD-02-02's 15cm/5cm storage clearance figures (no source found)
- Exact end-date of the Décret 24-196 grace period (3 years from which trigger date?)
- Décret 06-198 Art. 20 (cited in a types.ts comment re: 'warning' sanction tier)
- Décret 04-82 (veterinary accreditation) — not in legal_refs/ yet
- AIM GPL2 source status — internally consistent with the app, but not confirmed against JORADP

---

## 6. Session log

### Session 1 (2026-08-07): Scope inventory, read types.ts. Flagged (later corrected) rubrique claim.
### Session 2: Traced criteriaData.ts/criteriaByActivity wiring. Verified 26-activity coverage claim (true, but only for old seed data — see F1). Found F2 (allCriteria dead code).
### Session 3: Continuation of Session 2 findings; confirmed F2 not live-wired.
### Session 4: Read facilitiesData.ts. Withdrew Session 1 rubrique claim. Flagged classification-linkage gap (resolved Session 7 as F1) and a PII-in-repo concern (out of scope).
### Session 5: Began baseGeneralCriteria.ts audit. Verified BGN-01-01, BGN-08-01/02/05.
### Session 6: Full audit of baseFoodCriteria.ts (12/12). Verified Décret 09-19; found BGN-04-06 citation imprecision.
### Session 7: Discovered legal_refs/ (pre-cleanup state); found fabricated loi-09-03.md stub; found BFD-08-01, BFD-02-02 issues. Confirmed **F1** critical defect.
### Session 8 (Perplexity): Deleted 17 zero-byte stub files from legal_refs/. Updated README.
### Session 9: legal_refs/ expanded to 20 files. Verified Loi 03-10 and Loi 01-19 in full — found F4, F5. Verified Décret 91-05 in full — found F3. Cross-checked abattoir vs slaughterhouse-small — found F6, F7. Merged this file with Perplexity's Session 8 version.
### Session 10 (2026-08-09): User began manually converting PDFs directly into legal_refs/. Verified Loi 90-29 in full (F5 additions). Audited gplCriteria.ts in full (12/12) — found F8. Décret 06-141 added as full text but not yet read.
### Session 11 (2026-08-17, Perplexity):
- **F7 CLOSED:** Read Décret 06-141 Annexe II §1a. Confirmed sector-specific g/t values for
  abattoirs. Patched abattoirCriteria.ts (ABT-AX6-01/02/04) and slaughterhouseSmallCriteria.ts
  (SLH-05-04/04B/04C/04D) — F7-fix commit 2026-08-17.
- **BGN-08-03 CLOSED:** Read Décret 76-35 — confirmed IGH-only scope, not applicable to
  general workplace electrical safety. BGN-08-03 correctly cites Décret 91-05 Art.17 (W49).
- **BGN-04-07 CLOSED (W40-CLOSE):** Full read of Loi 01-19 (72 articles, no gap). Word
  "incinération" absent. Best available basis: Art.15 + Art.19 + Art.63 + Décret 07-205.
- **BGN-09-02 CONFIRMED CORRECT:** Read Décret 02-427 in full (24 articles). Decree is
  specifically about worker instruction/information/training on occupational risks — exact
  subject match for BGN-09-02 (EPI training documentation). No change needed.
- **F8 CLOSED:** User confirmed `تركيب GPL/C` = vehicle GPL/C conversion workshops. Décret
  21-430/83-496 is the correct instrument. Phantom article fixes (W43) and GPL-05-01 range
  fix (W60: Art.15–21) already applied. gplCriteria.ts fully patched.
- **AUDIT_STATE updated** to reflect Session 11 closures.

**Recommended next session:**
1. **F6 — SLH-08-01 removal**: straight duplicate of BGN-10-01 (EIE); one-line deletion.
2. **BFD-08-01**: Loi 09-03 Art.19 confirmed wrong — replace with correct citation
   (Décret 17-140 or [حكم مهني]).
3. **BFD-02-02**: Décret 17-140 storage-clearance figures (15cm/5cm) not in decree text —
   tag [حكم مهني] or locate the correct source.
4. **BGN-01-02** `[À VÉRIFIER]`: no record-keeping article found yet in Loi 03-10 or
   Décret 06-198 — either close as [حكم مهني] or check arrêtés.
5. **Décret 04-82** (veterinary accreditation — Art.6 + Art.9 cited in slaughterhouseSmall
   and abattoirCriteria): source not in legal_refs/. Low risk but unverified.
6. **AIM GPL2 publication status**: if official JORADP arrêté text surfaces, close W51.
7. **16 criteria files still not audited** — next priority after above legacy items:
   `uabCriteria.ts` (25.8 KB, largest unaudited file) or `couvoirCriteria.ts` (16.7 KB).
8. **F1** remains the highest-severity open item (silently wrong checklists in production) —
   implementation fix, not audit scope, but should be escalated.
