# SafeInspect — Strategic Plan & Phase Registry

> Single source of truth for phase numbering and execution order.
> Read this file before opening any new phase.
> Next phase identifier: **W100**

---

## 🚨 WRITE GUARD — Anti-Truncation Rules (mandatory before every push)

> These rules exist because `create_or_update_file` silently truncates content when the JSON payload is too large. A truncated legal file is worse than no file — it looks complete but is missing data.

### Rule 1 — SIZE CHECK BEFORE PUSH
Before calling `create_or_update_file` or `push_files` on any file in `legal_refs/`:
1. Count the character length of the content string you are about to push.
2. If > 20,000 chars → use `push_files` instead (handles larger payloads).
3. If > 40,000 chars → STOP. Split the file first. Update SPLIT FILES REGISTRY in space instructions.

### Rule 2 — VERIFY BY DIFF AFTER EVERY WRITE (no exceptions)
After every push to `legal_refs/`:
```powershell
git fetch origin main; git merge origin/main; git show <commit-sha> --stat
```
Expected: `additions` must be ≥ 90% of the line count you pushed.
If `deletions` > 20 → HARD STOP. Do NOT claim success. Report truncation to user.

### Rule 3 — NEVER FULL-REPLACE A LARGE LEGAL FILE
Files in `legal_refs/` must be patched, never fully replaced, unless:
- The file is being created for the first time (no SHA exists), OR
- The user explicitly authorises a full-file replacement in the same session.

### Rule 4 — CONTENT MUST BE VISIBLE BEFORE CITING
Before reporting any article as verified, that article's text must appear in the current session's tool output. If API truncates before reaching it → write: "Cannot confirm — file too large for API response, verify by commit diff."

### Rule 5 — SIZE RESPONSE CHECK
After any `create_or_update_file` call, check the `size` field in the response.
If `size` < 90% of expected byte count → HARD STOP before claiming success.

### What happened (2026-09-03 01:00 WAT)
- `decret-06-141-effluents-liquides.md` was pushed with `create_or_update_file`.
- First commit landed at **6,967 bytes** (112 lines) — content cut mid-Annexe I row 22.
- Root cause: JSON payload exceeded API limit silently. No error was returned.
- Fix: second push via `create_or_update_file` with corrected full content → **12,728 bytes** (207 insertions confirmed by diff).
- Prevention: Rules 1–5 above must be checked before every legal file write.

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

### ✅ CLOSED — Recent Phases (W60 → W99)

| Phase | Title | Closed | Evidence |
|---|---|---|---|
| **W60** | loi-18-11-sante split 3 parties | 2026-08-16 | Commit `698a793` |
| **W61** | Server routes mounted + approval routes + apiClient throw on missing env | 2026-08-16 | Commits: `13b750a`, `24270ca`, `0a27026` |
| **W62–W63** | Route path + approval ID — clean | 2026-08-16 | Direct reads |
| **W64** | Sync schema severity+status (SPEC 08) | 2026-08-18 | Commit [`a7f805d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a7f805dd7ce4d255b66518538fcaa29389afa654) |
| **W65** | Backup/restore — SQLite read (SPEC 01) | 2026-08-18 | Re-confirmed clean |
| **W66** | `updateStatus()` integrity+audit trail (SPEC 02) | 2026-08-18 | Commit [`4ed0db5`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/4ed0db5facafc2b1e038d8f8e5be860dd3bca76a) |
| **W67** | Photo evidence — cross-device gap | 2026-08-18 | Resolved by W86 base64 embed |
| **W68** | PIN lockout — SecureStore (SPEC 05) | 2026-08-18 | Re-confirmed clean |
| **W69–W70** | CAP + PDF — clean | 2026-08-17 | Direct reads |
| **W71** | Planning UI + PriorityWidget | 2026-08-17 | Commits `c178a6c`, `c1b9d91` |
| **W72** | Dead settings toggles + notification centre | 2026-08-17 | Commit `9b42f67` |
| **W73** | Agenda facility mismatch | 2026-08-17 | PHANTOM — already guarded |
| **W74** | Server hardening: rate-limit login + batch guard | 2026-08-17 | Commit `33dc3b8` |
| **W75** | EIE article range sweep (13 files) | 2026-08-17 | All clean |
| **W76** | Loi 01-19 offset re-sweep | 2026-08-17 | Clean |
| **W77** | Abattoir/SLH wastewater Décret 06-141 | 2026-08-17 | Clean |
| **W78** | MCH-29-06 PPE wrong article | 2026-08-17 | Commit `cee92fb` |
| **W79** | BGN-08-03 bare-wire | 2026-08-17 | Clean |
| **W80** | 3 false flags corrected | 2026-08-17 | Direct source reads |
| **W81** | Décret 76-36 MISSING → Present | 2026-08-17 | SHA `2b71182` confirmed |
| **W82** | Finding 3 — PPE/machine-guard legal refs audit | 2026-08-17 | Commits `cee92fb`, `8433bea` |
| **W83** | Phantom backlog — active inspection screen | 2026-08-17 | `checklists.tsx` confirmed present |
| **W84** | SPEC 10 — settings key writer/reader symmetry audit | 2026-08-17 | 3 mismatched keys found → W85 |
| **W85** | SPEC 10 fix — StorageKeys + settings.tsx patch | 2026-08-18 | TSC 0 + Jest 1245/0. Commits: `33e5cbf`, `14b055c` |
| **W86** | BackupService v3 photo embed + briefService critical sort | 2026-08-18 | TSC 0 + Jest 1257/0. Commit [`872ad94`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/872ad94fa940c9e96c8f02b8367418d33c025d30) |
| **W50** (new) | CGS-01-01: Décret 76-35 removed — wrong domain (IGH) | 2026-08-18 | Commit [`7782bdf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/7782bdf8f05357800742a31e04d7abd3cfbf37ec) |
| **W51** (new) | MCH-29-03+04: Décret 09-19 Art.2+Art.6 backfill | 2026-08-18 | Commit [`7782bdf`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/7782bdf8f05357800742a31e04d7abd3cfbf37ec) |
| **W87** | F-01/F-02/F-03 confirmed clean — all false positives | 2026-08-18 | Direct reads. No code change. |
| **W88** | MCH-29-08 Art.28→Art.18 + R1/R6 noise decree clean | 2026-08-18 | Commit [`769e49a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/769e49a4eedaf6d2d363f53c2b71dc8fd8ef9d4c) |
| **audit-log TSC** | Duplicate keys TS1117 + missing INSPECTION_STATUS_UPDATED | 2026-08-19 | Commits `2c78a16`, [`259f64b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/259f64b122ce7ab366a80e74087d224468c2ba66) |
| **W89** | PriorityWidget `onPress` → facilities list instead of specific profile | 2026-08-18/19 | Commit [`d457a6a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/d457a6a4d363ebc4d4164eaa8476b82bb5aeae08) |
| **W90** | `apiClient.ts` silent `localhost` fallback | 2026-08-16/19 | Resolved in W61. |
| **W91** | `server/src/routes/notifications.ts` missing | 2026-08-19 | SHA `ce797c2` |
| **BGN-10-01** | Art range 15–22 → 14–21 | 2026-08-19 | Commit [`a71438b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a71438b769f9ca45f23e386493c9ed28f8129b73) |
| **SPEC12-D** | `registerPushToken` no `res.ok` check | 2026-08-19 | Commit [`2fbd14b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2fbd14bf12523408532df6c2e6a386c39f8a11cd) |
| **SPEC12-E** | `syncEngine.ts` raw `'autoSync'` string — duplicate reader | 2026-08-19 | Already clean on HEAD. Direct read SHA `35605c9` |
| **W92 / SPEC 13** | PriorityWidget navigation test coverage | 2026-08-19 | Commits [`a29675a`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/a29675a4287fe5eb3b79931bac7ffe1ab13a5b90), [`c1040f2`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/c1040f22911318e44806eb2b3c842ee5b54e5310) |
| **W93** | UI screens gap audit — 22 screens, 0 orphans | 2026-08-19 | Direct read |
| **W94** | E2E integration test — full inspector lifecycle | 2026-08-19 | Commit [`1a9360d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/1a9360d0ae70929315546ed322e3c5661b644b43). User-confirmed green. |
| **W95** | SPEC12-C: server-login skip persistence | 2026-08-19 | Commits `1e575fc`. **5/5 Jest green — user-confirmed.** |
| **W96** | SPEC12-B: push receipt two-phase stale-token cleanup | 2026-08-20 | Commits `83cf78b`, `e049b08`, `0f38a05`, `7f2965c`. **4/4 Jest green — user-confirmed.** |
| **W97-P1** | Legal validation pipeline Phase 1+2: index_articles.py + normalize.py | 2026-09-02 | Commits `89c961f`, `c65b994`. **Both format families green — user-confirmed.** |
| **W97-P3** | Legal validation pipeline Phase 3: diff_articles.py fuzzy diff engine | 2026-09-02 | Commit `2a7167f`. |
| **LEGAL-OCR-11-125** | Décret 11-125 eau consommation humaine — OCR + encoding fix | 2026-09-02 | Commit [`3664053`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/3664053). 323 lines. |
| **W98** | index_articles.py Windows UTF-8 fix — décret 11-125 9 articles confirmed | 2026-09-03 | Commit [`89cee93`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/89cee93c4876854ac5cf307d89f590a38031734a). **9 articles — user-confirmed ✅** |
| **LEGAL-06-141** | Décret 06-141 effluents liquides — Arts.1–14 + Annexe I (25 params) + Annexe II (7 catégories) | 2026-09-03 | Commits [`120b201`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/120b20173eaf788dae5a142ad0e775d1bcedc91e) (initial), [`cd149f9`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/cd149f99a1b4015af1cfb9daf220cf16762e48fa) (truncation fix, 207 insertions ✅). **12,728 bytes — diff-verified.** |
| **W99** | Art.13 susvisé + diff_articles ordinal key normalisation (`1er`→`1`) | 2026-09-03 | Commit [`15d811d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/15d811d1af86cab6ef83cff8837751397aa83a98). |

---

### 🟠 OPEN — Surveillance Only

| Phase | Title | Priority | Notes |
|---|---|---|---|
| **W51-SURV** | LEGAL-VERIFY: AIM GPL2 JORADP publication status | Surveillance | Monitor JORADP. No code action until published. |

---

## 🔴 LAST STEP — Do When Production Server is Ready

> **Do NOT touch until you have deployed the Express server and have a public URL.**

### F-05 — Set Production API URL

**Step 1 —** Create `E:\DZ_Inspection\.env.production`:
```
EXPO_PUBLIC_SYNC_API_URL=https://your-server-domain.com
```

**Step 2 —** Add to EAS secrets:
```powershell
npx eas secret:create --scope project --name EXPO_PUBLIC_SYNC_API_URL --value "https://your-server-domain.com"
```

### Prisma Migration (W96)

When production DB is available:
```powershell
cd E:\DZ_Inspection\server
npx prisma migrate dev --name add-push-receipt-queue
```

---

## Backlog (needs human decision before opening a phase)

| Item | Blocker |
|---|---|
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision |
| L-01: Décret 06-141 Annexe I/II slaughterhouse conflict | Expert/regulator confirmation (file now in repo) |
| MCH-29-05 heavy-metal params | Décret 06-141 Annexe II §3 — product decision |
| COU-AX7-03 Loi 18-11 worker medical exams | Verify when couvoirCriteria.ts fully audited |
| Décret 76-36 texte intégral | Rectificatif present. Texte original J.O. n°21/1976 non numérisé |

---

## Legal Quick-Reference

| Decree / Law | Domain | Status in legal_refs/ |
|---|---|---|
| Loi 90-29 | Aménagement + territoire | ✅ Present |
| Loi 03-10 | Environnement | ✅ Present |
| Loi 09-03 | Protection du consommateur | ✅ Present |
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
| **Décret 06-141** | **Rejets effluents liquides** | ✅ **Present — Arts.1–14 + Annexe I (25 params) + Annexe II (7 catégories). Art.13 susvisé corrected (W99). 12,728 bytes. Diff-verified 2026-09-03.** |
| Décret 21-430 | GPL-C modification | ✅ Present |
| Décret 83-496 | GPL-C (as amended by 21-430) | ✅ Present |
| Décret 22-167 | Établissements classés modif | ✅ Present |
| Décret 24-196 | Établissements classés modif | ✅ Present |
| Décret 21-319 | GPL-C general framework | ✅ Present |
| Décret 04-82 | Abattoirs | ✅ Present |
| Décret 76-35 | IGH incendie | ✅ Present — NOT applicable (≥28m only). All uses removed. |
| Décret 76-36 | ERP sécurité incendie/panique | ✅ Present — rectificatif J.O. n°67/1976 |
| Décret 06-138 | Émissions poussières | ✅ Present |
| **Décret 11-125** | **Qualité eau consommation humaine** | ✅ **Present — 9 articles indexed (W98 2026-09-03)** |
| AIM GPL2 v14.03.2022 | GPL station rules | ⚠️ UNPUBLISHED — W51-SURV OPEN |

---

## Sprint Status

**Board clear. All phases closed.**
Next phase identifier: **W100**. Active surveillance: **W51-SURV**.
