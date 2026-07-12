// __tests__/services/IntegrityService.test.ts
import { IntegrityService, computeHash, verifyInspection } from '../../src/services/IntegrityService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../../src/types';

function makeInsp(id: string, overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id,
    facilityId: 'f1',
    status: 'completed',
    date: '2024-01-01',
    items: [],
    title: 'Test',
    integrityHash: undefined,
    ...overrides,
  } as unknown as SavedInspection;
}

beforeEach(() => (AsyncStorage as any).__resetStore());

describe('IntegrityService.computeHash', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await IntegrityService.computeHash(makeInsp('i1'));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same inspection produces same hash', async () => {
    const ins = makeInsp('i1');
    const h1 = await IntegrityService.computeHash(ins);
    const h2 = await IntegrityService.computeHash(ins);
    expect(h1).toBe(h2);
  });

  it('different inspections produce different hashes', async () => {
    const h1 = await IntegrityService.computeHash(makeInsp('i1'));
    const h2 = await IntegrityService.computeHash(makeInsp('i2'));
    expect(h1).not.toBe(h2);
  });

  it('omits integrityHash field from canonical input', async () => {
    const withHash = makeInsp('i1', { integrityHash: 'abc' } as any);
    const withoutHash = makeInsp('i1');
    const h1 = await IntegrityService.computeHash(withHash);
    const h2 = await IntegrityService.computeHash(withoutHash);
    expect(h1).toBe(h2);
  });
});

describe('computeHash named export', () => {
  it('delegates to IntegrityService.computeHash', async () => {
    const hash = await computeHash(makeInsp('i1'));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('IntegrityService.hashAndStore', () => {
  it('returns hash and persists it', async () => {
    const ins = makeInsp('i1');
    const hash = await IntegrityService.hashAndStore(ins);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    const raw = await AsyncStorage.getItem('inspection_hashes');
    const stored = JSON.parse(raw!);
    expect(stored['i1']).toBe(hash);
  });

  it('overwrites existing hash for same id', async () => {
    await IntegrityService.hashAndStore(makeInsp('i1'));
    const h2 = await IntegrityService.hashAndStore(makeInsp('i1'));
    const raw = JSON.parse((await AsyncStorage.getItem('inspection_hashes'))!);
    expect(raw['i1']).toBe(h2);
  });
});

describe('IntegrityService.verifyInspection', () => {
  it('ok=false when no stored hash', async () => {
    const res = await IntegrityService.verifyInspection(makeInsp('i99'));
    expect(res.ok).toBe(false);
    expect(res.storedHash).toBeUndefined();
    expect(res.computedHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ok=true when stored hash matches', async () => {
    const ins = makeInsp('i1');
    await IntegrityService.hashAndStore(ins);
    const res = await IntegrityService.verifyInspection(ins);
    expect(res.ok).toBe(true);
    expect(res.storedHash).toBe(res.computedHash);
  });

  it('ok=false when inspection is tampered', async () => {
    const ins = makeInsp('i1');
    await IntegrityService.hashAndStore(ins);
    const tampered = { ...ins, title: 'TAMPERED' };
    const res = await IntegrityService.verifyInspection(tampered);
    expect(res.ok).toBe(false);
  });
});

describe('verifyInspection named export', () => {
  it('delegates correctly', async () => {
    const ins = makeInsp('ix');
    const res = await verifyInspection(ins);
    expect(res.ok).toBe(false); // no stored hash yet
  });
});

describe('IntegrityService.removeHash / removeHashes', () => {
  it('removeHash deletes one entry', async () => {
    await IntegrityService.hashAndStore(makeInsp('i1'));
    await IntegrityService.hashAndStore(makeInsp('i2'));
    await IntegrityService.removeHash('i1');
    const raw = JSON.parse((await AsyncStorage.getItem('inspection_hashes'))!);
    expect(raw['i1']).toBeUndefined();
    expect(raw['i2']).toBeDefined();
  });

  it('removeHashes deletes multiple entries', async () => {
    await IntegrityService.hashAndStore(makeInsp('i1'));
    await IntegrityService.hashAndStore(makeInsp('i2'));
    await IntegrityService.hashAndStore(makeInsp('i3'));
    await IntegrityService.removeHashes(['i1', 'i3']);
    const raw = JSON.parse((await AsyncStorage.getItem('inspection_hashes'))!);
    expect(raw['i1']).toBeUndefined();
    expect(raw['i3']).toBeUndefined();
    expect(raw['i2']).toBeDefined();
  });
});
