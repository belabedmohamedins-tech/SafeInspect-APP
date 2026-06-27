// __tests__/repositories/SettingsRepository.test.ts
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { StorageKeys } from '../../src/repositories/keys';

// ─── Mock AsyncStorage with in-memory map (multiGet / multiSet) ───────────────

const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn((keys: string[]) =>
    Promise.resolve(keys.map((k: string) => [k, mockStore.get(k) ?? null] as [string, string | null]))
  ),
  multiSet: jest.fn((pairs: [string, string][]) => {
    pairs.forEach(([k, v]) => mockStore.set(k, v));
    return Promise.resolve();
  }),
}));

beforeEach(() => mockStore.clear());

// ─── get ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.get', () => {
  it('returns DEFAULTS when storage is empty', async () => {
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
    expect(settings.inspectionCause).toBe('');
  });

  it('returns values from storage when present', async () => {
    mockStore.set(StorageKeys.OFFICE_NAME, 'مكتب الصحة');
    mockStore.set(StorageKeys.INSPECTOR_NAME, 'محمد');
    mockStore.set(StorageKeys.INSPECTION_CAUSE, 'روتيني');
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('مكتب الصحة');
    expect(settings.inspectorName).toBe('محمد');
    expect(settings.inspectionCause).toBe('روتيني');
  });

  it('returns defaults on AsyncStorage error (graceful fallback)', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.multiGet.mockRejectedValueOnce(new Error('storage failure'));
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('');
    expect(settings.inspectorName).toBe('');
  });
});

// ─── set ──────────────────────────────────────────────────────────────────────

describe('SettingsRepository.set', () => {
  it('persists a partial update', async () => {
    await SettingsRepository.set({ inspectorName: 'عمر' });
    const settings = await SettingsRepository.get();
    expect(settings.inspectorName).toBe('عمر');
    expect(settings.officeName).toBe(''); // untouched default
  });

  it('persists a full settings update', async () => {
    await SettingsRepository.set({
      officeName: 'مكتب',
      inspectorName: 'علي',
      inspectionCause: 'شكوى',
    });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('مكتب');
    expect(settings.inspectorName).toBe('علي');
    expect(settings.inspectionCause).toBe('شكوى');
  });

  it('does not call multiSet for an empty object', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.multiSet.mockClear();
    await SettingsRepository.set({});
    expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
  });

  it('overwrites a previously set value', async () => {
    await SettingsRepository.set({ officeName: 'قديم' });
    await SettingsRepository.set({ officeName: 'جديد' });
    const settings = await SettingsRepository.get();
    expect(settings.officeName).toBe('جديد');
  });
});
