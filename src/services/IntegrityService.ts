// src/services/IntegrityService.ts
//
// Provides cryptographically sound SHA-256 hashing for completed inspections.
//
// Implementation:
//   expo-crypto digestStringAsync with CryptoDigestAlgorithm.SHA256.
//   The digest is a 64-character lowercase hex string.
//   This is legally defensible as a document integrity proof.

import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../types';
import { StorageKeys } from '../repositories/keys';

// ─── Canonical serialisation ─────────────────────────────────────────────────

function canonicalise(inspection: SavedInspection): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { integrityHash: _omit, ...rest } = inspection;
  return JSON.stringify(rest, Object.keys(rest).sort());
}

// ─── SHA-256 hash ─────────────────────────────────────────────────────────────

async function sha256Hex(str: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    str,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
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
   * Compute the SHA-256 hash of an inspection.
   * Used by InspectionRepository.save() on first completion.
   */
  async computeHash(inspection: SavedInspection): Promise<string> {
    return sha256Hex(canonicalise(inspection));
  },

  /**
   * Compute and persist the SHA-256 hash for a completed inspection.
   * Returns the hash string so the caller can embed it in SavedInspection.
   */
  async hashAndStore(inspection: SavedInspection): Promise<string> {
    const hash = await sha256Hex(canonicalise(inspection));
    const hashes = await readHashes();
    hashes[inspection.id] = hash;
    await writeHashes(hashes);
    return hash;
  },

  /**
   * Verify that a stored inspection has not been tampered with.
   * Returns ok=false when no stored hash exists (treat as unverified/tampered).
   */
  async verifyInspection(
    inspection: SavedInspection,
  ): Promise<{ ok: boolean; storedHash?: string; computedHash: string }> {
    const computedHash = await sha256Hex(canonicalise(inspection));
    const hashes = await readHashes();
    const storedHash = hashes[inspection.id];
    if (!storedHash) {
      return { ok: false, storedHash: undefined, computedHash };
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
export const computeHash      = (i: SavedInspection) => IntegrityService.computeHash(i);
export const verifyInspection = IntegrityService.verifyInspection.bind(IntegrityService);
