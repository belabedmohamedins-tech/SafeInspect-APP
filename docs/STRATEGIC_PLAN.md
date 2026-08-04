# SafeInspect — Strategic Plan & Phase Registry

> **Phase numbering lives here only.** Before opening a new phase, read this file, find the highest identifier, use the next one. Never reuse a closed phase letter.

Last updated: 2026-08-04 by Perplexity

---

## Recommended Execution Order

```
J (legal verify Ch3) → K (legal verify Ch7) → L (checklist in app)
→ M (scoring integration) → N (report generation)
→ O (corrective actions) → P (statistics)
```

Phases J and K are legal verification — they can be done in parallel with L if legal uncertainty is flagged clearly in the code.

---

## Phase Registry

### ✅ CLOSED — Phase A: Scoring Engine + Types
**Closed:** 2026-07-30  
**Files:** `scoringUtils.ts`, `statsUtils.ts`, `types.ts`, `useChecklistData.ts`, `test_scoring`  
**Evidence:** Files confirmed present in repo as `.txt` exports. Jest tests exist.  
**Note:** Do not rebuild. If scoring logic needs updating, modify existing files only.

---

### ✅ CLOSED — Phase B: Chapter 1 Wastewater pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter1_Wastewater.md`  
**Evidence:** File confirmed in repo (21,526 bytes).  
**Key legal refs:** Décret 06-141 (discharge limits), Annex I numeric values.

---

### ✅ CLOSED — Phase C: Chapter 2 Solid/Hazardous Waste pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md`  
**Evidence:** File confirmed in repo (19,461 bytes — updated version with Décret 09-19, 04-409, 04-410, 03-478).  
**Key legal refs:** Décret 06-104 (waste list), Décret 09-19 (collector accreditation), Décret 04-409 (transport), Décret 04-410 (treatment acceptance), Décret 03-478 (healthcare 3-stream).

---

### ✅ CLOSED — Phase D: Chapter 3 Fire Safety pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter3_Fire_Safety.md`  
**Evidence:** File confirmed in repo (34,413 bytes).  
**Key legal refs:** Loi 19-02 (ERP/high-rise scope — NOT universal), Décret 09-335 (internal intervention plan).  
**⚠ Warning:** Loi 19-02 scope is facility-type dependent. Phase J must verify applicability per establishment category before hardcoding criteria.

---

### ✅ CLOSED — Phase E: Chapter 4 Food Safety pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter4_Food_Safety.md`  
**Evidence:** File confirmed in repo (15,941 bytes).  
**Key legal refs:** Décret 04-82 (HACCP mandatory for food producers), activity-specific applicability (production vs. retail).

---

### ✅ CLOSED — Phase F: Chapter 5 Occupational Health pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter5_Occupational_Health.md`  
**Evidence:** File confirmed in repo (17,236 bytes).  
**Key legal refs:** Loi 88-07 Art. 12–14 (annual medical exam, occupational disease register).

---

### ✅ CLOSED — Phase G: Chapter 6 Documentation/Licensing pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter6_Documentation_Licensing.md`  
**Evidence:** File confirmed in repo (19,304 bytes).  
**Key scope:** Licensing logic, classified establishment classification codes, facility category/radius/registration data, document verification decision tree.  
**⚠ Warning:** Before touching app code for licensing logic, verify what is already implemented in the repo. This is the most likely area where code is ahead of docs.

---

### ✅ CLOSED — Phase H: Chapter 7 Air Quality pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter7_Air_Quality.md`  
**Evidence:** File confirmed in repo (20,536 bytes).  
**Key legal refs:** Décret 06-138 Annex I (point-source emission limits — activity-specific).  
**⚠ Warning:** Phase K must verify numeric values per sector before these are hardcoded into criteria.

---

### ✅ CLOSED — Phase I: Chapter 8 Site Hygiene/Pest Control pushed to docs
**Closed:** 2026-07-30  
**Files:** `docs/Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md`  
**Evidence:** File confirmed in repo (13,286 bytes).  
**Key legal refs:** Licensed pest control operator requirement (Arrêté phytosanitaire 1995 Art. 3).

---

### 🟡 OPEN — Phase J: LEGAL-VERIFY — Loi 19-02 Scope per Establishment Type
**Priority:** HIGH (blocks Ch3 criteria from being hardcoded in app)  
**Question:** Does Loi 19-02 apply to all classified establishments, or only ERPs / high-rise / residential?  
**Method:** Search JORADP for Loi 19-02 full text. Map each article to establishment categories. Update Ch3 criteria with correct applicability flags.  
**Output:** Updated `docs/Inspection_Manual_Chapter3_Fire_Safety.md` with `[À VÉRIFIER]` tags resolved.  
**Do not close until:** Every criterion in Ch3 has a verified legal basis or is tagged `[SILENCE]`/`[INTL]`.

---

### 🟡 OPEN — Phase K: LEGAL-VERIFY — Décret 06-138 Annex Numeric Values per Activity
**Priority:** HIGH (blocks Ch7 numeric limits from being coded)  
**Question:** What are the exact emission limits per pollutant per activity type in Décret 06-138 Annex I?  
**Method:** Search JORADP for Décret 06-138 full text and Annex I table. Map each limit to the correct activity/sector code.  
**Output:** Updated `docs/Inspection_Manual_Chapter7_Air_Quality.md` with verified numeric values.  
**Do not close until:** Annex table is fully verified and numeric values are sourced from JORADP, not secondary sources.

---

### 🔴 OPEN — Phase L: Checklist Criteria Implementation in App
**Priority:** CRITICAL (core app functionality)  
**Depends on:** J and K (legal verification), or at minimum tagging unverified criteria clearly  
**Scope:**
- Wire all 8 chapter criteria into the app checklist engine
- Each criterion must carry: id, title, legal_ref, method, evidence_type, severity, weight, applicable_activity_codes, conditional_flag
- Do not copy-paste raw chapter text — parse structured data from the `.md` files

**Pre-implementation checklist:**
1. Read current checklist data structure in app code
2. Check if any criteria from any chapter are already loaded
3. If yes, close those sub-items and do not rebuild
4. Map chapter structure to app data model
5. Implement missing criteria only

**Files to inspect first:** `useChecklistData.ts` (already in repo), `types.ts`  
**Test:** Jest for checklist loading, TypeScript check for criterion object shape.

---

### 🔴 OPEN — Phase M: Scoring Integration with Criteria Weights
**Priority:** HIGH  
**Depends on:** Phase L  
**Scope:**
- Assign final weight values to each criterion
- Integrate with `scoringUtils.ts`
- Verify scoring output matches the Scoring System doc (`Scoring System.docx` in Space files)
- Run `test_scoring` suite after changes

**Pre-implementation checklist:**
1. Read `scoringUtils.ts` current implementation
2. Read `Scoring System.docx` for the intended weight/risk model
3. Map criteria weights from manual chapters
4. Update scoring engine only where weights are missing or wrong

---

### 🔴 OPEN — Phase N: Report Generation Module
**Priority:** MEDIUM  
**Depends on:** Phase M  
**Scope:**
- Generate inspection report from completed checklist + scoring
- Format: PDF or structured JSON exportable to PDF
- Include: facility info, inspector, date, criteria results, score, decision, observations
- Algerian regulatory report format if one exists (check JORADP for required formats)

---

### 🔴 OPEN — Phase O: Corrective Actions Tracking
**Priority:** MEDIUM  
**Depends on:** Phase N  
**Scope:**
- Link non-conformities from checklist to corrective action items
- Each corrective action: criterion ref, description, deadline, responsible party, status
- Reinspection trigger when all corrective actions are closed

---

### 🔴 OPEN — Phase P: Statistics / Dashboard Module
**Priority:** LOW (after core inspection cycle is complete)  
**Depends on:** Phases N and O  
**Scope:**
- Aggregate inspection results across facilities and time periods
- Key metrics: compliance rate per domain, recurring non-conformities, score trends
- Use `statsUtils.ts` as foundation
- Verify `statsUtils.ts` current implementation before extending

---

## Legal Quick-Reference (Expanded)

| Topic | Instrument | Article/Annex | Value/Obligation | Source status |
|---|---|---|---|---|
| Classified establishment categories | Décret 06-198 | Art. 2–5 | 3 categories (1st=dangerous, 2nd=insalubre, 3rd=incommodant) | Verified |
| Wastewater to sewer | Décret 06-141 | Art. 3–7 + Annex | pH 6.5–8.5, SS ≤600 mg/L, DCO ≤2000 mg/L | Verified |
| Industrial wastewater to environment | Décret 06-141 | Annex I | Stricter limits than sewer — verify per pollutant | Verified |
| Solid waste classification list | Décret 06-104 | Annexes | Official Algerian waste codes | Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | Wali-level accreditation required | Verified |
| Waste transport | Décret 04-409 | Art. 5–12 | ADR-equivalent Algerian rules | Verified |
| Waste treatment acceptance | Décret 04-410 | Art. 6–9 | Acceptance protocol at treatment site | Verified |
| Healthcare waste — 3 streams | Décret 03-478 | Art. 3 | Infectious / sharp / ordinary | Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 2 | ERPs, high-rise, very-high-rise, residential ONLY | ⚠ Needs facility-type mapping (Phase J) |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | Required for classified establishments | Verified |
| Air emissions — point source | Décret 06-138 | Annex I | Activity-specific numeric limits | ⚠ Annex values need per-sector verification (Phase K) |
| Food safety / HACCP | Décret 04-82 | Art. 5 | Mandatory for food producers | Verified |
| Occupational medical surveillance | Loi 88-07 | Art. 12–14 | Annual exam + disease register | Verified |
| Pest control — licensed operator | Arrêté phytosanitaire 1995 | Art. 3 | Licensed operator required | Verified |

---

## Dangerous Anti-Patterns (for any agent reading this)

1. **Do not re-implement a phase because a doc says it is open** — always check the code first.
2. **Do not invent legal articles or numeric limits** — tag `[À VÉRIFIER]` and open a LEGAL-VERIFY phase.
3. **Do not use Décret 22-167 for equipment maintenance** — it does not cover this topic.
4. **Do not treat old AI audit reports as ground truth** — compare each recommendation against the repo.
5. **Do not hardcode numeric limits from Ch7** until Phase K verifies them against JORADP.
6. **Do not apply Loi 19-02 universally** until Phase J maps it to establishment types.
7. **Do not push without running `npx tsc --noEmit` and Jest** for affected files.
