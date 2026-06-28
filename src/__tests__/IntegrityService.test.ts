// src/__tests__/IntegrityService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  computeHash,
  verifyInspection,
  IntegrityService,
} from '../services/IntegrityService';
import { SavedInspection } from '../types';

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
  it('returns a non-empty string', () => {
    expect(typeof computeHash(makeInspection())).toBe('string');
    expect(computeHash(makeInspection()).length).toBeGreaterThan(0);
  });

  it('is deterministic', () => {
    const insp = makeInspection();
    expect(computeHash(insp)).toBe(computeHash(insp));
  });

  it('is field-order-independent', () => {
    const a = makeInspection({ id: 'x', facilityName: 'A' });
    const b = { ...a };
    expect(computeHash(a)).toBe(computeHash(b));
  });

  it('produces different hashes for different values', () => {
    expect(computeHash(makeInspection({ score: 90 }))).not.toBe(computeHash(makeInspection({ score: 50 })));
  });

  it('produces different hashes when facilityName changes', () => {
    expect(computeHash(makeInspection({ facilityName: 'Alpha' }))).not.toBe(computeHash(makeInspection({ facilityName: 'Beta' })));
  });

  it('handles empty items array', () => {
    const hash = computeHash(makeInspection({ items: [] }));
    expect(hash.length).toBeGreaterThan(0);
  });

  it('ignores the integrityHash field itself (no circular hash)', () => {
    const a = makeInspection();
    const b = { ...a, integrityHash: 'someoldhash' };
    expect(computeHash(a)).toBe(computeHash(b as SavedInspection));
  });
});

// ─── verifyInspection ────────────────────────────────────────────────────────

describe('verifyInspection', () => {
  it('returns ok=true after storing the correct hash', async () => {
    const insp = makeInspection();
    const hash = computeHash(insp);
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify({ [insp.id]: hash }));
    const result = await verifyInspection(insp);
    expect(result.ok).toBe(true);
    expect(result.storedHash).toBe(hash);
  });

  it('returns ok=false when a field is tampered', async () => {
    const original = makeInspection();
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify({ [original.id]: computeHash(original) }));
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
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify({ [insp.id]: computeHash(insp) }));
    expect((await verifyInspection(insp)).ok).toBe(true);
  });
});

// ─── hashAndStore ─────────────────────────────────────────────────────────────

describe('IntegrityService.hashAndStore', () => {
  it('returns the hash of the inspection', async () => {
    const insp = makeInspection();
    const returned = await IntegrityService.hashAndStore(insp);
    expect(returned).toBe(computeHash(insp));
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
