# SPEC 10 — Multiple fully-built features are never actually wired up
(settings toggles + the entire in-app Notification Centre); this is a
recurring, codebase-level pattern worth a broader sweep, not a one-off fix
Priority: P1. Dependencies: none.

## Problem A — all three Settings screen toggles are inert
`app/screens/settings.tsx` has three functional-looking toggles —
notifications, auto-sync, dark mode — each correctly persisted via
`SettingsRepository.set(...)`. Confirmed via full-codebase grep (excluding
the settings screen and tests) that NONE of the three keys
(`'notifications'`, `'autoSync'`, `'darkMode'`) are read anywhere else in
the app:

- **`darkMode`** — no theme provider or conditional styling anywhere
  references it. Every component read in this audit uses hardcoded style
  colors (`Colors.primary`, literal hex values). Toggling this does
  nothing. Lowest-severity of the three (cosmetic), but still a broken
  promise to the user.
- **`autoSync`** — CONFIRMED, exact location: `src/db/syncEngine.ts`'s
  `startSyncScheduler()` (invoked unconditionally from `app/_layout.tsx`
  at app launch) runs `setInterval(safeFlush, intervalMs)` every 30s and
  also flushes on every offline→online transition via `NetInfo`. Both
  `safeFlush()` and `startSyncScheduler()` check `hasSyncUrl()` (whether
  the sync env var is configured) but never check
  `SettingsRepository.get('autoSync')` anywhere. A user who explicitly
  disables auto-sync will have it continue regardless, on a 30-second
  timer, indefinitely. Currently moot in practice since sync is broken
  anyway (SPEC 09/SPEC 08), but will become actively misleading the moment
  those are fixed — worth fixing in the same pass rather than
  rediscovering this later. The surrounding code is otherwise
  well-engineered (defensive NetInfo fallback, careful env-var handling
  for Babel inlining, non-fatal error catching) — this is a clean,
  isolated one-line gap: add an `autoSync` check alongside the existing
  `hasSyncUrl()` check in both functions.
- **`notifications`** — no notification-scheduling function anywhere
  (`CapNotificationService.ts`, `NotificationService.ts`) checks this
  master toggle before firing. A user who explicitly turns off
  notifications will keep receiving them. This is a user privacy/
  preference choice being silently ignored, not just a missing cosmetic
  feature.

## Problem B — the entire in-app Notification Centre is dead (the most
## complete example of this pattern found in the whole audit — not a
## missing check on an existing flow, but three well-built files with no
## data source ever populating them)
`src/repositories/NotificationRepository.ts` implements a full local
notification-inbox model: `append()`, `getAll()`, `getUnread()`,
`getUnreadCount()`, `markRead()`, `markAllRead()`, `dismiss()`, `delete()`,
`clear()`. `app/screens/notifications.tsx` is a fully built "Notification
Centre" screen consuming it — day-grouped sections, per-type icons/colors
for `CAP_DEADLINE`/`AGENDA_REMINDER`/`APPROVAL_ACTION`/`FOLLOW_UP`, mark-
read/dismiss/clear actions. `components/layout/NotificationBell.tsx` polls
`getUnreadCount()` every 30 seconds and renders a red badge when it's
non-zero. **Confirmed via full-codebase grep:
`NotificationRepository.append()` — the only way any notification ever
gets created — has zero callers anywhere in the app.** The bell badge will
never appear; the Notification Centre screen will always be empty, for
every user, permanently.

The likely intended design (inferred from the `NotificationType` union,
not confirmed — flag to maintainer): `CAP_DEADLINE` should probably be
appended when `CapNotificationService` fires a deadline alert;
`AGENDA_REMINDER` when an agenda notification fires; `APPROVAL_ACTION`
when a supervisor approves/rejects (tying in with SPEC 02/SPEC 09's
approval-notification work); `FOLLOW_UP` when a follow-up inspection is
generated. None of these integration points currently call `append()`.

## This is the sixth confirmed instance of the same pattern in this repo
This audit independently found the same "fully built, never actually
invoked/checked" shape five other times: `sync.ts`/`approvals.ts` never
mounted on the server (SPEC 09); `scheduleCapDigestNotification()` and
`scheduleCapWeeklyDigest()` built but never called (SPEC 03); and the three
settings toggles above. Six repetitions across a codebase this size is
strong enough to stop treating each as a surprising one-off and start
treating it as this project's single most common defect class. One more
minor instance found in passing while checking `app/agenda/`: `AgendaItem`'s
`'cancelled'` status has full UI support (a color and an Arabic label in
`app/agenda/index.tsx`) but no code path anywhere sets it — `toggleStatus()`
only flips between `pending`/`completed`. Not worth a separate write-up on
its own, but it's the seventh occurrence and further supports the case for
a systematic sweep rather than treating each instance as isolated.
Recommend a dedicated mechanical grep pass before the next release,
independent of fixing these seven specific instances: for every
`SettingsRepository.set()` call, confirm at least one other file reads
that same key; for every exported scheduling/repository-write function,
confirm it has a real caller; for every status/enum value defined in
`types.ts`, confirm something actually produces it, not just consumes it.
This is cheap to check mechanically and this audit's experience strongly
suggests it will find more.

## Desired behavior
1. `darkMode`: either implement an actual theme provider consuming this
   setting, or remove the toggle until that work is prioritized — a
   non-functional setting is worse than no setting.
2. `autoSync`: add a `SettingsRepository.get('autoSync') !== 'false'` check
   alongside the existing `hasSyncUrl()` check in both `safeFlush()` and
   `startSyncScheduler()` in `src/db/syncEngine.ts` — confirmed exact
   location, no further investigation needed for this one.
3. `notifications`: gate `CapNotificationService`'s and
   `NotificationService`'s scheduling functions behind this master toggle
   — check it before calling `scheduleNotificationAsync` anywhere, or
   cancel all pending notifications when the user turns it off.
4. For the Notification Centre: wire `NotificationRepository.append()`
   into the four integration points described above — confirm the
   intended design with the maintainer first rather than guessing at
   exact trigger conditions, since this touches four different subsystems
   at once.
5. Do the broader grep sweep described above and report back anything
   else it finds, even if fixing those additional instances becomes a
   separate follow-up spec.

## Reason
A screen with three inert toggles is a UX/trust problem. An entire
notification inbox feature — repository, screen, and bell badge, all
correctly built — that has never once fired in production is a much
bigger gap, and the kind that's invisible in a demo (nothing crashes,
nothing errors) but immediately obvious to any real user who taps the
bell and always finds it empty.

## Affected files
- `app/screens/settings.tsx` (no change needed here — the toggle/storage
  code itself is correct; the gap is entirely on the consuming side)
- `src/db/syncEngine.ts` (autoSync gate — exact location confirmed:
  `safeFlush()` and `startSyncScheduler()`)
- `src/services/CapNotificationService.ts`, `src/services/
  NotificationService.ts` (notifications gate, and Problem B's append
  integration for CAP_DEADLINE/AGENDA_REMINDER)
- `src/repositories/ApprovalRepository.ts` or `approvals.ts` server-side
  (Problem B's APPROVAL_ACTION integration — depends on where the
  maintainer decides this belongs once SPEC 09 lands)
- Theme/styling layer (darkMode — likely a new file if implementing rather
  than removing)

## Tests required
- Test asserting no local notification gets scheduled when
  `SettingsRepository.get('notifications') === 'false'`.
- Test asserting the sync scheduler doesn't run when `autoSync === 'false'`.
- Test asserting `NotificationRepository.append()` is actually called at
  each of the four confirmed integration points, and that
  `getUnreadCount()` reflects it (the regression test that would have
  caught Problem B).
- If darkMode is implemented: a rendering test confirming the theme
  actually changes; if removed: no test needed, just confirm the toggle
  and its UI are gone.
