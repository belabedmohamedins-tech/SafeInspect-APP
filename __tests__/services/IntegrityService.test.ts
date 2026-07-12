// __tests__/services/IntegrityService.test.ts
const mockDigest = jest.fn();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('expo-crypto', () => ({
  digestStringAsync: (...a: any[]) => mockDigest(...a),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding:        { HEX: 'hex' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...a: any[]) => mockGetItem(...a),
  setItem: (...a: any[]) => mockSetItem(...a),
}));

jest.mock('../../src/repositories/keys', () => ({
  StorageKeys: { INSPECTION_HASHES: '@inspection_hashes' },
}));

import { IntegrityService } from '../../src/services/IntegrityService';

const INSP: any = { id: 'insp-1', facilityId: 'f1', date: '2026-07-12', items: [] };

beforeEach(() => {
  jest.clearAllMocks();
  mockDigest.mockResolvedValue('abc123hash');
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
});

describe('IntegrityService.computeHash', () => {
  it('returns the hex hash from digestStringAsync', async () => {
    const h = await IntegrityService.computeHash(INSP);
    expect(h).toBe('abc123hash');
    expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(String), { encoding: 'hex' });
  });

  it('excludes integrityHash from the canonical string', async () => {
    await IntegrityService.computeHash({ ...INSP, integrityHash: 'old-hash' });
    const canonical: string = mockDigest.mock.calls[0][1];
    expect(canonical).not.toContain('integrityHash');
  });
});

describe('IntegrityService.hashAndStore', () => {
  it('stores the hash and returns it', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ 'other': 'xyz' }));
    const h = await IntegrityService.hashAndStore(INSP);
    expect(h).toBe('abc123hash');
    const stored = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(stored['insp-1']).toBe('abc123hash');
    expect(stored['other']).toBe('xyz'); // preserves existing entries
  });

  it('handles empty storage (getItem returns null)', async () => {
    const h = await IntegrityService.hashAndStore(INSP);
    expect(h).toBe('abc123hash');
    const stored = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(stored['insp-1']).toBe('abc123hash');
  });
});

describe('IntegrityService.verifyInspection', () => {
  it('returns ok=true when stored hash matches computed hash', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ 'insp-1': 'abc123hash' }));
    const r = await IntegrityService.verifyInspection(INSP);
    expect(r.ok).toBe(true);
    expect(r.storedHash).toBe('abc123hash');
    expect(r.computedHash).toBe('abc123hash');
  });

  it('returns ok=false when stored hash differs from computed hash', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ 'insp-1': 'different-hash' }));
    const r = await IntegrityService.verifyInspection(INSP);
    expect(r.ok).toBe(false);
  });

  it('returns ok=false when no hash stored for the inspection', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({}));
    const r = await IntegrityService.verifyInspection(INSP);
    expect(r.ok).toBe(false);
    expect(r.storedHash).toBeUndefined();
  });

  it('returns ok=false when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);
    const r = await IntegrityService.verifyInspection(INSP);
    expect(r.ok).toBe(false);
  });
});

describe('IntegrityService.removeHash / removeHashes', () => {
  it('removeHash deletes a single hash entry', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ 'insp-1': 'h1', 'insp-2': 'h2' }));
    await IntegrityService.removeHash('insp-1');
    const stored = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(stored['insp-1']).toBeUndefined();
    expect(stored['insp-2']).toBe('h2');
  });

  it('removeHashes deletes multiple hash entries', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ 'insp-1': 'h1', 'insp-2': 'h2', 'insp-3': 'h3' }));
    await IntegrityService.removeHashes(['insp-1', 'insp-2']);
    const stored = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(stored['insp-1']).toBeUndefined();
    expect(stored['insp-2']).toBeUndefined();
    expect(stored['insp-3']).toBe('h3');
  });
});
