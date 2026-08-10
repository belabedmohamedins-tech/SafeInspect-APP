# SafeInspect Master Checklist & Inspection Logic Audit — State Document

**Purpose:** Track progress of the multi-session regulatory audit. This file is the single source of truth for what has been audited, what is pending, and what legal references remain unverified. Every session reads this file first and updates it before ending.

> **Note on this file's own history:** this document was briefly overwritten by a Perplexity
> session ("Session 8", 2026-08-08) that logged only its own `legal_refs/` cleanup work and did
> not carry forward the Claude-side findings from Sessions 1–7. Session 9 merged both histories.
> **`legal_refs/CLEANUP_LOG.md` is the authoritative source for `legal_refs/` file status** — it
> has lagged behind the actual folder contents more than once; confirm against the live folder
> listing before trusting it blindly.

**Status:** IN PROGRESS. `legal_refs/` now ~28 content files (user manually adding PDFs directly, converted in place — see Section 4). Critical defect F1 confirmed. Two major citation-error clusters found (Décret 91-05: F3; Loi 01-19: F4). **New: F8 — likely wrong-decree citation across most of `gplCriteria.ts`.**
**Last updated:** 2026-08-09 (Session 10)

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
| baseGeneralCriteria.ts | 31.7 KB | NEARLY FULLY TRIAGED — every criterion checked; only 2 blocked purely on a missing source (BGN-08-03 → Décret 76-35, BGN-09-02 → Décret 02-427 — **both sources now exist in legal_refs/ as of Session 10, not yet individually verified**). See Section 3 for full detail. |
| baseFoodCriteria.ts | 10.7 KB | DONE — 12/12 criteria audited |
| baseCompressedGasCriteria.ts | 2.8 KB | NOT AUDITED |
| abattoirCriteria.ts | 20.4 KB | PARTIAL — read in full; cross-checked against slaughterhouseSmallCriteria.ts for redundancy/consistency (Section 3, F6/F7). Individual legal-reference verification not yet done except where noted. |
| bakeryCriteria.ts | 8.6 KB | NOT AUDITED |
| blacksmithCriteria.ts | 7.3 KB | NOT AUDITED |
| carWashCriteria.ts | 10.1 KB | PARTIAL — read in full, swept for the Loi 01-19 citation-offset pattern (none found). Individual citations not otherwise verified. |
| carpenteryCriteria.ts | 6.0 KB | NOT AUDITED |
| coldRoomCriteria.ts | 7.6 KB | NOT AUDITED |
| couvoirCriteria.ts | 16.7 KB | NOT AUDITED |
| gplCriteria.ts | 11.9 KB | PARTIAL — read in full (12/12 criteria reviewed). AIM GPL2 numeric claims verified (3/3 match). **Major finding F8: Décret 21-430/83-496 is very likely the wrong decree for most of this file's citations** — see Section 3. Same Art. 15–22 range issue as BGN-10-01 found on GPL-05-01, plus a possible partial redundancy with it. |
| marbleCriteria.ts | 10.0 KB | NOT AUDITED |
| mechanicCriteria.ts | 6.2 KB | NOT AUDITED |
| paintShopCriteria.ts | 8.7 KB | PARTIAL — read in full, swept for Loi 01-19 pattern (none found). Leans heavily on Décret 06-138 (industrial air emissions) — NOT yet verified, no source file. Also cites Loi 04-08, Loi 88-07 — not yet verified. |
| printingCriteria.ts | 8.3 KB | NOT AUDITED |
| produceStorageCriteria.ts | 5.5 KB | NOT AUDITED |
| semiPharmaCriteria.ts | 7.6 KB | NOT AUDITED — note: Loi 18-11 (santé publique) now available in legal_refs/, likely relevant here |
| slaughterhouseSmallCriteria.ts | 12.9 KB | PARTIAL — read in full; cross-checked against abattoirCriteria.ts. Several Loi 01-19 citation errors found (F4). |
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

### F3 — Décret 91-05 citation cluster (baseGeneralCriteria.ts)
Verified full 68-article text. Largest citation-error cluster found up to Session 9:

| Criterion | Cites | Real content of that article | Correct article |
|---|---|---|---|
| BGN-02-05 (cleanable floors/walls) | Art. 14 | Cold/weather + combustion-fume protection — unrelated | **Art. 3–4** (exact match) |
| BGN-02-07 (minimum lighting) | Art. 16 | PPE for noise exposure — unrelated | **Art. 13** (exact match — actual lux table: 40/60/120/200) |
| BGN-03-04 (drainage channel design) | Art. 14 | Same unrelated article | **Art. 9** — reasonable fit, not a perfect textual match |
| BGN-03-05 (water-trap siphons) | Art. 14 | Same unrelated article | **Art. 9** — near-exact match ("intercepteurs hydrauliques") |
| BGN-04-03 (daily cleaning program) | Art. 7 | Ventilation for basement/windowless rooms — unrelated | **Art. 2–3** (general propreté obligations) |
| BGN-07-04 (sealing cracks against pests) | Art. 14 | Same unrelated article | No clean match found — needs a different source or `[حكم مهني]` |
| BGN-09-01 (noise limit) | Art. 9 | Sewage/drainage odor prevention — unrelated | **Art. 15** (exact match) |
| BGN-02-06 (ventilation) | Art. 11 | Ventilation for isolated *high-risk* cabins specifically — narrower than claim | **Art. 6** is the general obligation; Art. 11 isn't wrong, just narrower |

**Pattern:** Article 14 alone is misapplied to four unrelated criteria — looks like a default
placeholder rather than independently-checked citations. **6 confirmed MODIFY, 1 borderline
improvement, 1 needs a different source entirely.**

### F4 — Loi 01-19 citation-offset pattern (bounded, not codebase-wide)
Full 72-article text verified. 4 wrong citations, 3 landing in the *same* wrong section (Titre
III, Art. 29–36, municipal household-waste rules) despite describing special/hazardous-waste
obligations that belong in Titre II (Art. 12–28):

| Criterion | Cites | Should be |
|---|---|---|
| BGN-04-06 (hazardous waste bordereau) | Art. 32 (municipal waste responsibility) | Art. 19 or Art. 21 |
| BGN-04-07 (self-incineration ban) | Art. 30 (municipal schema content) | Art. 15 (treatment only in authorized facilities) |
| SLH-05-04 (separating blood/entrails from wash water) | Art. 34 (municipal sorting services) | Not really this law — Loi 03-10 Art. 30 already correctly cited alongside it |
| SLH-05-05 (closed containers + accredited handler) | Art. 17 (ban on mixing hazardous waste — different subject) | Art. 15 or Art. 16 |

Swept `carWashCriteria.ts` and `paintShopCriteria.ts` — none found; pattern is bounded to these 4.

Also confirmed correct: BGN-03-02/03, BGN-04-01/02/04 (Art. 8+11), BGN-04-08 (Art. 21),
BGN-04-05's honest self-flag (no open-burning ban article exists in this law at all).

### F5 — Loi 03-10 spot-checks
Full 89-article text verified. 5/6 W19 corrections were exact matches (BGN-01-03 Art. 82+84,
BGN-02-03 Art. 41+44, BGN-09-01 via Art. 54, BGN-07-05 Art. 56+58, BGN-01-02's honest
`[À VÉRIFIER]` self-flag held up).

**BGN-10-01 citation range off at both ends.** Cites "Art. 15–22" for the EIE requirement. Real
structure: **Art. 14** establishes the requirement itself (excluded from the cited range);
**Art. 22** belongs to a different chapter (fiscal/economic instruments, unrelated). **Verdict:
MODIFY — change to "Art. 14–21."** *(Note: same exact range error also found on `GPL-05-01` in
Session 10 — see F8. Both need the same fix.)*

**BGN-08-06 cites the wrong article entirely.** Claims "Loi 03-10 Art. 18" for mandatory Class-1
authorization + criminal penalties. Real Art. 18 is about who may prepare an EIE study
(accredited organizations) — unrelated. **Verdict: MODIFY — replace with Art. 63 (installations
classées subject to authorization/declaration) + Art. 77 (penal article).**

**Session 10 additions — Loi 90-29 (urbanisme), full 81-article text verified:**
- `BGN-02-01` (siting away from pollution sources) cites **Art. 37** — real Art. 37 is entirely
  about conditions for revising a *plan d'occupation des sols* (unrelated). **Confirmed WRONG.**
  Closest real match is **Art. 4** (constructibility conditions — ecological-balance
  compatibility), though imperfect; may partly need `[حكم مهني]` since no dedicated
  "distance-from-pollution-sources" article exists in this law. **Verdict: MODIFY.**
- `BGN-02-02` (no harm to neighbors — noise/odors/emissions/vibrations) cites Loi 03-10 Art. 6 +
  Loi 90-29 generically. **Enhancement opportunity, not an error:** Loi 90-29 **Art. 8** is a
  near-exact match ("les installations à usage industriel doivent être conçues de façon à éviter
  tout rejet d'effluents polluants et toute nuisance...") and isn't cited specifically. Low
  priority.
- `BGN-02-04` (building permit + conformity certificate) cites Loi 90-29 generically — subject
  matter correct (Art. 52 = permis de construire, Art. 56/75 = certificat de conformité, both
  real and on-topic). Not wrong, just imprecise like several others already found.

### F6 — Redundancy: SLH-08-01 duplicates BGN-10-01 (Section 6)
`slaughterhouseSmallCriteria.ts`'s EIE criterion (`SLH-08-01`) cites nearly identical legal bases
to the universal `BGN-10-01`, which already applies to every facility via the base-criteria
merge. **Verdict: REMOVE `SLH-08-01`** — straight duplicate, not activity-specific content.

### F7 — Cross-file consistency gaps, abattoir vs. slaughterhouse-small (Section 7)
- Both cite identical Décret 06-141 wastewater limits (DBO5≤35, DCO≤120, MES≤35, pH 6.5–8.5),
  but `abattoirCriteria.ts` flags them `[À VÉRIFIER]` (Annex I vs. sector-specific Annex II
  units unresolved) while `slaughterhouseSmallCriteria.ts` presents the same numbers as settled.
  **Décret 06-141 is now available in full in legal_refs/ (14.7 KB, no longer a stub) — this
  should be resolved directly next session, not deferred further.**
- `slaughterhouseSmallCriteria.ts` cites specific articles of **Décret 04-82** (Art. 6, Art. 9)
  for veterinary ante/post-mortem inspection; `abattoirCriteria.ts` cites only generic Loi 88-08.
  Décret 04-82 not yet independently verified — new instrument, not yet in legal_refs/.

### F8 — NEW (Session 10): `gplCriteria.ts` likely cites the wrong decree entirely for most criteria
Pulled full text of both **Décret 21-430** (2021, 3 articles) and its base decree **83-496**
(1983, 21 articles). Both are **exclusively about GPL as vehicle fuel** — conversion equipment
installed on cars, installer accreditation for auto-conversion shops, vehicle signage, and
licensing for *vehicle-refueling* distribution stations. Nothing in either decree covers
commercial/residential LPG bottle storage or distribution-point safety.

But `gplCriteria.ts` cites "Décret 21-430" with article numbers **3, 4, 5, 6, 10, 15, 16** across
six criteria (`GPL-01-01`, `GPL-01-02`, `GPL-02-02`, `GPL-03-01`, `GPL-04-01`, `GPL-04-02`) — and
**articles 5, 6, 10, 15, and 16 don't exist in this decree at all** (it only has 3 articles).
Worse, the criteria those numbers are attached to (bottle-storage separation, fire-prevention
distances, spark-free tools, leak-testing) describe **LPG storage/distribution point safety** — a
different real-world activity than vehicle-fuel conversion, and one this decree simply doesn't
regulate. The file's own storage/safety criteria (8 of 12) already correctly cite **AIM GPL2**
(verified separately, numbers match) for this subject — 21-430/83-496 appears to have been added
on top by mistake, likely because a "GPL" keyword search surfaced it without checking the actual
subject matter.

**The one place 21-430/83-496 might genuinely apply:** `GPL-01-01`/`GPL-01-02` (installer
accreditation) thematically resembles Art. 7 of the real decree (registre de commerce,
qualification certificate, premises ≥60m², equipment list) — but even there the article numbers
cited (3/4/5) are wrong; the real accreditation clause is Art. 7.

**Verdict: this needs a scope decision, not a citation patch.** Recommend: (a) drop
21-430/83-496 from `GPL-02-02`, `GPL-03-01`, `GPL-04-01`, `GPL-04-02` entirely — replace with the
correct AIM GPL2 articles (already verified this session); (b) for `GPL-01-01`/`GPL-01-02`,
either fix to Art. 7 of 83-496/21-430 if the facility really does mean vehicle-conversion
accreditation, or replace with Décret 06-198 + AIM GPL2 Art. 5/Art. 8 if it means storage/
distribution-point licensing. **Someone needs to confirm what `"تركيب GPL/C"` is actually meant
to mean as a real-world activity before this can be fully resolved** — this audit can flag the
mismatch but can't unilaterally decide the intended scope.

### Legacy F3 items (older, still open)
- `BGN-04-06` (Décret 09-19): cited "Articles 4–8"; actual accreditation clause is **Article 2**,
  validity period is **Article 6**. This criterion now has *two* independent citation defects —
  this plus the Loi 01-19 Art. 32 error in F4. Needs a full citation rewrite.
- `BFD-08-01` (Loi 09-03 Art. 19): **Confirmed INCORRECT** — Art. 19 is about the consumer's
  right of withdrawal, not traceability. Needs a correct citation (likely Décret 17-140) or
  `[حكم مهني]` tag.
- `BFD-02-02`: cites Décret 17-140 generically for specific storage clearances (≥15cm floor,
  ≥5cm wall) not found in the decree's actual text. MODIFY.
- `BGN-08-01` / `BGN-08-02`: **RESOLVED** — already fixed in a parallel Perplexity pass (W18),
  now correctly cite Loi 19-02 Art. 5 and Art. 13, matching sibling BGN-08-05.

### Verified correct (positive findings, not exhaustive)
- `BGN-01-01`: Décret 24-196 3-year regularization grace period — confirmed real via Ministry of
  Environment/APS statement. Exact end-date computation still open.
- `BGN-08-05`: Loi 19-02 Art. 5 — confirmed correct.
- `BFD-05-01`: Décret 17-140 Art. 5 confirmed as the actual HACCP obligation article.
- `BFD-04-01`/`BFD-04-02`: cold-chain citation correctly moved off Décret 17-140 Art. 7/8 to a
  separate 2025 arrêté — Art. 24 of 17-140 delegates exact temperatures there. Confirmed sound.
- `facilityCategoriesFull.json`: spot-checked against real Décret 07-144 text — high fidelity.
- Décret 06-198, 07-144, 22-167, 24-196, 09-19, 17-140, 91-05: all confirmed real, correctly
  identified.
- Loi 03-10, Loi 01-19, Loi 90-29: all fully verified as reliable sources (see F4, F5 for detail).
- **GPL-02-01, GPL-02-03, GPL-03-02** (AIM GPL2 "Phase W" claims): all 3 numeric claims
  (ventilation ≥1600cm² × 2 openings; storage max 1400kg; separation 3m/5m at 525kg threshold;
  extinguishers 1×9kg/2×9kg at 3500kg threshold) confirmed to match AIM GPL2 exactly. **Caveat:**
  AIM GPL2 itself is sourced from Scribd, not JORADP, and is self-flagged unverified — so this is
  "internally consistent," not "independently confirmed against official law."

---

## 4. `legal_refs/` — current inventory (Session 10, user now adding PDFs directly)

**Confirmed present and usable (full text, not stubs) as of this session:**
loi-09-03-protection-consommateur.md, loi-03-10-protection-environnement.md,
loi-01-19-gestion-dechets.md, loi-19-02-incendie-panique.md, loi-90-29-urbanisme.md (81 articles,
verified this session), loi-90-11-relations-travail.md, loi-05-12-ressources-en-eau.md,
loi-04-20-risques-majeurs.md, loi-18-11-sante.md (189 KB — large, not yet touched),
decret-17-140-hygiene-alimentaire.md, decret-06-198-etablissements-classes.md, decret-09-19.md,
decret-91-05-hygiene-securite-milieu-travail.md (verified, F3), decret-93-120-medecine-du-travail.md,
decret-22-167-etablissements-classes-modification.md (now full, 28.9 KB),
decret-24-196-etablissements-classes-modification.md (now full),
**decret-06-141-rejets-effluents-liquides.md (now full, 14.7 KB — no longer a stub, NOT YET READ
by this audit — top priority for next session, resolves F7)**,
decret-21-430-gpl-carburant.md (verified, F8), decret-83-496-gpl-carburant.md (verified, F8),
decret-02-427-prevention-risques-professionnels.md (not yet read — needed for BGN-09-02),
decret-76-35-igh-incendie.md (not yet read — needed for BGN-08-03), 4 arrêtés,
aim-gpl2-regles-techniques-securite.md (verified, self-flagged non-JORADP source).

**⚠️ Partial:** decret-07-144-nomenclature-installations-classees.md — rubriques 1243–2922
missing. Rubriques below that range confirmed accurate against facilityCategoriesFull.json.

**Still missing entirely:** Décret 11-125 (drinking water — abattoirCriteria.ts chlorine levels),
Décret 06-138 (industrial air emissions — paintShopCriteria.ts), Décret 04-82 (veterinary
sanitary accreditation — slaughter files), Loi 04-08 (commercial activity conditions), Loi 88-07
(occupational health/safety — cited in gplCriteria.ts and paintShopCriteria.ts).

**docs/legal_sources/ was deleted 2026-08-09** — do not recreate, do not look for sources there.

---

## 5. Legal references — verification tracker

**VERIFIED:** Décret 06-198, 07-144 (partial), 22-167, 24-196, 09-19, 17-140, 91-05, 21-430,
83-496, Loi 03-10, Loi 01-19, Loi 90-29 (all: existence + identity + subject matter). Specific
articles confirmed: Loi 19-02 Art. 5 & 13; Décret 17-140 Art. 5 & 24; Loi 03-10 Art. 41, 44, 54,
56, 58, 62, 82, 84; Loi 01-19 Art. 8, 11, 21; Décret 91-05 Art. 3–4, 9, 13, 15; Loi 90-29 Art. 4,
8, 52, 56/75 (thematic, not all individually cited yet in-app).

**CONFIRMED INCORRECT:** Loi 09-03 Art. 19 (BFD-08-01); Loi 01-19 Art. 32/30/17/34 (F4); Décret
91-05 Art. 14/7/16/9 misapplied across 6 criteria (F3); Loi 03-10 Art. 18 (BGN-08-06) and Art.
15–22 range (BGN-10-01, F5); Loi 90-29 Art. 37 (BGN-02-01); **Décret 21-430 Art. 3/4/5/6/10/15/16
— articles 5/6/10/15/16 don't exist in this decree at all, and the decree itself is very likely
the wrong instrument for most of what it's cited for (F8).**

**UNVERIFIED — DO NOT IMPLEMENT AS VERIFIED LAW:**
- BFD-02-02's 15cm/5cm storage clearance figures (no source found yet)
- Exact end-date of the Décret 24-196 grace period (3 years from which date?)
- Décret 06-198 Art. 20 (cited in a types.ts comment re: 'warning' sanction tier)
- Décret 04-82 (veterinary accreditation) — new instrument, not in legal_refs/ yet
- AIM GPL2's own numbers — internally consistent with the app, but the source itself is
  unverified against official JORADP (Scribd origin)
- GPL-05-01's Loi 03-10 Art. 15-22 range — same fix as BGN-10-01 needed (→ Art. 14-21)

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
### Session 10 (this session): User began manually converting PDFs directly into legal_refs/ (decret-02-427, decret-06-141 [now full], decret-21-430, decret-22-167 [full], decret-24-196 [full], decret-76-35, decret-83-496, loi-18-11 added). Verified Loi 90-29 in full — found the BGN-02-01/02/04 siting-axis items, closing out baseGeneralCriteria.ts's location axis. Audited gplCriteria.ts in full (12/12 criteria) — verified AIM GPL2's numeric claims (all 3 match), and found **F8**, a major likely wrong-decree citation spanning 6 of the file's 12 criteria (Décret 21-430/83-496 is about vehicle-fuel GPL conversion, not LPG storage/distribution — the actual subject of most of this file). Attempted external sourcing of Décret 06-141 (failed — bot-blocked mirrors); user then added it directly to legal_refs/ as full text — not yet read.

**Recommended next session:**
1. **Décret 06-141 is now available in full and unread — highest priority.** Resolves F7's open
   wastewater-unit question (Annex I generic mg/L vs Annex II sector-specific g/tonne) directly,
   and is cited across abattoirCriteria.ts, slaughterhouseSmallCriteria.ts, carWashCriteria.ts,
   mechanicCriteria.ts, marbleCriteria.ts.
2. **F8 (gplCriteria.ts) needs a human scope decision**, not just more auditing — flag to
   whoever owns the roadmap what `"تركيب GPL/C"` is actually meant to mean before patching
   citations there.
3. Décret 76-35 and Décret 02-427 are now available — quick wins to fully close out
   baseGeneralCriteria.ts (BGN-08-03, BGN-09-02), the only two items left in that file.
4. F1, F3, and F8 are the three highest-priority items to hand to implementers — F1 for
   severity (silently wrong checklists in production), F3 for volume (6 confirmed errors), F8
   for breadth (potentially 6/12 criteria in one file citing the wrong law).
5. 16 of 20 criteria files still have zero direct audit attention (only baseGeneralCriteria.ts,
   baseFoodCriteria.ts, gplCriteria.ts are done or near-done; abattoir/slaughterhouse-small/
   carWash/paintShop are partial).
