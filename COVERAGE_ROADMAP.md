# Coverage Roadmap

> ⚠️ **DEFERRED** — Coverage tests are on hold until the checklist rework is complete.
> Do not start coverage work until instructed. Follow `CHECKLIST_REWORK_ROADMAP.md` first.

---

<!-- original content preserved below for reference when coverage work resumes -->

## Status (as of last coverage run)

Coverage was at ~95%+ in June 2026. Regression occurred after new feature files were added without tests.

## Priority Order (resume after checklist rework)

1. **CapNotificationService** — broken mock, easy fix, big coverage gain
2. **serverAuth.ts** — ~12% statements, highest risk file
3. **CorrectiveActionRepository lines 135–210** — unblocks CapNotificationService
4. **pdfService.ts lines 751–1143** — large but mockable
5. **decisionSupport.ts** — complex logic, needs careful reading
6. **src/components/** — needs RTL, confirm setup first

## Thresholds (locked in jest.config.js)

| Metric | Threshold |
|---|---|
| Statements | 95% |
| Branches | 83% |
| Functions | 97% |
| Lines | 96% |

> Do not lower thresholds — raising tests to meet them is the correct path.
