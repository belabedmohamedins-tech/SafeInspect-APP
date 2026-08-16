# SPEC 05 — PIN lockout counter is bypassable; recovery path is destructive
Priority: P1. Dependencies: SPEC 01 (recovery path only becomes safe once
backup/restore actually works).

## Problem A — lockout counter stored unencrypted
`src/repositories/AuthRepository.ts` stores the PIN itself correctly in
`SecureStore` (OS-encrypted), but `PIN_FAILED_ATTEMPTS` — the counter that
enforces the 5-attempt lockout (`MAX_ATTEMPTS`) — is stored in plain
`AsyncStorage`. Anything with access to app storage (debugging tools,
partial backup extraction, another exploit path) can reset that single key
and get unlimited PIN guesses against a 4-digit code.

## Problem B — lockout recovery is destructive
`app/pin-lock.tsx` states the recovery path after lockout is "contact admin
to reset (or reinstall)." Reinstalling wipes local SQLite. Given SPEC 01's
finding that backup/restore currently protects nothing, an inspector who
trips the lockout has no real path back to unsynced inspection data —
lockout recovery and data loss are currently the same event.

## Desired behavior
### A.
Move `PIN_FAILED_ATTEMPTS` storage from `AsyncStorage` to `SecureStore` in
`AuthRepository.ts` (`getFailedAttempts` / `incrementFailedAttempts` /
`resetFailedAttempts` — same `secureGet`/`secureSet` helpers already used
for the PIN and biometric flag, just apply them to this key too).

### B.
Do not attempt a UX redesign in this spec — the concrete, low-risk fix is:
ensure automatic background sync (`SyncService`) and the SPEC 01 backup fix
are both functioning BEFORE this spec is closed, so "reinstall" no longer
implies data loss for any inspection that has had a chance to sync or be
backed up. Additionally, surface a clear warning in the PIN-setup screen
(`app/screens/pin-setup.tsx`) that enabling a PIN without a recent backup
risks data loss on lockout — this is a UI copy change, not an architecture
change.

## Reason
A 4-digit PIN is a reasonable UX tradeoff for a field app, but only if the
lockout that makes brute-forcing infeasible is itself tamper-resistant, and
only if getting locked out doesn't equal losing a day's inspection records.

## Affected files
- `src/repositories/AuthRepository.ts` (`getFailedAttempts`,
  `incrementFailedAttempts`, `resetFailedAttempts`, `setPin`, `clearPin` —
  swap the storage calls for these attempt-counter operations)
- `app/screens/pin-setup.tsx` (warning copy, minor)

## Tests required
- Existing `AuthRepository` tests updated to assert `PIN_FAILED_ATTEMPTS`
  goes through `SecureStore` mocks, not `AsyncStorage` mocks.
- Regression: `isLockedOut()` behavior unchanged (still trips at 5 attempts,
  still resets on correct PIN / `setPin`).
