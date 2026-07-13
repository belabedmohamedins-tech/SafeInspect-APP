// src/services/SessionLockService.ts
//
// Tracks user activity and triggers a PIN lock after a configurable
// inactivity period.  The service is a simple in-memory singleton — no
// persistence is needed because a cold-start always goes through the
// PIN guard in _layout.tsx anyway.
//
// Usage:
//   SessionLockService.recordActivity();   // call on any user interaction
//   SessionLockService.shouldLock();       // true when timeout elapsed
//   SessionLockService.reset();            // call after successful unlock

import { SettingsRepository } from '../repositories/SettingsRepository';

// Fallback timeout in milliseconds (5 minutes)
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

class SessionLockServiceClass {
  private lastActivityAt: number = Date.now();
  private lockedOut = false;

  /** Call whenever the user interacts with the app. */
  recordActivity(): void {
    this.lastActivityAt = Date.now();
  }

  /** Mark session as locked (called just before redirecting to pin-lock). */
  markLocked(): void {
    this.lockedOut = true;
  }

  /** Call after the user successfully unlocks. */
  reset(): void {
    this.lastActivityAt = Date.now();
    this.lockedOut = false;
  }

  /** Returns true if the inactivity timeout has been exceeded. */
  async shouldLock(): Promise<boolean> {
    if (this.lockedOut) return false; // already locked, don't re-trigger

    const timeoutMs = await this.getTimeoutMs();
    if (timeoutMs === 0) return false; // 0 = disabled

    const elapsed = Date.now() - this.lastActivityAt;
    return elapsed >= timeoutMs;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async getTimeoutMs(): Promise<number> {
    try {
      const settings = await SettingsRepository.getAll();
      const raw = settings['sessionLockTimeoutMinutes'];
      if (raw === undefined || raw === null) return DEFAULT_TIMEOUT_MS;
      const minutes = parseInt(raw as string, 10);
      if (isNaN(minutes) || minutes <= 0) return 0; // disabled
      return minutes * 60 * 1000;
    } catch {
      return DEFAULT_TIMEOUT_MS;
    }
  }
}

export const SessionLockService = new SessionLockServiceClass();
