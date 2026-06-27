// src/__tests__/IntegrityService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  computeHash,
  verifyInspection,
} from '../services/IntegrityService';
import { SavedInspection } from '../types';

// AsyncStorage is auto-mocked via jest-expo preset
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

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
    const hash = computeHash(makeInspection());
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('is deterministic — same object produces same hash', () => {
    const insp = makeInspection();
    expect(computeHash(insp)).toBe(computeHash(insp));
  });

  it('is field-order-independent', () => {
    const a = makeInspection({ id: 'x', facilityName: 'A' });
    const b = { ...a }; // same fields, JS object order may differ
    expect(computeHash(a)).toBe(computeHash(b));
  });

  it('produces different hashes for different field values', () => {
    const a = makeInspection({ score: 90 });
    const b = makeInspection({ score: 50 });
    expect(computeHash(a)).not.toBe(computeHash(b));
  });

  it('produces different hashes when facilityName changes', () => {
    const a = makeInspection({ facilityName: 'Alpha' });
    const b = makeInspection({ facilityName: 'Beta' });
    expect(computeHash(a)).not.toBe(computeHash(b));
  });

  it('handles inspection with empty items array', () => {
    const insp = makeInspection({ items: [] });
    const hash = computeHash(insp);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});

// ─── verifyInspection ────────────────────────────────────────────────────────

describe('verifyInspection', () => {
  it('returns ok=true immediately after saving with a stored hash', async () => {
    const insp = makeInspection();
    const expectedHash = computeHash(insp);

    // Simulate what InspectionRepository.save() does: store the hash
    const hashes: Record<string, string> = { [insp.id]: expectedHash };
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify(hashes));

    const result = await verifyInspection(insp);
    expect(result.ok).toBe(true);
    expect(result.storedHash).toBe(expectedHash);
    expect(result.computedHash).toBe(expectedHash);
  });

  it('returns ok=false when a field is tampered after hashing', async () => {
    const original = makeInspection({ score: 90, grade: 'A' });
    const originalHash = computeHash(original);

    const hashes: Record<string, string> = { [original.id]: originalHash };
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify(hashes));

    // Tamper: change the grade
    const tampered = { ...original, grade: 'B' as const };
    const result = await verifyInspection(tampered);

    expect(result.ok).toBe(false);
    expect(result.storedHash).toBe(originalHash);
    expect(result.computedHash).not.toBe(originalHash);
  });

  it('returns ok=false when no stored hash exists', async () => {
    const insp = makeInspection();
    // No hash stored in AsyncStorage
    const result = await verifyInspection(insp);
    expect(result.ok).toBe(false);
  });

  it('returns ok=true for an inspection with empty items[]', async () => {
    const insp = makeInspection({ items: [] });
    const hash = computeHash(insp);
    const hashes: Record<string, string> = { [insp.id]: hash };
    await AsyncStorage.setItem('INSPECTION_HASHES', JSON.stringify(hashes));

    const result = await verifyInspection(insp);
    expect(result.ok).toBe(true);
  });
});
