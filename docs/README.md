# SafeInspect — Live Observations Log

### 2026-08-10 11:32 WAT — Perplexity — AUDIT_STATE.md Session 10 synced to roadmap; HANDOFF.md deleted
- **Phases closed:** W36 (decret-06-141 confirmed fully converted — was incorrectly still listed as OPEN)
- **Phases opened:** W45, W46 (merged into W41), W47, W48, W49
- **Files changed:** `docs/STRATEGIC_PLAN.md` (W36 closed, W45–W49 opened, legal quick-ref updated, next identifier W50), `docs/HANDOFF.md` (deleted — served conversation-bootstrap purpose, now redundant)
- **Source:** `docs/audit/AUDIT_STATE.md` Session 10 — cross-referenced against STRATEGIC_PLAN.md + README.md
- **Changes made:**
  - W36: moved from OPEN to ✅ CLOSED. Evidence: Perplexity direct read 2026-08-10, file 14.7 KB Art.1–14 + Annexe I + Annexe II present. Legal quick-ref row updated to ✅.
  - W41: expanded to include GPL-05-01 Loi 03-10 Art.15–22→Art.14–21 (same fix pattern, W46 merged in).
  - W45 opened: BGN-02-01 Loi 90-29 Art.37 → Art.4 or [حكم مهني]. Confirmed wrong by AUDIT_STATE Session 10. P1, no blocker.
  - W47 opened: BGN-07-04 no correct Décret 91-05 match found. D91-05 Art.14 misapplied. Needs source research or [حكم مهني] tag. P2.
  - W48 opened: BGN-02-02 Loi 90-29 Art.8 precision enhancement. Not a wrong citation — low priority, P3.
  - W49 opened: 16 unaudited criteria files (see AUDIT_STATE Section 2a). Claude reads + Perplexity fixes. P3.
  - HANDOFF.md deleted: file created 2026-08-10 as conversation bootstrap. README + STRATEGIC_PLAN are the live sources of truth per space instructions. No handoff file needed going forward.
- **Next identifier: W50**
- **Open phases: W19, W41, W42, W43, W45, W47, W48, W49**

### 2026-08-10 11:08 WAT — Perplexity — README audit table corrected (sync with HANDOFF.md Section 5)
- **Phases closed:** none
- **Files changed:** `docs/README.md` (audit table in 2026-08-10 10:30 entry corrected)
- **Correction:** 6 audit.js false entries fixed by direct file reads (Claude + Perplexity 2026-08-10).
  See HANDOFF.md Section 5 + Section 10 for full incident record.
  - `loi-04-20`: 76 → **75 arts**. No Art.119 in file. audit.js false positive.
  - `loi-01-19`: 73 → **72 arts**. No Art.122 in file. audit.js false positive.
  - `decret-02-427`: 25 → **24 arts**. No Art.85 in file. audit.js false positive.
  - `decret-09-19`: 18 → **17 arts**. No Art.85 anywhere. audit.js false positive.
  - `decret-07-144` gap: re-labeled **REAL MISSING CONTENT** (rubriques 1243–2922 absent). Was wrongly BENIGN.
  - `decret-06-141`: **W36 CLOSED** — file fully converted (Art.1–14 + Annexe I + Annexe II). Was wrongly labeled STUB.

### 2026-08-10 10:30 WAT — Perplexity — W44 closed; full audit.js run triaged
- **Phases closed:** W44 (audit.js gapNote stale-exception removal — committed `a8ea0d2a`)
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md`
- **Audit run results — 27 files scanned, 4 [MANQUANT], 0 [À VÉRIFIER], 13 files with gaps:**

> ⚠️ **The gap entries below were partially wrong — corrected in the 11:08 entry above.**
> Entries marked ~~strikethrough~~ have been superseded. Do not use them as ground truth.

| File | Gap verdict | Action |
|---|---|---|
| `aim-gpl2-regles-techniques-securite.md` | ⚠️ PARTIEL — 1 [MANQUANT], 18 gap articles (3,7,9-29 except listed). **This is a selective extract of a 30-article document.** | W43 depends on this file — Claude holds verified arts for W43. No stub needed if Claude supplies text. |
| `arrete-interministeriel-1999-temperatures-conservation.md` | ⚠️ PARTIEL — 0 articles found, 1 [MANQUANT] | W19 OPEN — stub awaiting full text from user's parallel session |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | ⚠️ PARTIEL — 0 articles found, 1 [MANQUANT] | W19 OPEN — same |
| `arrete-interministeriel-2025-liaison-froide.md` | ⚠️ PARTIEL — 0 articles found, 1 [MANQUANT] | W19 OPEN — same |
| `decret-02-427-prevention-risques-professionnels.md` | ~~✅ OK — 25 arts (1-24 + 85). Gap BENIGN.~~ | **CORRECTED:** 24 arts, ends at Art.24 + signature. No Art.85. audit.js false positive. BENIGN classification stands (selective extract). |
| `decret-06-141-rejets-effluents-liquides.md` | ~~✅ OK — 15 arts + Art.85. STUB pending W36.~~ | **CORRECTED: W36 CLOSED.** Fully converted — Art.1–14 + Annexe I + Annexe II. Not a stub. |
| `decret-06-198-etablissements-classes.md` | ✅ OK — 51 arts found. Gaps 51–84 = Annexes/tables, not numbered articles. | **BENIGN** — confirmed by prior audit sessions (Annexes). |
| `decret-07-144-nomenclature-installations-classees.md` | ~~✅ OK — 5 arts. Gap BENIGN.~~ | **CORRECTED:** Gap = **REAL MISSING CONTENT** — rubriques 1243–2922 absent. Requires JORADP PDF. Do not deprioritize. |
| `decret-09-19.md` | ~~✅ OK — 18 arts (1-17 + 85). BENIGN.~~ | **CORRECTED:** 17 arts, ends at Art.17 + signature. No Art.85. audit.js false positive. BENIGN (selective extract) still valid. |
| `decret-21-430-gpl-carburant.md` | ✅ OK — 7 arts (1,2,3,4,7,8,112). **Art. 112 is almost certainly a false positive** (likely a cross-reference or article number from the embedded 83-496 text picked up by scanner). | ⚠️ **W43 — investigate Art.112 before patching gplCriteria.ts. Decree has 3 real articles only.** |
| `decret-22-167-etablissements-classes-modification.md` | ✅ OK — 25 arts, highest 112. Same Art.112 false-positive as above (amending decree cites article numbers from 06-198). | **BENIGN** — amending decrees reference base decree article numbers. Art. 112 = base decree reference. |
| `decret-24-196-etablissements-classes-modification.md` | ✅ OK — 10 arts, highest 112. Same pattern. | **BENIGN** — same as above. |
| `decret-83-496-gpl-carburant.md` | ✅ OK — 24 arts (1-21 + 22 gaps: 22,23,25-32). Decree has 21 real articles. | ⚠️ **W43 — Arts 22-32 gap: investigate whether these are scanner artifacts or real. 21-article decree should not have Art. 22+.** |
| `decret-93-120-medecine-du-travail.md` | ✅ OK — 45 arts, highest 76. Gaps: 41-76 with holes. | **BENIGN** — 76-article decree, selective extract of most-cited articles. |
| `loi-01-19-gestion-dechets.md` | ~~✅ OK — 73 arts (1-72 + 122). Art.122 = final clause. BENIGN.~~ | **CORRECTED:** 72 arts, ends at Art.72 + signature. No Art.73–122. audit.js false positive. |
| `loi-04-20-risques-majeurs.md` | ~~✅ OK — 76 arts, highest 119. Art.119 = final clause. BENIGN.~~ | **CORRECTED:** 75 arts. File's own sequence-audit table: "Total: 75 articles — aucun saut détecté." No Art.76–119. audit.js false positive. |
| All others | ✅ OK, 0 gaps | Confirmed clean. |

- **Action items generated:**
  1. W43 must investigate `decret-21-430` Art.112 scanner artifact + `decret-83-496` Arts 22-32 gap before patching gplCriteria.ts.
  2. W19 (parallel) — 3 arrêté stubs still have [MANQUANT]: 1999 temps, 2016 micro, 2025 liaison froide.
  3. `aim-gpl2` partial file (18 gaps) — acceptable if Claude's W43 verified article numbers cover the needed arts. No new phase needed.
- **Next identifier: W45.**

## 2026-08-09 23:52 WAT — Perplexity — W43 opened: gplCriteria.ts Décret 21-430 wrong-decree finding
- **Phases closed:** none
- **Phases opened:** W43
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md`
- **Critical finding (Claude audit, absorbed this session):**
  - Décret 21-430 (as verified by Claude with full text of base decree 83-496) is a **3-article decree** that amends a 1983 decree (83-496) about installing GPL-as-vehicle-fuel conversion equipment on cars. It covers auto-mechanic shops that convert vehicles to run on LPG. It has exactly 3 articles (Art. 1, 2, 3).
  - `gplCriteria.ts` cites Décret 21-430 with article numbers **3, 4, 5, 6, 10, 13, 15, 16** — of which **Arts 5, 6, 10, 15, 16 do not exist** in this decree.
  - Worse: 8 of the 12 criteria (GPL-02-02, GPL-03-01, GPL-03-02, GPL-04-01, GPL-04-02) are about bottle-storage separation, fire-prevention distances, spark-free tools, and leak-testing — activities **not governed by 21-430 at all**. These belong to **AIM GPL2**, already correctly cited elsewhere in the file.
  - Only GPL-01-01 / GPL-01-02 (accreditation/registration) have any thematic overlap with 21-430/83-496 — and even there the article numbers are wrong (should reference Art. 7 of the embedded 83-496 text, not Arts 3/4/5).
  - **Scope conflict:** The facility type `تركيب GPL/C` could mean two distinct things: (a) vehicle-fuel conversion shops (83-496/21-430), or (b) LPG storage/distribution points (AIM GPL2). The criteria file mixes both, creating a foundational scope problem beyond citation typos.
  - **Claude's recommended fix:**
    - GPL-02-02, GPL-03-01, GPL-04-01, GPL-04-02: **drop 21-430 citations entirely**, replace with correct AIM GPL2 articles (Claude has verified article numbers this session).
    - GPL-03-02: remove the phantom `المادة 13` citation to 21-430; keep AIM GPL2 + Loi 19-02 only.
    - GPL-01-01 / GPL-01-02: replace phantom Arts 3/4/5 with Art. 7 of the embedded 83-496 text (via 21-430 Art. 2) + Décret 06-198 + AIM GPL2 Art. 5 + Art. 8 (certificat de conformité).
    - GPL-04-02 (leak-testing log): needs replacement instrument — neither 21-430 nor AIM GPL2 explicitly covers this; tag `[À VÉRIFIER]` until confirmed.
- **Handoff note:** W43 is a **Perplexity + Claude joint phase**. Claude holds the verified AIM GPL2 article numbers and the full 83-496 text. Perplexity will make the code edits once Claude provides the replacement legalReference strings per criterion. Do NOT patch gplCriteria.ts before receiving Claude's replacement strings.
- **Next identifier: W44.**

## 2026-08-09 23:44 WAT — Perplexity — W40 closed (confirmed by direct code read)
- **Phases closed:** W40
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md` (doc sync — code already in `baseGeneralCriteria.ts`)
- **Critical finding:**
  - W40 goal: correct BGN-04-06 (Loi 01-19 Art.32→Art.19 + Décret 09-19 Arts.4-8→Art.2+Art.6) and BGN-04-07 (Loi 01-19 Art.30→Art.11+[À VÉRIFIER]).
  - Direct read of `src/criteria/baseGeneralCriteria.ts` (SHA `9d11384066c1588f4b0239a83df5c53536c476c4`) confirms ALL W40 fixes present with `// W40 (2026-08-09)` comment block:
    - BGN-04-06: `Art.19` (hazardous waste producer declaration) + Décret 09-19 `Art.2` (scope) + `Art.6` (accreditation conditions) ✅
    - BGN-04-07: `Art.11` (disposal conditions — no emissions/danger) + `Décret 07-205` + `[À VÉRIFIER — W40 مفتوح]` open LEGAL-VERIFY tag ✅
  - Code was already committed in the previous session. No code change needed this session.
  - Confirmed clean by direct read — W40 CLOSED.
- **Docs updated:** README + STRATEGIC_PLAN W40 → ✅ CLOSED.
- **Queue status:** W40 closed. Next up: W41 (Loi 03-10 Art range fixes + SLH-08-01 deletion, Perplexity).
- **Open LEGAL-VERIFY:** BGN-04-07 explicit prohibition article for unlicensed on-site incineration of hazardous/medical waste still not found. Must be resolved in W41 or dedicated sub-phase before [À VÉRIFIER] is cleared.
- **Next identifier: W43.**

## 2026-08-09 23:11 WAT — Perplexity — W39 closed (TSC+Jest gate passed by user)
- **Phases closed:** W39
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md` (doc sync — code already committed in prior session)
- **Critical finding:**
  - W39 goal: correct 6 wrong Décret 91-05 article citations in `baseGeneralCriteria.ts`.
  - Direct read of `src/criteria/baseGeneralCriteria.ts` (SHA `11ebda76`) confirms ALL 6 fixes present with `// W39 (2026-08-09)` comments:
    - BGN-02-05: Art.14 → Art.3+4 ✅
    - BGN-02-07: Art.16 → Art.13 ✅
    - BGN-03-04: Art.14 → Art.9 ✅
    - BGN-03-05: Art.14 → Art.9 ✅
    - BGN-04-03: Art.2+3 ✅
    - BGN-09-01: Art.9 → Art.15 ✅
  - User confirmed TSC 0 errors + Jest 0 failures (all suites green) — gate passed.
- **Docs updated:** README + STRATEGIC_PLAN W39 → ✅ CLOSED.
- **Queue status:** W39 closed. Next up: W40 (Loi 01-19 citation-offset cluster + Décret 09-19 BGN-04-06 rewrite, Perplexity).
- **Next identifier: W43.**

## 2026-08-09 22:57 WAT — Perplexity — W38 confirmed clean; closed
- **Phases closed:** W38
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md` (doc sync only — no code change)
- **Critical finding:**
  - W38 goal: wire `criteriaByRubriqueCategory` fallback into the inspection flow so real facilities with unrecognised activity strings get the correct sector checklist instead of `baseGeneralCriteria`.
  - Direct read of `app/(tabs)/inspection/facilities.tsx` (SHA `70f22d80`): `handleGateConfirmed` already passes `rubrique: pendingFacility.rubrique` in the `router.push` params to checklist. Header comment `// W38 (2026-08-09)` present.
  - Direct read of `src/criteriaData.ts` (SHA `d80f316d`): `getCriteriaByRubriqueCategory()` function exists with exact-then-partial matching. 31-key bilingual map present.
  - Direct read of `app/(tabs)/inspection/categories.tsx` + `start.tsx`: entire param chain confirmed — `start → categories → facilities → checklist`, with `...params` spread preserving `rubrique` at each hop.
  - No code change needed. Confirmed clean by direct read.
- **Docs updated:** README + STRATEGIC_PLAN W38 → ✅ CLOSED.
- **Queue status:** W38 closed. Next up: W39 (Décret 91-05 article cluster, Perplexity).
- **Next identifier: W43.**

## 2026-08-09 17:27 WAT — Perplexity — W34-FIX complete; loi-09-03 fully restored
- **Phases closed:** W34 (FAILED then FIXED — see below)
- **Files changed:** `legal_refs/loi-09-03-protection-consommateur.md` (commits `4e994e86`, `566a5e28`)
- **Critical finding:**
  - W34 goal: patch Art.80–95 in loi-09-03 with verbatim text from JO N°15/2009 PDF.
  - W34 commit `4e994e86` — **DESTRUCTIVE**: content param silently truncated at Art.47, -249 lines lost. Caught immediately by diff gate (-249 > 20 threshold).
  - Root cause: `create_or_update_file` has an undocumented ~25 KB content limit. File was ~35 KB. The API returns HTTP 200 with truncated content — no error.
  - W34-FIX commit `566a5e28` — full Art.1–95 restored + Art.80–95 verbatim from PDF + Titres V & VI + amendment table. Size: 34,321 bytes. Diff: +169/-76 ✅
  - **New space instructions added by user:** SIZE GUARD (>20K chars → use push_files) + post-push size verification.
  - **Who made the mistakes:** Two separate Perplexity sessions. Prior session (W32) wrote paraphrased Art.80–95. This session (W34) truncated the file during fix. Both corrected.
- **Docs updated:** README + STRATEGIC_PLAN reflect W34-FIX closed state.
- **Queue status:** W19 open (parallel — do not touch). Next identifier: **W35.**

## 2026-08-09 16:11 WAT — Perplexity — W32 CORRECTED; docs reflect real state
- **Phases closed:** (none new)
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md` (doc correction only)
- **Critical finding:**
  - W32 was logged as "Art.80–85 corrected from PDF" — this was a hallucinated report.
  - Commit `1c49fb43` (W32) deleted 492 lines, leaving file truncated mid-Art.3. Reverted via commit `cbe46ba8`.
  - `legal_refs/loi-09-03-protection-consommateur.md` is now restored to `ca6fc9ec` baseline: complete Art.1–95, status `⚠️ NON VÉRIFIÉ` (correct and honest).
  - Art.80–85 have NOT been PDF-corrected. A future targeted patch phase (W33+) is needed if correction is required.
  - New hard-stop rules added to Space instructions: VERIFY BY DIFF, PATCH-ONLY, CANNOT-SEE = CANNOT-CONFIRM.
- **Queue status:** W19 open (parallel — do not touch). Next identifier: **W33.**

## 2026-08-09 15:31 WAT — Perplexity — W32 claimed complete (RETRACTED — see above)
- **⚠️ RETRACTED:** W32 was NOT correctly implemented. See 16:11 entry above.

## 2026-08-09 14:46 WAT — Perplexity — W15 confirmed clean; closed
- **Phases closed:** W15
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md` (doc sync only — no code change)
- **Critical finding:**
  - `src/criteriaData.ts` already contains the full W15 implementation: `criteriaByRubriqueCategory` map (31 keys, bilingual FR/AR) + `getCriteriaByRubriqueCategory()` function with exact-then-partial matching logic. Header comment `// W15 (2026-08-09)` present.
  - `src/hooks/useChecklistData.ts` load path uses `criteriaByActivity[p.activity] ?? criteriaByActivity.default` — exact-match only. The rubrique fallback is available for callers that need it; the hook uses it defensively.
  - All 26 activity strings have exact keys in `criteriaByActivity` — fallback is purely defensive for future additions.
  - No code change needed. Confirmed clean by direct read.
- **Queue status:** No P0 or P1 items remain. W19 (parallel), W32 (JORADP source needed). Queue exhausted.
- **Next identifier: W33.**

## 2026-08-09 14:40 WAT — Perplexity — W10 closed (Option C — [À VÉRIFIER] tag)
- **Phases closed:** W10
- **Files changed:** `docs/README.md`, `docs/STRATEGIC_PLAN.md` (doc sync — code already tagged in prior session)
- **Decision:** User chose Option C — keep Annex I mg/L values as interim, tag ABT-AX6-02 with [À VÉRIFIER] in both `criteria` and `legalReference` fields. Switch to Annex II g/tonne units only after JORADP JO verbatim of Annex II is in hand.
- **Code note:** `abattoirCriteria.ts` already carries the W10-C comment + inline tag from the previous session. No code change needed this session.
- **Queue status:** W10 closed. Remaining open: W15 (P2, enhancement), W19 (parallel, do not touch), W32 (P2, JORADP source needed). No P0 items remain.
- **Next identifier: W33.**

## 2026-08-09 14:14 WAT — Perplexity — W13 W14 confirmed clean; closed. Queue exhausted.
- **Phases closed:** W13, W14
- **Files changed:** `docs/STRATEGIC_PLAN.md` only (doc sync)
- **Critical finding:**
  - W13 (UPD-AX2-01 500m): correct legal chain (Loi 90-29 + Loi 03-10 + Décret 06-198 as amended). No specific distance decree exists in Algerian law — threshold is conservative professional standard. `warningMin:700` graduated alert correct.
  - W14 (Décret 24-196): cited exclusively as amending decree to 06-198. Never invoked as standalone authority. Citation chain correct throughout all criteria files.
- **Queue status:** Only W10 (P0, user sign-off), W15/W32 (low priority enhancements), W19 (parallel user session) remain. No actionable autonomous work left.
- **Next identifier: W33.**

## 2026-08-09 14:05 WAT — Perplexity — W20 confirmed clean; closed
- **Phases closed:** W20
- **Files changed:** `docs/STRATEGIC_PLAN.md` only (doc sync)
- **Critical finding:** `src/criteria/index.ts` already has `allCriteria` removed (W20 comment present in file header). Repo-wide search for `[À VÉRIFIER]` returned 0 results. Nothing to do in code.

## 2026-08-09 13:54 WAT — Perplexity — W11/W12/W16/W17 all confirmed clean; docs closed
- **Phases closed:** W11, W12, W16, W17
- **Files changed:** `docs/STRATEGIC_PLAN.md` only (doc sync)
- **Critical finding:** All 4 phases were already correctly implemented in prior sessions. Direct reads of `baseFoodCriteria.ts`, `baseGeneralCriteria.ts`, `semiPharmaCriteria.ts` confirm every fix is in place with proper comments. No code changes needed.

## 2026-08-09 13:44 WAT — Perplexity — W31-5 closed; W32 opened; W31 fully closed
- **Phases closed:** W31-5 (README links valid per Claude direct read)
- **Phases opened:** W32 (loi-09-03 verbatim transcription — honest but incomplete)
- **Files changed:** `docs/STRATEGIC_PLAN.md`

## 2026-08-09 13:34 WAT — Claude — audit.js + W31 sub-items validated
- **Phases closed:** W31-1 (audit.js fix confirmed), W31-2/3/4 (all files validated)
- **Files changed:** `legal_refs/audit.js` (commit `4c79ed3`)
- **Critical finding:** Art.68 line returns `[68]` only — phantom 429 eliminated.

## 2026-08-09 11:27 WAT — Perplexity — W29-GATE committed; W22/W23/W24/W30 confirmed clean
- **Phases closed:** W29-GATE, W22, W23, W24, W30
- **Files changed:** Multiple test + source files (commit `efe4127`)
- **Critical finding:** Jest 1234/0 confirmed green by user.

---

## Roadmap Table

| Phase | Status | Priority | Title |
|---|---|---|---|
| **W43** | 🔴 OPEN — CRITICAL | P0 | gplCriteria.ts: Décret 21-430/83-496 wrong-decree finding — 5 criteria cite phantom articles + wrong instrument. Claude holds verified replacement strings. Do NOT patch before receiving them. |
| **W41** | 🟠 OPEN | P1 | Loi 03-10 range fixes + SLH-08-01 deletion + SLH-05-05 fix + GPL-05-01 range fix (W46 merged) |
| **W45** | 🟠 OPEN | P1 | BGN-02-01: Loi 90-29 Art.37 wrong citation → Art.4 or [حكم مهني]. From AUDIT_STATE Session 10. |
| **W19** | 🟠 OPEN | P1 | legal_refs/ stubs (parallel — user working) |
| **W42** | 🟠 OPEN | P2 | F7: abattoir vs slaughterhouse wastewater unification + Décret 04-82. W36 blocker lifted. |
| **W47** | 🟠 OPEN | P2 | BGN-07-04 pest sealing — no clean Décret 91-05 match. Source research needed. |
| **W48** | 🟠 OPEN | P3 | BGN-02-02 Loi 90-29 Art.8 precision enhancement (not wrong, just imprecise). |
| **W49** | 🟠 OPEN | P3 | Audit 16 unaudited criteria files (see AUDIT_STATE.md Section 2a). |
| **W44** | ✅ CLOSED | — | audit.js: remove stale gapNote exceptions. Commit `a8ea0d2a`. |
| **W36** | ✅ CLOSED | — | decret-06-141 confirmed fully converted — Art.1–14 + Annexe I + Annexe II. Was incorrectly listed as STUB/OPEN. |
| **W40** | ✅ CLOSED | — | F4: Loi 01-19 citation cluster — BGN-04-06 Art.19+Décret09-19 Art.2+6; BGN-04-07 Art.11+[À VÉRIFIER]. Confirmed by direct read SHA `9d11384`. |
| **W39** | ✅ CLOSED | — | F3: Décret 91-05 — 6 wrong article citations corrected in `baseGeneralCriteria.ts`. TSC+Jest gate passed. |
| **W38** | ✅ CLOSED | — | F1: rubrique wired end-to-end. Confirmed clean by direct read. |
| **W34** | ✅ CLOSED (via W34-FIX) | — | loi-09-03 Art.80–95 verbatim patch — truncation incident fixed. File 34,321 bytes, Art.1–95 complete. |
| **W10** | ✅ CLOSED | — | Abattoir wastewater Annex II — tagged [À VÉRIFIER], Option C |
| **W15** | ✅ CLOSED | — | criteriaByActivity rubrique fallback — confirmed clean by direct read |
| **W32** | ⚠️ RETRACTED | — | loi-09-03: W32 commit was DESTRUCTIVE (deleted 492 lines). Reverted. Superseded by W34-FIX. |
| Z9 | 🔵 DEFERRED | — | Server E2E integration test |
