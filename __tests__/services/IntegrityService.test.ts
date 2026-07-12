// __tests__/services/IntegrityService.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { HEX: 'hex' },
  digestStringAsync: jest.fn((_alg: string, str: string) =>
    Promise.resolve(Buffer.from(str).toString('hex').slice(0, 64).padEnd(64, '0'))
  ),
}));

import { IntegrityService } from '../../src/services/IntegrityService';

const makeInspection = (overrides = {}) => ({
  id: 'i1',
  facilityId: 'f1',
  facilityName: 'FAC',
  inspectorName: 'Ahmed',
  date: '2026-01-01',
  status: 'completed' as const,
  items: [],
  grade: 'A',
  score: 95,
  integrityHash: undefined,
  ...overrides,
});

beforeEach(() => {
  AsyncStorage.clear();
});

describe('IntegrityService.computeHash', () => {
  it('returns a non-empty string', async () => {
    const hash = await IntegrityService.computeHash(makeInspection() as any);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('excludes integrityHash field from computation (deterministic)', async () => {
    const base = makeInspection();
    const withHash = makeInspection({ integrityHash: 'abc123' });
    const h1 = await IntegrityService.computeHash(base as any);
    const h2 = await IntegrityService.computeHash(withHash as any);
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different inspections', async () => {
    const h1 = await IntegrityService.computeHash(makeInspection({ score: 95 }) as any);
    const h2 = await IntegrityService.computeHash(makeInspection({ score: 80 }) as any);
    expect(h1).not.toBe(h2);
  });
});

describe('IntegrityService.hashAndStore', () => {
  it('returns hash and stores it', async () => {
    const insp = makeInspection();
    const hash = await IntegrityService.hashAndStore(insp as any);
    expect(hash).toBeTruthy();
    const result = await IntegrityService.verifyInspection(insp as any);
    expect(result.ok).toBe(true);
    expect(result.storedHash).toBe(hash);
  });

  it('overwrites previous hash', async () => {
    const insp = makeInspection();
    const h1 = await IntegrityService.hashAndStore(insp as any);
    const h2 = await IntegrityService.hashAndStore(insp as any);
    expect(h1).toBe(h2); // same content → same hash
  });
});

describe('IntegrityService.verifyInspection', () => {
  it('returns ok=false when no stored hash', async () => {
    const result = await IntegrityService.verifyInspection(makeInspection() as any);
    expect(result.ok).toBe(false);
    expect(result.storedHash).toBeUndefined();
  });

  it('returns ok=false when inspection was tampered', async () => {
    const insp = makeInspection();
    await IntegrityService.hashAndStore(insp as any);
    const tampered = { ...insp, score: 50 };
    const result = await IntegrityService.verifyInspection(tampered as any);
    expect(result.ok).toBe(false);
  });

  it('returns ok=true for intact inspection', async () => {
    const insp = makeInspection();
    await IntegrityService.hashAndStore(insp as any);
    const result = await IntegrityService.verifyInspection(insp as any);
    expect(result.ok).toBe(true);
  });
});

describe('IntegrityService.removeHash / removeHashes', () => {
  it('removeHash deletes a single entry', async () => {
    const insp = makeInspection();
    await IntegrityService.hashAndStore(insp as any);
    await IntegrityService.removeHash('i1');
    const result = await IntegrityService.verifyInspection(insp as any);
    expect(result.ok).toBe(false);
  });

  it('removeHashes deletes multiple entries', async () => {
    const i1 = makeInspection({ id: 'i1' });
    const i2 = makeInspection({ id: 'i2', score: 80 });
    await IntegrityService.hashAndStore(i1 as any);
    await IntegrityService.hashAndStore(i2 as any);
    await IntegrityService.removeHashes(['i1', 'i2']);
    expect((await IntegrityService.verifyInspection(i1 as any)).ok).toBe(false);
    expect((await IntegrityService.verifyInspection(i2 as any)).ok).toBe(false);
  });
});
