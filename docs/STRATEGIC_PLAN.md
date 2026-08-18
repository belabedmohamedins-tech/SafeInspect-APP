# SafeInspect — Strategic Plan & Phase Registry

> Single source of truth for phase numbering and execution order.
> Read this file before opening any new phase.
> Next phase identifier: **W86**

---

## Phase Registry

### ✅ ARCHIVED — Phases A → W59 (closed 2026-07-30 → 2026-08-16)

<details>
<summary>Click to expand archived phases (A–W59)</summary>

| Phase | Title | Closed |
|---|---|---|
| A | Scoring engine + types | 2026-07-30 |
| B–I | Inspection Manual Ch1–Ch8 pushed to docs | 2026-07-30 |
| L | Criteria implementation (20 files in src/criteria/) | 2026-08-04 |
| M | Scoring integration with criteria | 2026-08-04 |
| N | Report generation — pdfService.ts (Arabic RTL) | 2026-08-04 |
| O | Corrective actions tracking | 2026-08-04 |
| P | Statistics / dashboard module | 2026-08-04 |
| Q-1 | Lifecycle audit — checklist.tsx + start.tsx | 2026-08-04 |
| Q | UI screens — Reinspection screen | 2026-08-04 |
| R | Jest + smoke tests — 119/0 green | 2026-08-06 |
| S | Legal verify — Loi 19-02 fire safety scope | 2026-08-04 |
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 |
| U | UX polish — end-to-end inspector flow | 2026-08-04 |
| V | TypeScript zero-error pass | 2026-08-05 |
| W | Legal document verification (5 source gaps) | 2026-08-06 |
| X | i18n screen wire-up (5 screens) | 2026-08-06 |
| Y | Air-emissions criteria — 5 factory types | 2026-08-06 |
| Z | Fix wrong Décret 22-167 citation — UAB-AX6-01 | 2026-08-06 |
| Z2 | Fix wrong 85 dB noise citation — UAB-AX7-07 | 2026-08-06 |
| Z3 | Resolve 3 duplicate license criteria | 2026-08-06 |
| Z4 | Fix PRD-02-01 missing numericField | 2026-08-06 |
| Z5 | SQLite repository swap — 5 repositories | 2026-08-06 |
| Z6 | Décret 09-19 rollout | 2026-08-06 |
| Z7 | facilityCategoriesFull.json domain review | 2026-08-06 |
| Z8 | BGN-03-06 septic pumping unverified figures removed | 2026-08-06 |
| Z10 | AsyncStorage fallback removal | 2026-08-06 |
| Z10-FIX | Test drift fix | 2026-08-06 |
| Z11 | Wire rubrique into DB + screens | 2026-08-06 |
| Z12 | Audit Findings Closure (F-01 to F-18) | 2026-08-06 |
| W1 | getDb() race guard + SyncService + serverAuth Babel fix | 2026-08-07 |
| W2 | Checklist chevron direction bug fix | 2026-08-07 |
| G18 | Severity + Category types widened | 2026-08-07 |
| W4 | Checklist sections start collapsed | 2026-08-08 |
| W5 | TSC fix — 'critical' in SEVERITY maps | 2026-08-08 |
| W6–W9 | HACCP / BGN / abattoir citations confirmed clean | 2026-08-08 |
| W11–W17 | BGN/BFD/GAZ citations confirmed | 2026-08-09 |
| W18 | BGN-08-01+02 Loi 19-02 Art.5+13 | 2026-08-08 |
| W19 | legal_refs 34/34 VÉRIFIÉ | 2026-08-11 |
| W19-CODE | baseGeneralCriteria 8 wrong refs | 2026-08-08 |
| W20 | 0 [À VÉRIFIER] in codebase | 2026-08-09 |
| W21 | BAK-10-10 decree date corrected | 2026-08-08 |
| W22 | F-11: immutability (save()) → W52 | 2026-08-09 |
| W23 | F-18: local approval workflow → W53 | 2026-08-09 |
| W24 | F-19: audit log tamper protection — clean | 2026-08-09 |
| W25–W26 | PHANTOM — files do not exist | 2026-08-08 |
| W27 | F-14: statusUtils.ts labels+colors | 2026-08-08 |
| W28 | F-09: AppState autosave | 2026-08-08 |
| W29-GATE | Jest gate fixes | 2026-08-09 |
| W30 | F-20: decisionSupport.ts coverage → W56 | 2026-08-09 |
| W31-1–5 | legal_refs cross-ref, splits, tags | 2026-08-09 |
| W36 | decret-06-141 converted | 2026-08-10 |
| W38–W40 | F1/F3/F4 fixes | 2026-08-09 |
| W41–W50 | BGN/SLH/GPL legal fixes + CLEANUP_LOG | 2026-08-10 |
| W49 | 11 criteria files confirmed clean | 2026-08-11 |
| W52 | F-11: INSPECTION_LOCKED on delete/deleteMany/clear | 2026-08-10 |
| W53–W56 | F-18/F-14/F-17/F-20 confirmed clean | 2026-08-11 |
| W57 | semiPharmaCriteria food-decree fix | 2026-08-11 |
| W57-TSC | InspectionRepository overhaul | 2026-08-11 |
| W58 | BAK-10-12 Décret 76-04 → Loi 19-02 | 2026-08-11 |
| F-01 | .env gitignore clean | 2026-08-11 |
| W59 | Large-file audit (SUPERSEDED by W60) | 2026-08-16 |

</details>

---

### ✅ CLOSED — Recent Phases (W60 → W85)

| Phase | Title | Closed | Evidence |
|---|---|---|---|
| **W60** | loi-18-11-sante split 3 parties | 2026-08-16 | Commit `698a793` |
| **W61** | Server routes mounted + approval routes | 2026-08-16 | 10/10 PASS. Commits: `13b750a`, `24270ca`, `0a27026` |
| **W62–W63** | Route path + approval ID — clean | 2026-08-16 | Direct reads |
| **W64** | Sync schema clean | 2026-08-17 | Direct read |
| **W65** | Backup/restore fixed | 2026-08-17 | BackupService + InspectionRepository |
| **W66–W67** | Integrity + photo — clean | 2026-08-17 | Direct reads |
| **W68** | PIN lockout secure storage fixed | 2026-08-17 | AuthRepository secureGet/Set/Delete |
| **W69–W70** | CAP + PDF — clean | 2026-08-17 | Direct reads |
| **W71** | Planning UI + PriorityWidget | 2026-08-17 | TSC 0 + Jest green. Commits `c178a6c`, `c1b9d91` |
| **W72** | Dead settings toggles + notification centre | 2026-08-17 | TSC 0 + Jest green. Commit `9b42f67` |
| **W73** | Agenda facility mismatch | 2026-08-17 | PHANTOM — already guarded |
| **W74** | Server hardening: rate-limit login + batch guard | 2026-08-17 | TSC 0 + Jest 10/10. Commit `33dc3b8` |
| **W75** | EIE article range sweep (13 files) | 2026-08-17 | All clean |
| **W76** | Loi 01-19 offset re-sweep | 2026-08-17 | Clean |
| **W77** | Abattoir/SLH wastewater Décret 06-141 | 2026-08-17 | Clean |
| **W78** | MCH-29-06 PPE wrong article | 2026-08-17 | Commit `cee92fb` |
| **W79** | BGN-08-03 bare-wire | 2026-08-17 | Clean |
| **W80** | 3 false flags corrected | 2026-08-17 | Direct source reads |
| **W81** | Décret 76-36 MISSING → Present | 2026-08-17 | SHA `2b71182` confirmed |
| **W82** | Finding 3 — PPE/machine-guard legal refs audit | 2026-08-17 | 6 files. Commit `8433bea` |
| **W83** | Phantom backlog — active inspection screen | 2026-08-17 | `checklists.tsx` confirmed present |
| **W84** | SPEC 10 — settings key writer/reader symmetry audit | 2026-08-17 | 3 mismatched keys found → W85 |
| **W85** | SPEC 10 fix — StorageKeys + settings.tsx patch | 2026-08-18 | TSC 0 + Jest 1245/0. Commits: `33e5cbf` (code), `14b055c` (test fix) |

---

### 🟠 OPEN

| Phase | Title | Priority | Notes |
|---|---|---|---|
| **W51** | LEGAL-VERIFY: AIM GPL2 publication status | Surveillance | 6 GPL criteria tagged [À VÉRIFIER — W51]. Monitor JORADP for official publication. No code action until published. |

---

## Backlog (needs human decision before opening a phase)

| Item | Blocker |
|---|---|
| F-05: prod API URL falls back to localhost | Confirm correct prod URL |
| F-02: stale Node/Expo version comment | Cosmetic — low priority |
| F-03: migration naming `001_` reused | Cosmetic — low priority |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision |
| L-01: Décret 06-141 Annexe I/II slaughterhouse conflict | Expert/regulator confirmation |
| MCH-29-05 heavy-metal params | Décret 06-141 Annexe II §3 — product decision |
| MCH-29-08 Loi 01-19 Art.28 | Verify against full text before acting |
| COU-AX7-03 Loi 18-11 worker medical exams | Verify when couvoirCriteria.ts fully audited |
| Décret 76-36 texte intégral | Rectificatif present. Texte original J.O. n°21/1976 non numérisé |

---

## Legal Quick-Reference

| Decree / Law | Domain | Status in legal_refs/ |
|---|---|---|
| Loi 90-29 | Aménagement + territoire | ✅ Present |
| Loi 03-10 | Environnement | ✅ Present |
| Loi 09-03 | Protection du consommateur | ✅ Present — Art.1–95 verbatim, VÉRIFIÉ 2026-08-11 |
| Loi 01-19 | Gestion des déchets | ✅ Present |
| Loi 04-20 | Risques majeurs | ✅ Present |
| Loi 19-02 | Sécurité incendie | ✅ Present |
| Loi 18-11 | Santé | ✅ Present — split 3 parties (W60) |
| Loi 90-11 | Travail | ✅ Present |
| Loi 05-12 | Eau | ✅ Present |
| Loi 88-07 | Hygiène/sécurité travail (loi-mère) | ✅ Present |
| Décret 91-05 | Hygiène/sécurité travail | ✅ Present |
| Décret 93-120 | Médecine du travail | ✅ Present |
| Décret 06-198 | Établissements classés | ✅ Present |
| Décret 07-144 | Nomenclature classés | ✅ Present — gap 1243–2922 [MANQUANT] |
| Décret 09-19 | Déchets dangereux import | ✅ Present |
| Décret 02-427 | Prévention risques pro | ✅ Present |
| Décret 06-141 | Rejets effluents liquides | ✅ Present |
| Décret 21-430 | GPL-C modification | ✅ Present |
| Décret 83-496 | GPL-C (as amended by 21-430) | ✅ Present |
| Décret 22-167 | Établissements classés modif | ✅ Present |
| Décret 24-196 | Établissements classés modif | ✅ Present |
| Décret 21-319 | GPL-C general framework | ✅ Present |
| Décret 04-82 | Abattoirs | ✅ Present |
| Décret 76-35 | IGH incendie | ✅ Present — NOT applicable (≥28m only) |
| Décret 76-36 | ERP sécurité incendie/panique | ✅ Present — rectificatif J.O. n°67/1976 |
| Décret 06-138 | Émissions poussières | ✅ Present — VÉRIFIÉ 2026-08-11 |
| AIM GPL2 v14.03.2022 | GPL station rules | ⚠️ UNPUBLISHED — W51 OPEN |

---

## Sprint Status

**P1 + P2 fully closed — 2026-08-18. TSC 0 + Jest 1245/0.**

Only active item: **W51** surveillance (no code action until JORADP publishes AIM GPL2).
