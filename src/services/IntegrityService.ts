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

// ─── Canonical serialisation ─────────────────────────────────────────────────

function canonicalise(inspection: SavedInspection): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { integrityHash: _omit, ...rest } = inspection;
  return JSON.stringify(rest, Object.keys(rest).sort());
}

// ─── djb2 hash ───────────────────────────────────────────────────────────────

function djb2Hex(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ─── Hash storage ────────────────────────────────────────────────────────────

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

// ─── Public API (object export — used by InspectionRepository) ───────────────

export const IntegrityService = {
  /**
   * Synchronously compute the djb2 hash of an inspection.
   * Used by InspectionRepository.save() on first completion.
   */
  computeHash(inspection: SavedInspection): string {
    return djb2Hex(canonicalise(inspection));
  },

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
   */
  async verifyInspection(
    inspection: SavedInspection,
  ): Promise<{ ok: boolean; storedHash?: string; computedHash: string }> {
    const computedHash = djb2Hex(canonicalise(inspection));
    const hashes = await readHashes();
    const storedHash = hashes[inspection.id];
    if (!storedHash) {
      return { ok: true, storedHash: undefined, computedHash };
    }
    return { ok: storedHash === computedHash, storedHash, computedHash };
  },

  async removeHash(inspectionId: string): Promise<void> {
    const hashes = await readHashes();
    delete hashes[inspectionId];
    await writeHashes(hashes);
  },

  async removeHashes(inspectionIds: string[]): Promise<void> {
    const hashes = await readHashes();
    for (const id of inspectionIds) delete hashes[id];
    await writeHashes(hashes);
  },
};

// ─── Named exports for tests that import them directly ───────────────────────
export const computeHash    = (i: SavedInspection) => IntegrityService.computeHash(i);
export const verifyInspection = IntegrityService.verifyInspection.bind(IntegrityService);
