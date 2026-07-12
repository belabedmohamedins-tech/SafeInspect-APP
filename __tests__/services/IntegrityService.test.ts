// __tests__/services/IntegrityService.test.ts
// expo-crypto is mocked at L4 to avoid pulling in expo's fetch polyfill
// (which requires a real Response class not present in the Jest environment).

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { HEX: 'hex' },
  digestStringAsync: jest.fn(async (_alg: string, input: string) => {
    // Deterministic stub: length-prefixed hex so different strings differ
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += ((input.charCodeAt(i % input.length) + i) & 0xf).toString(16);
    }
    return hash;
  }),
}), { virtual: true });

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IntegrityService, computeHash, verifyInspection } from '../../src/services/IntegrityService';
import { SavedInspection } from '../../src/types';

const base: SavedInspection = {
  id: 'insp-1',
  facilityId: 'f1',
  facilityName: 'Test Facility',
  date: '2026-01-01',
  score: 90,
  status: 'completed',
  sections: [],
  integrityHash: undefined,
} as unknown as SavedInspection;

beforeEach(() => {
  (AsyncStorage as any).__resetStore();
});

describe('computeHash', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await IntegrityService.computeHash(base);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic for the same inspection', async () => {
    const h1 = await IntegrityService.computeHash(base);
    const h2 = await IntegrityService.computeHash(base);
    expect(h1).toBe(h2);
  });

  it('differs for different inspection IDs', async () => {
    const h1 = await IntegrityService.computeHash(base);
    const h2 = await IntegrityService.computeHash({ ...base, id: 'insp-2' });
    expect(h1).not.toBe(h2);
  });

  it('omits the integrityHash field from serialisation', async () => {
    const withHash = { ...base, integrityHash: 'should-be-ignored' } as unknown as SavedInspection;
    const h1 = await IntegrityService.computeHash(base);
    const h2 = await IntegrityService.computeHash(withHash);
    expect(h1).toBe(h2);
  });

  it('named export computeHash delegates correctly', async () => {
    const h = await computeHash(base);
    expect(h).toHaveLength(64);
  });
});

describe('hashAndStore', () => {
  it('persists the hash and returns it', async () => {
    const hash = await IntegrityService.hashAndStore(base);
    expect(hash).toHaveLength(64);
    const stored = await AsyncStorage.getItem('INSPECTION_HASHES');
    const parsed = JSON.parse(stored!);
    expect(parsed['insp-1']).toBe(hash);
  });

  it('overwrites an existing hash for the same inspection', async () => {
    await IntegrityService.hashAndStore(base);
    await IntegrityService.hashAndStore(base);
    const stored = await AsyncStorage.getItem('INSPECTION_HASHES');
    const parsed = JSON.parse(stored!);
    expect(Object.keys(parsed).filter(k => k === 'insp-1')).toHaveLength(1);
  });
});

describe('verifyInspection', () => {
  it('returns ok=false when no stored hash', async () => {
    const result = await IntegrityService.verifyInspection(base);
    expect(result.ok).toBe(false);
    expect(result.storedHash).toBeUndefined();
    expect(result.computedHash).toHaveLength(64);
  });

  it('returns ok=true when hash matches', async () => {
    await IntegrityService.hashAndStore(base);
    const result = await IntegrityService.verifyInspection(base);
    expect(result.ok).toBe(true);
  });

  it('returns ok=false when inspection is tampered', async () => {
    await IntegrityService.hashAndStore(base);
    const tampered = { ...base, score: 50 } as unknown as SavedInspection;
    const result = await IntegrityService.verifyInspection(tampered);
    expect(result.ok).toBe(false);
  });

  it('named export verifyInspection delegates correctly', async () => {
    const result = await verifyInspection(base);
    expect(result.ok).toBe(false); // no stored hash
  });
});

describe('removeHash', () => {
  it('removes a single hash', async () => {
    await IntegrityService.hashAndStore(base);
    await IntegrityService.removeHash('insp-1');
    const stored = await AsyncStorage.getItem('INSPECTION_HASHES');
    const parsed = JSON.parse(stored!);
    expect(parsed['insp-1']).toBeUndefined();
  });
});

describe('removeHashes', () => {
  it('removes multiple hashes', async () => {
    await IntegrityService.hashAndStore(base);
    await IntegrityService.hashAndStore({ ...base, id: 'insp-2' } as unknown as SavedInspection);
    await IntegrityService.removeHashes(['insp-1', 'insp-2']);
    const stored = await AsyncStorage.getItem('INSPECTION_HASHES');
    const parsed = JSON.parse(stored!);
    expect(parsed['insp-1']).toBeUndefined();
    expect(parsed['insp-2']).toBeUndefined();
  });
});
