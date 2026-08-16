# SPEC 12 — Three unrelated minor server/client hardening items
Priority: P2 for all three. Dependencies: none. These were originally
found while investigating SPEC 09 (the sync/approval routing chain) but
are independent of it and of each other — kept separate here specifically
so they don't get bundled into that PR and cause scope bleed. Fine to
tackle in one PR together, or split further — they don't depend on each
other either.

## Item A — unused rate-limiting dependency; no login throttling
`server/package.json` lists `express-rate-limit` as a dependency, but it's
never imported or used anywhere in `index.ts` or any route file (confirmed
via grep). `/auth/login` currently has no throttling on repeated failed
attempts — `matricule` values are likely sequential/predictable employee
IDs, making this a real brute-force surface. Since the dependency is
already installed, wiring it in is low-effort: apply a rate limiter to
`/api/auth/login` specifically (a stricter window than the general API).

**Affected files:** `server/src/index.ts` or `server/src/routes/auth.ts`
(wherever the limiter middleware is applied).

**Test:** hit `/api/auth/login` with wrong credentials repeatedly, assert
requests get rate-limited after N attempts.

## Item B — push notification stale-token cleanup doesn't work
`server/src/lib/push.ts`'s `DeviceNotRegistered` cleanup tries to match a
ticket back to its original message via a `_to`/`to` property
(`(m as ExpoPushMessage & { _to?: string })._to`, `(receipt as unknown as
Record<string,string>).to` — both accessed through invented type
assertions, itself a code smell). Per Expo's own documentation, confirmed
via web search: tickets are matched to their originating messages by
**array index** (the nth ticket is for the nth message), not by any `.to`
field, and `DeviceNotRegistered` is specifically a **receipt-level**
error — available only via the separate `getPushNotificationReceiptsAsync()`
call using the receipt IDs returned on successful tickets, roughly a day
later — not something present on the immediate send-time response this
code is checking. The current code can never actually match or clean up a
stale token; dead tokens accumulate in `pushToken` indefinitely. Not
urgent (sends still succeed, nothing crashes), but real.

**Desired fix:** implement the correct two-phase flow — send messages,
collect receipt IDs from tickets with `status: 'ok'`, store them, then on
a later pass (e.g. a scheduled job) call `getPushNotificationReceiptsAsync()`
with those IDs and clean up tokens whose receipt shows
`DeviceNotRegistered`. This is a bigger change than a one-line fix —
budget accordingly.

**Affected files:** `server/src/lib/push.ts`.

**Test:** mock a receipt response containing `DeviceNotRegistered`, assert
the corresponding token is removed from `pushToken` — using the corrected
two-phase flow, not the current ticket-inspection logic.

## Item C — server-login "Skip" doesn't persist, contradicting its own
## documented design
`app/screens/server-login.tsx`'s header comment states: "server-login is
optional; users can skip to use the app offline-only." The screen has a
working Skip button (`handleSkip()`) that navigates to home without
logging in. But `handleSkip()` writes no persistence flag anywhere —
confirmed via grep, no `SettingsRepository` usage in the file at all. The
launch guard in `app/_layout.tsx` that routes here has no exception for a
prior skip:
```
const serverSession = await isLoggedIn();
if (!serverSession && !currentPath.includes('server-login')) {
  router.replace('/screens/server-login' as Href);
  return;
}
```
Since `isLoggedIn()` stays false for a user who skipped, they are sent
right back to this mandatory screen on **every single app launch**,
indefinitely, with no way to stop the prompt short of actually logging
in. This directly contradicts the screen's own documented intent and is
particularly damaging given this app's core design is offline-first — the
one group of users this skip path exists for (those who want to work
without a server account) get nagged every time they open the app.

**Desired fix:** `handleSkip()` sets a `SettingsRepository` flag (e.g.
`serverLoginSkipped: 'true'`), and the `_layout.tsx` guard checks it
alongside `serverSession` before redirecting. Decide with the maintainer
whether the skip should be permanent or re-prompted periodically (e.g.
once a week) — either is reasonable, but silently re-prompting every
launch is not.

**Affected files:** `app/screens/server-login.tsx`, `app/_layout.tsx`.

**Test:** tap Skip on server-login, simulate the `_layout.tsx` guard
running again (app relaunch), assert the user is NOT redirected back to
server-login.
