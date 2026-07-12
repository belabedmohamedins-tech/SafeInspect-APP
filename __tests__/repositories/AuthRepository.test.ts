// __tests__/repositories/AuthRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthRepository, setPlatformOS } from '../../src/repositories/AuthRepository';

// expo-local-authentication mock
const mockHasHardware = jest.fn();
const mockIsEnrolled = jest.fn();
const mockSupportedTypes = jest.fn();
const mockAuthenticate = jest.fn();

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: () => mockHasHardware(),
  isEnrolledAsync: () => mockIsEnrolled(),
  supportedAuthenticationTypesAsync: () => mockSupportedTypes(),
  authenticateAsync: (opts: any) => mockAuthenticate(opts),
  AuthenticationType: { FACIAL_RECOGNITION: 1, FINGERPRINT: 2, IRIS: 3 },
}));

// expo-secure-store mock
const secureStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  getItemAsync: jest.fn((key: string) => Promise.resolve(secureStore[key] ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => { secureStore[key] = value; return Promise.resolve(); }),
  deleteItemAsync: jest.fn((key: string) => { delete secureStore[key]; return Promise.resolve(); }),
}));

beforeEach(() => {
  AsyncStorage.clear();
  Object.keys(secureStore).forEach(k => delete secureStore[k]);
  jest.clearAllMocks();
  setPlatformOS('ios'); // native mode by default
});

describe('AuthRepository — PIN', () => {
  it('returns null when no PIN set', async () => {
    expect(await AuthRepository.getPin()).toBeNull();
  });

  it('sets and retrieves PIN', async () => {
    await AuthRepository.setPin('1234');
    expect(await AuthRepository.getPin()).toBe('1234');
  });

  it('deletes PIN when null passed', async () => {
    await AuthRepository.setPin('1234');
    await AuthRepository.setPin(null);
    expect(await AuthRepository.getPin()).toBeNull();
  });
});

describe('AuthRepository — failed attempts', () => {
  it('returns 0 initially', async () => {
    expect(await AuthRepository.getFailedAttempts()).toBe(0);
  });

  it('increments and returns new count', async () => {
    const count = await AuthRepository.incrementFailedAttempts();
    expect(count).toBe(1);
    const count2 = await AuthRepository.incrementFailedAttempts();
    expect(count2).toBe(2);
  });

  it('resetFailedAttempts clears the counter', async () => {
    await AuthRepository.incrementFailedAttempts();
    await AuthRepository.resetFailedAttempts();
    expect(await AuthRepository.getFailedAttempts()).toBe(0);
  });

  it('isLockedOut returns false below MAX_ATTEMPTS', async () => {
    for (let i = 0; i < 4; i++) await AuthRepository.incrementFailedAttempts();
    expect(await AuthRepository.isLockedOut()).toBe(false);
  });

  it('isLockedOut returns true at MAX_ATTEMPTS (5)', async () => {
    for (let i = 0; i < 5; i++) await AuthRepository.incrementFailedAttempts();
    expect(await AuthRepository.isLockedOut()).toBe(true);
  });
});

describe('AuthRepository — biometric (native)', () => {
  it('isBiometricAvailable: hardware + enrolled → true', async () => {
    mockHasHardware.mockResolvedValue(true);
    mockIsEnrolled.mockResolvedValue(true);
    expect(await AuthRepository.isBiometricAvailable()).toBe(true);
  });

  it('isBiometricAvailable: no hardware → false', async () => {
    mockHasHardware.mockResolvedValue(false);
    expect(await AuthRepository.isBiometricAvailable()).toBe(false);
  });

  it('isBiometricAvailable: hardware but not enrolled → false', async () => {
    mockHasHardware.mockResolvedValue(true);
    mockIsEnrolled.mockResolvedValue(false);
    expect(await AuthRepository.isBiometricAvailable()).toBe(false);
  });

  it('getBiometricType returns FACE_RECOGNITION', async () => {
    mockSupportedTypes.mockResolvedValue([1]);
    expect(await AuthRepository.getBiometricType()).toBe('FACE_RECOGNITION');
  });

  it('getBiometricType returns FINGERPRINT', async () => {
    mockSupportedTypes.mockResolvedValue([2]);
    expect(await AuthRepository.getBiometricType()).toBe('FINGERPRINT');
  });

  it('getBiometricType returns IRIS', async () => {
    mockSupportedTypes.mockResolvedValue([3]);
    expect(await AuthRepository.getBiometricType()).toBe('IRIS');
  });

  it('getBiometricType returns none when no types', async () => {
    mockSupportedTypes.mockResolvedValue([]);
    expect(await AuthRepository.getBiometricType()).toBe('none');
  });

  it('authenticateWithBiometric returns true on success', async () => {
    mockAuthenticate.mockResolvedValue({ success: true });
    expect(await AuthRepository.authenticateWithBiometric()).toBe(true);
  });

  it('authenticateWithBiometric returns false on failure', async () => {
    mockAuthenticate.mockResolvedValue({ success: false });
    expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
  });

  it('authenticateWithBiometric returns false on exception', async () => {
    mockAuthenticate.mockRejectedValue(new Error('HW error'));
    expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
  });
});

describe('AuthRepository — web platform fallbacks', () => {
  beforeEach(() => setPlatformOS('web'));

  it('isBiometricAvailable returns false on web', async () => {
    expect(await AuthRepository.isBiometricAvailable()).toBe(false);
  });

  it('getBiometricType returns none on web', async () => {
    expect(await AuthRepository.getBiometricType()).toBe('none');
  });

  it('authenticateWithBiometric returns false on web', async () => {
    expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
  });

  it('getPin uses AsyncStorage on web', async () => {
    await AsyncStorage.setItem('APP_PIN', '9999');
    const pin = await AuthRepository.getPin();
    expect(pin).toBe('9999');
  });
});

describe('AuthRepository — biometric enabled flag', () => {
  it('isBiometricEnabled returns false when not set', async () => {
    expect(await AuthRepository.isBiometricEnabled()).toBe(false);
  });

  it('setBiometricEnabled stores the flag', async () => {
    await AuthRepository.setBiometricEnabled(true);
    expect(await AuthRepository.isBiometricEnabled()).toBe(true);
  });
});
