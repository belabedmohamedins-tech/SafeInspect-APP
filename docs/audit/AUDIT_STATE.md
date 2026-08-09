# SafeInspect Master Checklist & Inspection Logic Audit — State Document

**Purpose:** Track progress of the multi-session regulatory audit. This file is the single source of truth for what has been audited, what is pending, and what legal references remain unverified. Every session reads this file first and updates it before ending.

> **Note on this file's own history:** this document was briefly overwritten by a Perplexity
> session ("Session 8", 2026-08-08) that logged only its own `legal_refs/` cleanup work and did
> not carry forward the Claude-side findings from Sessions 1–7. This version merges both
> histories and brings the `legal_refs/` inventory current against `legal_refs/CLEANUP_LOG.md`
> (dated 2026-08-09, one day newer than this file's last Perplexity entry). **`CLEANUP_LOG.md`
> is the authoritative source for `legal_refs/` file status — check it first if the two ever
> disagree again.**

**Status:** IN PROGRESS. `legal_refs/` cleaned and substantially expanded (20 content files as of 2026-08-09). Critical defect F1 confirmed. Large citation-error cluster found in Décret 91-05 references.
**Last updated:** 2026-08-09 (Session 9)

---

## 1. Source-of-truth hierarchy

1. GitHub code (this repo, branch `main`) — what the app currently does.
2. `legal_refs/` — canonical legal-text folder. `docs/legal_sources/` was deleted 2026-08-09
   (per `CLEANUP_LOG.md`) — do not recreate it or look for sources there anymore.
3. `docs/Inspection_Manual_Chapter1-8_*.md` — project's own methodology docs. Not yet
   cross-checked against criteria files.
4. `docs/SafeInspect_Audit_Consolidated_2026-08-06 (1).md`, `docs/STRATEGIC_PLAN.md` — prior
   AI/human audit work. Historical context only, not trusted as verified law.

---

## 2. Full scope inventory

### 2a. Criteria files — `src/criteria/` (17 activity-specific + 3 base)
| File | Size | Status |
|---|---|---|
| baseGeneralCriteria.ts | 31.7 KB | NEARLY DONE — see Section 3 for full per-criterion detail. ~24/30 have received real citation verification (own W18/W19 fixes + this audit's Décret 91-05 and Loi 03-10/01-19 checks); remainder listed in Section 3. |
| baseFoodCriteria.ts | 10.7 KB | DONE — 12/12 criteria audited |
| baseCompressedGasCriteria.ts | 2.8 KB | NOT AUDITED |
| abattoirCriteria.ts | 20.4 KB | PARTIAL — read in full; cross-checked against slaughterhouseSmallCriteria.ts for redundancy/consistency (Section 3). Individual legal-reference verification not yet done except where noted. |
| bakeryCriteria.ts | 8.6 KB | NOT AUDITED |
| blacksmithCriteria.ts | 7.3 KB | NOT AUDITED |
| carWashCriteria.ts | 10.1 KB | PARTIAL — read in full, swept for the Loi 01-19 citation-offset pattern (none found). Individual citations not otherwise verified. |
| carpenteryCriteria.ts | 6.0 KB | NOT AUDITED |
| coldRoomCriteria.ts | 7.6 KB | NOT AUDITED |
| couvoirCriteria.ts | 16.7 KB | NOT AUDITED |
| gplCriteria.ts | 11.9 KB | NOT AUDITED |
| marbleCriteria.ts | 10.0 KB | NOT AUDITED |
| mechanicCriteria.ts | 6.2 KB | NOT AUDITED |
| paintShopCriteria.ts | 8.7 KB | PARTIAL — read in full, swept for Loi 01-19 pattern (none found). Leans heavily on Décret 06-138 (industrial air emissions) — NOT yet verified, no source file. Also cites Loi 04-08, Loi 88-07 — not yet verified. |
| printingCriteria.ts | 8.3 KB | NOT AUDITED |
| produceStorageCriteria.ts | 5.5 KB | NOT AUDITED |
| semiPharmaCriteria.ts | 7.6 KB | NOT AUDITED |
| slaughterhouseSmallCriteria.ts | 12.9 KB | PARTIAL — read in full; cross-checked against abattoirCriteria.ts. Several Loi 01-19 citation errors found (Section 3). |
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

### F3 — Décret 91-05 citation cluster (baseGeneralCriteria.ts) — NEW, Session 9
Verified full 68-article text. Found the largest citation-error cluster in the audit so far:

| Criterion | Cites | Real content of that article | Correct article |
|---|---|---|---|
| BGN-02-05 (cleanable floors/walls) | Art. 14 | Cold/weather + combustion-fume protection — unrelated | **Art. 3–4** (exact match: "le sol doit être lisse, imperméable... murs lisses et lavables") |
| BGN-02-07 (minimum lighting) | Art. 16 | PPE for noise exposure — unrelated | **Art. 13** (exact match — contains the actual lux table: 40/60/120/200) |
| BGN-03-04 (drainage channel design) | Art. 14 | Same unrelated article | **Art. 9** — reasonable fit (general evacuation-device rule), not a perfect textual match for diameter/slope specifically |
| BGN-03-05 (water-trap siphons) | Art. 14 | Same unrelated article | **Art. 9** — near-exact match ("intercepteurs hydrauliques" = the siphon requirement) |
| BGN-04-03 (daily cleaning program) | Art. 7 | Ventilation for basement/windowless rooms — unrelated | **Art. 2–3** (general propreté obligations) |
| BGN-07-04 (sealing cracks against pests) | Art. 14 | Same unrelated article | No clean match found in this decree — needs a different source or `[حكم مهني]` |
| BGN-09-01 (noise limit) | Art. 9 | Sewage/drainage odor prevention — unrelated | **Art. 15** (exact match: "maintenir l'intensité des bruits... à un niveau compatible avec leur santé") |
| BGN-02-06 (ventilation) | Art. 11 | Ventilation for isolated *high-risk* cabins specifically — narrower than claim | **Art. 6** is the general ventilation obligation; Art. 11 isn't wrong, just narrower than ideal |

**Pattern:** Article 14 alone is misapplied to four unrelated criteria (floors, drainage,
siphons, pest-proofing) despite only covering cold/weather protection — looks like a default
placeholder rather than four independently-checked citations. **6 confirmed MODIFY, 1 borderline
improvement (BGN-02-06), 1 needs a different source entirely (BGN-07-04).**

### F4 — Loi 01-19 citation-offset pattern (bounded, not codebase-wide) — Session 9
Full 72-article text verified. Found 4 wrong citations, 3 of which land in the *same* wrong
section (Titre III, Art. 29–36, municipal household-waste rules) despite describing
special/hazardous-waste obligations that belong in Titre II (Art. 12–28):

| Criterion | Cites | Should be |
|---|---|---|
| BGN-04-06 (hazardous waste bordereau) | Art. 32 (municipal waste responsibility) | Art. 19 or Art. 21 |
| BGN-04-07 (self-incineration ban) | Art. 30 (municipal schema content) | Art. 15 (treatment only in authorized facilities) |
| SLH-05-04 (separating blood/entrails from wash water) | Art. 34 (municipal sorting services) | Not really this law — Loi 03-10 Art. 30 already correctly cited alongside it |
| SLH-05-05 (closed containers + accredited handler) | Art. 17 (ban on mixing hazardous waste with other waste — different subject) | Art. 15 or Art. 16 |

Swept `carWashCriteria.ts` and `paintShopCriteria.ts` for the same pattern — **none found**.
Pattern appears contained to these 4 criteria, not systemic across the codebase. No need to
re-check every file for this specific issue; worth a final grep-style pass later if time allows,
but not high priority.

Also confirmed correct via this same source: BGN-03-02/03, BGN-04-01/02/04 (Art. 8 + 11),
BGN-04-08 (Art. 21), and BGN-04-05's honest self-flag (no open-burning ban article exists in
this law at all — confirmed by reading all 72 articles).

### F5 — Loi 03-10 spot-checks (Session 9)
Full 89-article text verified. 5 of 6 W19 corrections checked were exact matches (BGN-01-03 Art.
82+84, BGN-02-03 Art. 41+44, BGN-09-01's Loi 03-10 half via Art. 54, BGN-07-05 Art. 56+58,
BGN-01-02's honest `[À VÉRIFIER]` self-flag held up — no better article found).

**New finding: BGN-10-01 citation range is off at both ends.** Cites "Art. 15–22" for the EIE
(environmental impact study) requirement. Real structure: **Art. 14** is where the requirement
itself is established (currently excluded from the cited range); **Art. 22** belongs to a
different chapter entirely (fiscal/economic instruments, unrelated to EIE). **Verdict: MODIFY —
change to "Art. 14–21."**

**New finding: BGN-08-06 cites the wrong article entirely.** Claims "Loi 03-10 Art. 18" for
mandatory Class-1 prior authorization + criminal penalties for violation. Real Art. 18 is about
who may prepare an EIE study (accredited organizations) — unrelated. **Verdict: MODIFY — replace
with Art. 63 (installations classées subject to authorization/declaration) + Art. 77 (penal
article — imprisonment/fine for operating without authorization).**

### F6 — Redundancy: SLH-08-01 duplicates BGN-10-01 (Section 6)
`slaughterhouseSmallCriteria.ts`'s EIE criterion (`SLH-08-01`) cites nearly identical legal bases
to the universal `BGN-10-01`, which already applies to every facility via the base-criteria
merge. **Verdict: REMOVE `SLH-08-01`** — straight duplicate, not activity-specific content.

### F7 — Cross-file consistency gaps, abattoir vs. slaughterhouse-small (Section 7)
- Both cite identical Décret 06-141 wastewater limits (DBO5≤35, DCO≤120, MES≤35, pH 6.5–8.5),
  but `abattoirCriteria.ts` flags them `[À VÉRIFIER]` (Annex I vs. sector-specific Annex II
  units unresolved) while `slaughterhouseSmallCriteria.ts` presents the same numbers as settled.
  Same open legal question, inconsistent confidence — resolve once, apply to both.
- `slaughterhouseSmallCriteria.ts` cites specific articles of **Décret 04-82** (Art. 6, Art. 9)
  for veterinary ante/post-mortem inspection; `abattoirCriteria.ts` cites only generic Loi 88-08
  for the same obligation. Décret 04-82 itself is not yet independently verified — new
  instrument. If verified correct, `abattoirCriteria.ts` should be upgraded to match.

### Legacy F3 items (renumbered from prior version, still open)
- `BGN-04-06` (Décret 09-19): cited "Articles 4–8" for the accreditation/verification
  requirement; actual accreditation clause is **Article 2**, validity period is **Article 6**.
  (Note: this criterion now has *two* independent citation defects — this one plus the Loi 01-19
  Art. 32 error in F4 above. Needs a full citation rewrite, not a tweak.)
- `BFD-08-01` (Loi 09-03 Art. 19): **Confirmed INCORRECT** — Art. 19 is actually about the
  consumer's right of withdrawal, not traceability. Needs a correct citation (likely Décret
  17-140) or `[حكم مهني]` tag.
- `BFD-02-02`: cites Décret 17-140 generically for specific storage clearances (≥15cm floor,
  ≥5cm wall) not found in the decree's actual text. MODIFY.
- `BGN-08-01` / `BGN-08-02`: **RESOLVED** — already fixed in a parallel Perplexity pass (W18),
  now correctly cite Loi 19-02 Art. 5 and Art. 13 respectively, matching sibling BGN-08-05.

### Verified correct (positive findings, not exhaustive)
- `BGN-01-01`: Décret 24-196 3-year regularization grace period — confirmed real via Ministry of
  Environment/APS statement. Exact end-date computation still open.
- `BGN-08-05`: Loi 19-02 Art. 5 — confirmed correct.
- `BFD-05-01`: Décret 17-140 Art. 5 confirmed as the actual HACCP obligation article.
- `BFD-04-01`/`BFD-04-02`: cold-chain citation correctly moved off Décret 17-140 Art. 7/8 (which
  don't contain temperature figures) to a separate 2025 arrêté — Art. 24 of 17-140 itself
  delegates exact temperatures to that instrument. Confirmed sound.
- `facilityCategoriesFull.json`: spot-checked against real Décret 07-144 text — high fidelity.
- Décret 06-198, 07-144, 22-167, 24-196, 09-19, 17-140: all confirmed real, correctly identified.
- Loi 03-10 and Loi 01-19: both now fully verified as reliable sources (see F4, F5 for detail).

---

## 4. `legal_refs/` — current inventory (per `CLEANUP_LOG.md`, 2026-08-09)

**✅ Complete, verified usable:** loi-09-03-protection-consommateur.md, loi-03-10-protection-environnement.md,
loi-01-19-gestion-dechets.md, loi-19-02-incendie-panique.md, decret-17-140-hygiene-alimentaire.md,
decret-06-198-etablissements-classes.md, decret-09-19.md, decret-91-05-hygiene-securite-milieu-travail.md,
decret-93-120-medecine-du-travail.md, plus 4 arrêtés and aim-gpl2-regles-techniques-securite.md.

**⚠️ Partial:** decret-07-144-nomenclature-installations-classees.md — rubriques 1243–2922 missing
(JO n° 31/2007 not yet supplied). Rubriques below that range (used for facilityCategoriesFull.json
spot-checks so far) are confirmed accurate.

**Present in repo but not yet reflected in CLEANUP_LOG.md** (log is one day stale as of this
writing — confirm status before trusting the log blindly): loi-90-11-relations-travail.md,
loi-90-29-urbanisme.md, loi-05-12-ressources-en-eau.md, loi-04-20-risques-majeurs.md. All four
exist with substantial content (40–52 KB) per direct listing — not yet individually verified by
this audit, but available for use.

**Still missing entirely:** Loi 18-11 (santé publique — semiPharmaCriteria.ts), Décret 11-125
(cross-check needed — used in abattoirCriteria.ts for chlorine levels, may already be covered by
a different source), Décret 21-430 (GPL/C — gplCriteria.ts), Décret 06-141 (eaux usées — heavily
cited in abattoir/slaughterhouse files, high priority), Décret 06-138 (industrial air emissions —
paintShopCriteria.ts), Décret 04-82 (veterinary sanitary accreditation — slaughter files), Loi
04-08 (commercial activity conditions), Loi 88-07 (occupational health/safety).

**docs/legal_sources/ was deleted 2026-08-09** — do not recreate, do not look for sources there.

---

## 5. Legal references — verification tracker

**VERIFIED:** Décret 06-198, 07-144 (partial, see above), 22-167, 24-196, 09-19, 17-140, 91-05,
Loi 03-10, Loi 01-19 (all: existence + identity + subject matter; article-level detail in
Section 3). Specific articles confirmed: Loi 19-02 Art. 5 & 13; Décret 17-140 Art. 5 & 24; Loi
03-10 Art. 41, 44, 54, 56, 58, 62, 82, 84; Loi 01-19 Art. 8, 11, 21; Décret 91-05 Art. 3–4, 9, 13,
15.

**CONFIRMED INCORRECT:** Loi 09-03 Art. 19 (BFD-08-01); Loi 01-19 Art. 32/30/17/34 (BGN-04-06,
BGN-04-07, SLH-05-04, SLH-05-05 — see F4); Décret 91-05 Art. 14/7/16/9 misapplied across 6
criteria (see F3); Loi 03-10 Art. 18 (BGN-08-06) and the Art. 15–22 range on BGN-10-01 (see F5).

**UNVERIFIED — DO NOT IMPLEMENT AS VERIFIED LAW:**
- BFD-02-02's 15cm/5cm storage clearance figures (no source found yet)
- Exact end-date of the Décret 24-196 grace period (3 years from which date?)
- Décret 06-198 Art. 20 (cited in a types.ts comment re: 'warning' sanction tier)
- Décret 04-82 (veterinary accreditation, cited in slaughterhouseSmallCriteria.ts) — new
  instrument, not yet independently checked at all

---

## 6. Session log

### Session 1 (2026-08-07): Scope inventory, read types.ts. Flagged (later corrected) rubrique claim.
### Session 2: Traced criteriaData.ts/criteriaByActivity wiring. Verified 26-activity coverage claim (true, but only for old seed data — see F1). Found F2 (allCriteria dead code).
### Session 3: Continuation of Session 2 findings; confirmed F2 not live-wired.
### Session 4: Read facilitiesData.ts. Withdrew Session 1 rubrique claim. Flagged classification-linkage gap (resolved Session 7 as F1) and a PII-in-repo concern (out of scope).
### Session 5: Began baseGeneralCriteria.ts audit. Verified BGN-01-01, BGN-08-01/02/05.
### Session 6: Full audit of baseFoodCriteria.ts (12/12). Verified Décret 09-19; found BGN-04-06 citation imprecision.
### Session 7: Discovered legal_refs/ (pre-cleanup state); found fabricated loi-09-03.md stub; found BFD-08-01, BFD-02-02 issues. Confirmed **F1** critical defect.
### Session 8 (Perplexity): Deleted 17 zero-byte stub files from legal_refs/. Updated README. legal_refs/ marked usable for the 7 files that had real content at that time.
### Session 9 (this session): Confirmed legal_refs/ expanded further since Session 8 (20 files now, per CLEANUP_LOG.md dated 2026-08-09) — flagged that CLEANUP_LOG.md, not this file, is the live source of truth for legal_refs/ status. Verified Loi 03-10 and Loi 01-19 in full — found F4 (Loi 01-19 citation-offset pattern, bounded) and F5 (BGN-10-01 range fix, BGN-08-06 wrong-article fix). Verified Décret 91-05 in full — found F3, the largest citation-error cluster in the audit (6 confirmed wrong across baseGeneralCriteria.ts). Cross-checked abattoirCriteria.ts vs slaughterhouseSmallCriteria.ts — found F6 (SLH-08-01 redundancy) and F7 (cross-file consistency gaps). Swept carWashCriteria.ts and paintShopCriteria.ts for the F4 pattern — none found, confirming it's bounded. Merged this file with Perplexity's Session 8 version rather than overwriting.

**Recommended next session:**
1. `baseGeneralCriteria.ts` is now close to fully triaged — finish the last few criteria still
   pending a source (Loi 90-29 for BGN-02-04, Décret 76-35 for BGN-08-03, Décret 02-427 for
   BGN-09-02 — all three source files may now already exist per Section 4, not yet checked).
2. Décret 06-141 (eaux usées) is the single highest-leverage remaining gap — cited heavily
   across abattoirCriteria.ts and slaughterhouseSmallCriteria.ts and would resolve F7's open
   wastewater-unit question (Annex I vs Annex II) directly.
3. F1 and F3 are the two highest-priority items to hand to whoever implements fixes — F1 for
   severity (silently wrong checklists in production), F3 for volume (6 confirmed errors in one
   pass).
4. Move to a fresh, entirely-unaudited criteria file (e.g. gplCriteria.ts or mechanicCriteria.ts)
   once the above are resolved, since 17 of 20 files have had zero direct audit attention so far.
