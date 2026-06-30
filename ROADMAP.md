# SafeInspect — Roadmap

This file is the single source of truth for remaining work.
Completed phases have been removed to avoid confusion.

---

## ✅ Completed Phases (1 – 21)

All phases up to and including Phase 21 are shipped and merged into `main`.

| Phase | What |
|-------|------|
| 1 | Data model & types (`src/types.ts`, DB schema) |
| 2 | Repeat-violation detection |
| 3 | Differential follow-up view |
| 4 | New statuses (`observation-only`, `unable-to-verify`) |
| 5 | Gated opening & closing meetings |
| 6 | Decision support / suggested next step (`DecisionSupportPanel`, `suggestDecision`, `escalationOverrideReason`) |
| 7 | Numeric fields UI (input widget, unit picker, out-of-range auto-flag) |
| 8 | Standalone non-conformity notice PDF (sequence number, PDF template, Phase 5 gate enforced) |
| 9 | Dynamic risk score (historical trend, dashboard widget, recalculate on completion) |
| 10 | Supervisor tools (review screen, approval/return/escalate, push notification) |
| 11 | UX polish & wizard flow (multi-step wizard, skeleton loaders, empty states, RTL a11y) |
| 12 | Inspection Agenda tab (`/(tabs)/agenda`, CRUD, reminder scheduling) |
| 13 | Legal references screen (`/screens/legal`, Décret 06-198 article lookup) |
| 14 | Backup & restore screen (`/screens/backup`, JSON export/import) |
| 15 | CAP notification system (`CapNotificationService` — per-item, daily digest, weekly digest) |
| 16 | Inspector profile screen (`/screens/inspector-profile`) |
| 17 | Audit log screen (`/screens/audit-log`) |
| 18 | Stats / analytics screen (`/screens/stats`) |
| 19 | Reports list + detail (`/screens/reports`, `/reports/[id]`) |
| 20 | Notification cancel-on-resolve (CAP & agenda notifications cancelled when item resolved) |
| 21 | Agenda notification deep-link + notification toggles in Settings |

---

## 🔲 Remaining Work

Nothing planned yet. Open a new roadmap entry below when the next phase is scoped.

---

## Last updated
2026-06-30 — Phases 1–21 complete. Roadmap cleared of completed items.
