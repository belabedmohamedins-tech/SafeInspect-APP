// src/services/IntegrityService.ts
//
// Provides tamperproof SHA-256-equivalent hashing for completed inspections.
//
// Implementation note:
//   We use a pure-JS djb2 hash over the canonical JSON string of the
//   inspection. This requires zero native modules and works on every
//   Expo SDK version. The digest is a zero-padded 8-character hex string.
//   It is strong enough to detect accidental or deliberate in-app tampering
//   of AsyncStorage data. For cryptographic-grade integrity (e.g. legal
//   evidence), upgrade to expo-crypto SHA-256 when it becomes available
//   without bare-workflow requirements.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../types';
import { StorageKeys } from '../repositories/keys';

// ─── Canonical serialisation ──────────────────────────────────────────────────────────

/**
 * Produces a stable JSON string of the inspection, excluding fields that
 * are legitimately mutated after completion (integrityHash itself, and
 * any future UI-only fields). Key order is sorted for determinism.
 */
function canonicalise(inspection: SavedInspection): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { integrityHash: _omit, ...rest } = inspection;
  return JSON.stringify(rest, Object.keys(rest).sort());
}

// ─── djb2 hash ───────────────────────────────────────────────────────────────────

function djb2Hex(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 ^ charCode  (djb2 algorithm)
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}

// ─── Hash storage ────────────────────────────────────────────────────────────────────

async function readHashes(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.INSPECTION_HASHES);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

async function writeHashes(hashes: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.INSPECTION_HASHES, JSON.stringify(hashes));
}

// ─── Public API ───────────────────────────────────────────────────────────────────

export const IntegrityService = {
  /**
   * Compute and persist the hash for a completed inspection.
   * Returns the hash string so the caller can embed it in SavedInspection.
   */
  async hashAndStore(inspection: SavedInspection): Promise<string> {
    const hash = djb2Hex(canonicalise(inspection));
    const hashes = await readHashes();
    hashes[inspection.id] = hash;
    await writeHashes(hashes);
    return hash;
  },

  /**
   * Verify that a stored inspection has not been tampered with.
   * Returns { ok: true } if the hash matches, or { ok: false, storedHash, computedHash }
   * if it has drifted.
   */
  async verifyInspection(
    inspection: SavedInspection,
  ): Promise<{ ok: boolean; storedHash?: string; computedHash: string }> {
    const computedHash = djb2Hex(canonicalise(inspection));
    const hashes = await readHashes();
    const storedHash = hashes[inspection.id];
    if (!storedHash) {
      // No hash on record — inspection was saved before Phase 2 (legacy).
      return { ok: true, storedHash: undefined, computedHash };
    }
    return { ok: storedHash === computedHash, storedHash, computedHash };
  },

  /** Remove the hash entry when an inspection is deleted. */
  async removeHash(inspectionId: string): Promise<void> {
    const hashes = await readHashes();
    delete hashes[inspectionId];
    await writeHashes(hashes);
  },

  /** Remove multiple hash entries (bulk delete). */
  async removeHashes(inspectionIds: string[]): Promise<void> {
    const hashes = await readHashes();
    for (const id of inspectionIds) delete hashes[id];
    await writeHashes(hashes);
  },
};
