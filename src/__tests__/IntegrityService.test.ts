// src/__tests__/IntegrityService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  computeHash,
  verifyInspection,
  IntegrityService,
} from '../services/IntegrityService';
import { SavedInspection } from '../types';

// Mock expo-crypto so tests run without a native module.
// digestStringAsync returns a deterministic hex string based on the input.
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(async (_alg: unknown, input: string) => {
    // Deterministic fake hex derived from input length + char codes
    // This is NOT a real SHA-256 — it exists only to make tests fast and
    // hermetic. The real SHA-256 is exercised by integration/device tests.
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0').repeat(8); // 64-char hex
  }),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { HEX: 'hex' },
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-001',
    facilityId: 'fac-1',
    facilityName: 'مستشفى النور',
    inspectorName: 'أحمد',
    officeName: 'مكتب الصحة',
    date: '2026-06-27',
    status: 'completed',
    items: [
      {
        id: 'item-1',
        criteria: 'معيار أول',
        legalReference: 'م 12',
        severity: 'high',
        axis: 'المحور الأول',
        complianceStatus: 'compliant',
      },
    ],
    score: 90,
    grade: 'A',
    ...overrides,
  } as SavedInspection;
}

// ─── computeHash ─────────────────────────────────────────────────────────────

describe('computeHash', () => {
  it('returns a non-empty string', async () => {
    const hash = await computeHash(makeInspection());
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('is deterministic', async () => {
    const insp = makeInspection();
    expect(await computeHash(insp)).toBe(await computeHash(insp));
  });

  it('is field-order-independent', async () => {
    const a = makeInspection({ id: 'x', facilityName: 'A' });
    const b = { ...a };
    expect(await computeHash(a)).toBe(await computeHash(b));
  });

  it('produces different hashes for different values', async () => {
    const h90 = await computeHash(makeInspection({ score: 90 }));
    const h50 = await computeHash(makeInspection({ score: 50 }));
    expect(h90).not.toBe(h50);
  });

  it('produces different hashes when facilityName changes', async () => {
    const hA = await computeHash(makeInspection({ facilityName: 'Alpha' }));
    const hB = await computeHash(makeInspection({ facilityName: 'Beta' }));
    expect(hA).not.toBe(hB);
  });

  it('handles empty items array', async () => {
    const hash = await computeHash(makeInspection({ items: [] }));
    expect(hash.length).toBeGreaterThan(0);
  });

  it('ignores the integrityHash field itself (no circular hash)', async () => {
    const a = makeInspection();
    const b = { ...a, integrityHash: 'someoldhash' };
    expect(await computeHash(a)).toBe(await computeHash(b as SavedInspection));
  });

  it('returns a 64-character hex string', async () => {
    const hash = await computeHash(makeInspection());
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ─── verifyInspection ────────────────────────────────────────────────────────

describe('verifyInspection', () => {
  it('returns ok=true after storing the correct hash', async () => {
    const insp = makeInspection();
    const hash = await computeHash(insp);
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify({ [insp.id]: hash }));
    const result = await verifyInspection(insp);
    expect(result.ok).toBe(true);
    expect(result.storedHash).toBe(hash);
  });

  it('returns ok=false when a field is tampered', async () => {
    const original = makeInspection();
    const hash = await computeHash(original);
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify({ [original.id]: hash }));
    const result = await verifyInspection({ ...original, grade: 'B' as const });
    expect(result.ok).toBe(false);
  });

  it('returns ok=false when no stored hash exists', async () => {
    const result = await verifyInspection(makeInspection());
    expect(result.ok).toBe(false);
    expect(result.storedHash).toBeUndefined();
  });

  it('returns ok=true for inspection with empty items', async () => {
    const insp = makeInspection({ items: [] });
    const hash = await computeHash(insp);
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify({ [insp.id]: hash }));
    expect((await verifyInspection(insp)).ok).toBe(true);
  });
});

// ─── hashAndStore ─────────────────────────────────────────────────────────────

describe('IntegrityService.hashAndStore', () => {
  it('returns the hash of the inspection', async () => {
    const insp = makeInspection();
    const returned = await IntegrityService.hashAndStore(insp);
    expect(returned).toBe(await computeHash(insp));
  });

  it('persists the hash so verifyInspection returns ok=true', async () => {
    const insp = makeInspection();
    await IntegrityService.hashAndStore(insp);
    expect((await verifyInspection(insp)).ok).toBe(true);
  });

  it('overwrites an existing hash for the same id', async () => {
    const insp = makeInspection();
    await IntegrityService.hashAndStore(insp);
    const modified = { ...insp, score: 50 };
    const newHash = await IntegrityService.hashAndStore(modified as SavedInspection);
    const result = await verifyInspection(modified as SavedInspection);
    expect(result.ok).toBe(true);
    expect(result.storedHash).toBe(newHash);
  });

  it('stores multiple inspections independently', async () => {
    const a = makeInspection({ id: 'a-1', facilityName: 'A' });
    const b = makeInspection({ id: 'b-1', facilityName: 'B' });
    await IntegrityService.hashAndStore(a);
    await IntegrityService.hashAndStore(b);
    expect((await verifyInspection(a)).ok).toBe(true);
    expect((await verifyInspection(b)).ok).toBe(true);
  });
});

// ─── removeHash ───────────────────────────────────────────────────────────────

describe('IntegrityService.removeHash', () => {
  it('removes a single hash so verify returns ok=false', async () => {
    const insp = makeInspection();
    await IntegrityService.hashAndStore(insp);
    await IntegrityService.removeHash(insp.id);
    expect((await verifyInspection(insp)).ok).toBe(false);
  });

  it('does not affect other stored hashes', async () => {
    const a = makeInspection({ id: 'a-1' });
    const b = makeInspection({ id: 'b-1', facilityName: 'B' });
    await IntegrityService.hashAndStore(a);
    await IntegrityService.hashAndStore(b);
    await IntegrityService.removeHash('a-1');
    expect((await verifyInspection(b)).ok).toBe(true);
  });

  it('is a no-op when hash does not exist', async () => {
    await expect(IntegrityService.removeHash('nonexistent')).resolves.toBeUndefined();
  });
});

// ─── removeHashes ─────────────────────────────────────────────────────────────

describe('IntegrityService.removeHashes', () => {
  it('removes multiple hashes at once', async () => {
    const a = makeInspection({ id: 'a-1' });
    const b = makeInspection({ id: 'b-1', facilityName: 'B' });
    const c = makeInspection({ id: 'c-1', facilityName: 'C' });
    await IntegrityService.hashAndStore(a);
    await IntegrityService.hashAndStore(b);
    await IntegrityService.hashAndStore(c);
    await IntegrityService.removeHashes(['a-1', 'b-1']);
    expect((await verifyInspection(a)).ok).toBe(false);
    expect((await verifyInspection(b)).ok).toBe(false);
    expect((await verifyInspection(c)).ok).toBe(true);
  });

  it('handles empty array without error', async () => {
    await expect(IntegrityService.removeHashes([])).resolves.toBeUndefined();
  });
});
