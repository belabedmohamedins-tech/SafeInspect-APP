# SafeInspect — Master Roadmap
**Last updated: June 2026 — synthesised from PRD (Super ReDesign), 360 Audit v1, 360 Audit v2, Expert Panel Review, Checklist Methodology Audit, and Scoring System redesign.**

> **North Star:** Become Algeria's reference platform for classified-establishment inspection — legally credible, field-ready, and municipality-purchasable. The domain knowledge (19+ facility types, article-level legal references, defensible scoring model) is the moat. Infrastructure is what's missing.

---

## Current State (as of June 2026)

| Category | Score | Status |
|---|---|---|
| Product Vision | 80/100 | ✅ Super ReDesign defines clear v1→v3 path |
| Criteria Library | 90/100 | ✅ 26 activities mapped, article-level refs, duplicates removed |
| Scoring Model | 85/100 | ✅ Severity-weighted, critical override, legally defensible |
| Inspection Workflow (core) | 72/100 | ✅ Checklist, draft/resume, photo, signature, geofencing, CAP, brief |
| Database | 30/100 | 🔴 AsyncStorage — legally unacceptable |
| Security / Integrity | 35/100 | 🔴 djb2 hash, no encryption at rest |
| Backend / Multi-user | 0/100 | 🔴 No server, no real approval workflow |
| GIS Mapping | 40/100 | 🟡 Coordinates still parsed from notes regex |
| Reporting | 62/100 | 🟡 Basic PDF — no official format, no standalone docs |
| Follow-up / Closed loop | 20/100 | 🔴 No differential view, no repeat-violation detection |
| Decision Support | 65/100 | 🟡 Grade exists — no escalation suggestion engine |
| UX / Design System | 50/100 | 🔴 No design tokens, inconsistent colour system |
| Documentation | 5/100 | 🔴 Generic Expo README |

**Overall: 63/100** — Sophisticated prototype. Not yet municipality-purchasable.

---

## What Exists (Do Not Rebuild)

- PIN + biometric auth (`AuthRepository`, `pin-lock.tsx`, SecureStore)
- Full inspection checklist with collapsible axes, 4-status evaluation, draft/resume
- Per-item photo capture, GPS embed, inspector signature
- Geofencing check (Haversine, 300 m threshold)
- Severity-weighted scoring with critical override and grade disclaimer
- CAP lifecycle (`CorrectiveActionRepository`, `cap.tsx`)
- Approval workflow (device-local, `ApprovalRepository`)
- Audit log (`AuditLogRepository`)
- Sync queue architecture (`SyncService.ts` — queue logic exists, no server endpoint)
- Backup/restore (`BackupService` — photos excluded, known gap)
- Bilingual UI (ar.ts + fr.ts, i18n)
- Pre-inspection brief screen (`brief.tsx`)
- Stats dashboard, agenda (`AgendaRepository`)
- Risk heatmap concept (online-only, WebView/Leaflet)
- Notification service (`NotificationService`)
- 26 facility types mapped with article-level legal criteria

---

## TIER 0 — Do Today (Hours, Not Days)

These have zero dependency and unblock everything.

| # | Task | Effort | Why |
|---|---|---|---|
| 0.1 | **Replace djb2 with SHA-256** in `IntegrityService.ts` using `expo-crypto` (already in `package.json`) | 2 h | Legal credibility — djb2 will be challenged in any tribunal |
| 0.2 | **Fix `app.json` bundle ID** from `com.yourcompany` to real identifier | 5 min | Required for EAS Build / distribution |
| 0.3 | **Add unknown-activity validation** in `criteriaData.ts` — `console.warn` or throw when activity key has no mapping | 2 h | Silent fallback to wrong checklist is a legal risk |
| 0.4 | **Add HACCP plan criterion** to `bakeryCriteria.ts` (Décret 17-140 Art.4) | 1 h | Bakeries without HACCP are a known audit gap |
| 0.5 | **Upgrade `slaughterhouseSmallCriteria.ts`** to article-level references (same standard as other files) | 4 h | Only criteria file not brought to standard in RAQIB audit |
| 0.6 | **Add traceability criterion** to `coldRoomCriteria.ts` (supplier/date records) | 1 h | Flagged in RAQIB audit |
| 0.7 | **Add session auto-lock** after N minutes of inactivity → require PIN re-entry | 4 h | Basic government device security |
| 0.8 | **Add `escalationOverrideReason`** field plumbing (already in `SavedInspection` type — confirm UI surface in checklist summary) | 2 h | Needed for Phase 6 decision support |

---

## TIER 1 — Sprint 1: Foundation (Weeks 1–2)

> **Goal:** Fix every blocker preventing legal credibility. Nothing else until these are done.

### 1A — SQLite Migration (3–4 weeks, start now)
- Design full SQLite schema (`users`, `facilities`, `inspections`, `cap_items`, `audit_log`, `sync_queue`)
- Replace `AsyncStorage` calls in all repositories with `expo-sqlite` + Drizzle ORM
- Write migration scripts — `schema.ts` already has the placeholder
- Repository interface stays identical — calling code does not change
- Add `SQLCipher` encryption at rest (or AES record-level encryption as interim)

### 1B — Fix Facility Coordinates (2 days)
- Add proper `lat` / `lng` input to facility add/edit screen (map picker preferred, validated numeric fields minimum)
- Update `map.tsx` to read from `facility.lat` / `facility.lng` — remove the regex parser from `facility.notes`
- `Facility` type already has `lat?` and `lng?` fields — use them

### 1C — Include Photos in Backup (2 days)
- Update `BackupService` to produce a ZIP archive: JSON manifest + all referenced photo files
- Photos are primary legal evidence — losing them on device replacement is operationally unacceptable

### 1D — Product Documentation (3 days)
- Replace generic Expo README with a real `README.md`: screenshots, feature list, architecture diagram, installation guide
- Write `docs/USER_GUIDE_AR.md` — Arabic field inspector guide
- Write `docs/ADMIN_GUIDE.md` — administrator setup guide
- Document `src/` architecture for any future contributor

---

## TIER 2 — Sprint 2: Backend Core (Weeks 3–6)

> **Goal:** Enable multi-device sync, real approval workflow, and supervisor role.

### Minimal Backend API (2–3 weeks)
**Stack:** Node.js + Express + PostgreSQL + Prisma ORM. Single VPS (Hetzner CX21, ~€5/month).

**12 required endpoints:**
```
POST  /auth/login           → JWT (inspector credentials)
POST  /auth/refresh         → refresh token
GET   /auth/me              → current user profile
POST  /sync/inspections     → upload from SyncService.ts queue
GET   /sync/inspections     → pull inspections assigned/visible to user
GET   /approvals            → supervisor: list pending approvals
POST  /approvals/:id/approve
POST  /approvals/:id/return → with comment
POST  /notifications/register → device push token
POST  /notifications/send   → internal: push to device
GET   /facilities           → central registry
POST  /facilities           → add/update (admin only)
```

**5 database tables:**
- `users` (id, name, matricule, role, wilaya, phone)
- `facilities` (id, name, owner, activity, address, lat, lng, license_number)
- `inspections` (id, facility_id, inspector_id, data JSONB, status, approved_by)
- `approvals` (id, inspection_id, supervisor_id, status, comment)
- `notifications` (id, user_id, type, payload JSONB, sent_at, read_at)

### Connect Mobile to Backend
- Wire `SyncService.ts` to the real endpoint (queue logic already exists)
- Implement server-mediated approval — supervisor sees all team inspections, not just device-local
- Implement push notifications from server (inspector ↔ supervisor)
- Add JWT auth header to all sync requests

---

## TIER 3 — Sprint 3: Inspection Workflow Upgrades (Weeks 7–10)

> **Goal:** Complete the 9-phase inspection lifecycle per the Super ReDesign spec.

### Phase 3 — Arrival
- [ ] Gated opening-meeting step: permit validity check + representative identity confirmation before checklist unlocks
- [ ] Operator start-of-inspection acknowledgment signature (timestamped, embedded in record)

### Phase 4 — Execution
- [ ] **Live grade header** updating in real-time as inspector fills items
- [ ] **Critical violation immediate alert** — vibration + red banner + grade floor locks on high-severity non-compliant
- [ ] **Mandatory photo enforcement** for high-severity non-compliant items (hard gate, not just prompt)
- [ ] **85% completion enforcement gate** before submission
- [ ] Add `Observation only` and `Unable to verify` statuses (distinct from compliant/non-compliant/NA)
- [ ] Structured numeric fields with units for quantitative criteria (temperature, chlorine residual, noise dB)

### Phase 5 — Decision
- [ ] **Enforcement decision selector**: Pass / Formal Warning / CAP Required / Immediate Closure Recommendation
- [ ] Auto-populated legal basis text per enforcement decision (non-binding, inspector can edit)
- [ ] **Repeat-violation detection**: flag any criterion that was non-compliant in the immediately preceding inspection
- [ ] Non-binding suggested next administrative step on the legal escalation ladder (Décret 06-198 Art. 20, Loi 03-10 Art. 103) — mandatory justification if overridden

### Phase 6 — CAP
- [ ] Standard corrective action library (searchable, per-violation-type suggestions)
- [ ] Auto-suggested deadlines per severity (48h critical / 15d major / 60d minor)
- [ ] **Operator CAP acknowledgment signature** (makes CAP legally binding)
- [ ] Root-cause classification field on non-conformities

### Phase 7 — Closing
- [ ] Formal closing-meeting step (distinct screen: confirm findings verbally communicated before signatures)
- [ ] Immediate-notification protocol for imminent-danger findings (gas leak, contaminated food in active distribution — notify now, not at report delivery)

---

## TIER 4 — Sprint 4: Reports & Follow-Up (Weeks 11–14)

> **Goal:** Legally submittable documents and closed follow-up loop.

### Reports
- [ ] **Official ministerial format** for full inspection report (sequential reference number per office, GPS, all signatures, legal headers)
- [ ] **Non-conformity notice** as standalone PDF (violations only — the document actually signed and handed to the operator)
- [ ] **CAP as standalone bilateral AR/FR PDF** (legally binding once signed)
- [ ] **Closure order document** (generated only when decision = immediate closure)
- [ ] Sequential report reference numbering tied to commune inspection register
- [ ] Chain-of-custody hash (SHA-256) embedded in finalized reports
- [ ] PDF/A archival format option

### Follow-Up Closed Loop
- [ ] **Differential view in follow-up checklist**: show each criterion's status from the previous inspection alongside the current input field
- [ ] `✅ Resolved` / `🔴 Repeated` tags per criterion in follow-up
- [ ] **Follow-up inspection linking**: link new inspection to original, auto-suggest when facility has open CAP items
- [ ] CAP cycle counter ("this facility's 2nd consecutive missed deadline")
- [ ] CSV/Excel data export (municipality integration)
- [ ] Tamper-evident audit package export for legal proceedings

---

## TIER 5 — Sprint 5: GIS & UX (Weeks 15–20)

### GIS
- [ ] **Offline map tile caching** — wilaya-level download (React Native Maps + tile cache, download on Wi-Fi)
- [ ] Proper lat/lng input in facility add/edit screen (map picker)
- [ ] Route optimisation for daily agenda (proximity-ordered visit sequence)
- [ ] Inspector position layer (supervisor map view — requires backend)
- [ ] Distance from inspector to each facility in agenda list

### UX / Design System
- [ ] **Full design system** — unified colour tokens, spacing scale, typography (resolve the two competing colour systems: `src/constants/colors.ts` vs `constants/theme.ts`)
- [ ] Global search across facilities, inspections, and CAP items
- [ ] Loading skeleton screens (replace all `ActivityIndicator` spinners)
- [ ] Swipe gestures for checklist items (right = compliant, left = non-compliant)
- [ ] Floating progress pill during inspection (X/Y complete)
- [ ] QR/barcode facility scan (scan door QR → loads facility + starts inspection)
- [ ] Pre-departure briefing screen (one screen: facility profile, last inspection by axis, open CAPs, legal texts, equipment checklist)
- [ ] Linear wizard flow for post-checklist (CAP → signatures → delivery — prevents accidental CAP skip)
- [ ] Bulk "mark remaining items compliant" action with audit trail (speeds up clean facilities)

---

## TIER 6 — Medium Term: Intelligence (Months 5–8)

- [ ] Voice-to-text comment dictation (Algerian Arabic + French, on-device Whisper model)
- [ ] **Risk-based automatic scheduling engine** — grade + time + open CAPs drives weekly priority list
- [ ] Dynamic multi-inspection risk score (trend across last 3 inspections, not single-snapshot)
- [ ] Inspector performance dashboard (supervisor view: inspections/month, avg score, completion rate)
- [ ] Sector benchmarking (this facility vs commune average for its activity type)
- [ ] **Violation trend alerts** (3rd consecutive D — auto-escalation suggestion)
- [ ] Cross-facility frequent-violation aggregate view (which criterion fails most often for this activity type)
- [ ] Supervisor inconsistency detection (flag when one inspector's grading diverges significantly from commune average)
- [ ] Photo annotation (circle, arrow, text overlay on evidence photos)
- [ ] AI camera-assisted violation detection (on-device model, non-binding hints)
- [ ] Push notifications: full inspector ↔ supervisor ↔ system notification types (per Super ReDesign spec)
- [ ] Automated monthly report (auto-generated 1st of each month)
- [ ] Role-based access control (Supervisor, Legal Officer, Senior Inspector, Regional Director, Facility Manager, System Admin, Read-Only Auditor)
- [ ] Web admin portal (React web app — manage inspectors, facilities, checklists, analytics)

---

## TIER 7 — Long Term: National Platform (Months 9–18)

- [ ] Multi-tenant wilaya architecture (complete data isolation per wilaya, ministry super-admin)
- [ ] National Facility Registry (RNME) — replace hardcoded 708-line TypeScript array, sync with CNRC
- [ ] Inspector accreditation & identity (linked to ministry credentials, certification expiry)
- [ ] Ministry analytics portal (web dashboard for ministry officials, all 58 wilayas)
- [ ] Facility Operator portal (external web portal: operators view own reports, submit CAP evidence)
- [ ] Legal proceedings module (court case tracking, fines, appeals, linked to originating inspections)
- [ ] Outbreak/crisis alert module (cross-reference with DSP health surveillance)
- [ ] Inter-agency API layer (DSP, DSA, DCP, ONS, CNAS)
- [ ] Public transparency portal (anonymised aggregate statistics)
- [ ] National inspection planning module (annual quotas, plan vs actual, ministry submission)
- [ ] Certification/licensing integration (A-grade → license renewal queue; D-grade → suspension workflow)
- [ ] Predictive inspection scheduling (ML model: historical data + seasonal patterns + sector risk)

---

## Version Milestones

| Version | Goal | ETA | Gate |
|---|---|---|---|
| **v1.5** | Legally credible — municipality can evaluate | Month 1–3 | Tiers 0+1 complete, SHA-256, SQLite, backend MVP, docs |
| **v2.0** | Field professional — competitive with commercial platforms | Month 4–8 | Tiers 2–5 complete, offline maps, design system, role-based access |
| **v3.0** | Smart platform — national ministry adoption capable | Month 9–18 | Tiers 6–7 complete, multi-tenant, RNME, AI, operator portal |

---

## Risk Register

| Risk | Probability | Impact | Status | Mitigation |
|---|---|---|---|---|
| djb2 hash rejected in legal proceeding | HIGH | Critical | 🔴 OPEN | Replace with SHA-256 — 2 hours |
| AsyncStorage data loss / 6 MB overflow | HIGH | Critical | 🔴 OPEN | SQLite migration |
| Data breach on lost/stolen device | MEDIUM | Critical | 🔴 OPEN | Encryption at rest |
| Supervisor cannot see field inspector data | HIGH | High | 🔴 OPEN | Backend required |
| Photos lost on device replacement | HIGH | High | 🔴 OPEN | Photo backup to server |
| Follow-up cannot verify past violations | HIGH | High | 🔴 OPEN | Differential view (Tier 4) |
| No closed-loop follow-up | HIGH | High | 🔴 OPEN | Repeat-violation detection (Tier 3) |
| Activity typo → silent wrong checklist | MEDIUM | Medium | 🔴 OPEN | Validation function (Tier 0.3) |
| Two competing colour systems → runtime crash | MEDIUM | Medium | 🟡 KNOWN | Design system (Tier 5) |
| Wrong facility evaluated (activity mismatch) | LOW | High | ✅ CLOSED | RAQIB audit — 26/26 activities mapped |
| Duplicate criteria inflating checklists | LOW | Medium | ✅ CLOSED | RAQIB audit — 44 duplicates removed |
| Legal reference too vague to defend | LOW | High | ✅ CLOSED | Article-level references in all criteria |

---

## The Three Tasks That Matter Most Right Now

> Do not write another feature until these three are done.

1. **Replace djb2 with SHA-256** — 2 hours — `IntegrityService.ts` — `expo-crypto` is already in `package.json`. This single change moves SafeInspect from legally indefensible to legally credible.

2. **Migrate AsyncStorage to SQLite** — 3–4 weeks — the repository pattern already built is the correct bridge. Repositories call AsyncStorage today, SQLite tomorrow, with no changes to calling code.

3. **Build a minimal backend** — 2–3 weeks after SQLite — 12 endpoints, 5 tables. This unlocks multi-device sync, real supervisor approval, push notifications, and the facility registry migration.

After these three are complete, SafeInspect becomes a product a municipality can evaluate seriously.

---

*Sources: Super ReDesign PRD, SafeInspect 360 Audit Report v1 (June 2026), SafeInspect Master 360 Audit v2 (June 2026), Expert Panel Review, Checklist Methodology Audit, Scoring System redesign document.*
