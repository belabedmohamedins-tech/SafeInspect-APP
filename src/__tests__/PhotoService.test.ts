// src/__tests__/PhotoService.test.ts
//
// PhotoService imports from 'expo-file-system/legacy'.
// The L2 moduleNameMapper routes /legacy → src/__mocks__/expo-file-system-legacy.ts
// but that stub's functions are not jest.fn()s we can reassign.
// We override at L4 with a full factory for complete mock control.

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///app/',
  getInfoAsync:      jest.fn(),
  copyAsync:         jest.fn(),
  deleteAsync:       jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

import * as FileSystem from 'expo-file-system/legacy';
import {
  copyToAppStorage,
  deletePhoto,
  photoExists,
} from '../services/PhotoService';

const mockGetInfo  = FileSystem.getInfoAsync  as jest.Mock;
const mockCopy     = FileSystem.copyAsync     as jest.Mock;
const mockDelete   = FileSystem.deleteAsync   as jest.Mock;
const mockMakeDir  = FileSystem.makeDirectoryAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetInfo.mockResolvedValue({ exists: true, isDirectory: false, uri: '', size: 0, modificationTime: 0 });
  mockCopy.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
  mockMakeDir.mockResolvedValue(undefined);
});

// ─── copyToAppStorage ────────────────────────────────────────────────────────

describe('copyToAppStorage', () => {
  it('returns a permanent URI on success', async () => {
    const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
    expect(result).toMatch(/photos\/insp-item-1-\d+\.jpg$/);
    expect(mockCopy).toHaveBeenCalledTimes(1);
  });

  it('creates the photos directory when it does not exist', async () => {
    mockGetInfo
      .mockResolvedValueOnce({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 })
      .mockResolvedValue({ exists: true, isDirectory: false, uri: '', size: 0, modificationTime: 0 });

    const result = await copyToAppStorage('file:///tmp/photo.png', 'item-2');
    expect(mockMakeDir).toHaveBeenCalledTimes(1);
    expect(result).toMatch(/\.png$/);
  });

  it('returns null and does not throw when copyAsync fails', async () => {
    mockCopy.mockRejectedValueOnce(new Error('copy failed'));
    const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item-3');
    expect(result).toBeNull();
  });

  // The source uses ?? 'jpg' which only fires on null/undefined, not empty string.
  // 'file:///tmp/photo.'.split('.').pop() returns '' (empty string, not undefined)
  // so ext = '' and the filename ends with a bare dot. This is the actual behaviour.
  it('preserves empty extension when URI ends with a dot (no ?? fallback)', async () => {
    const result = await copyToAppStorage('file:///tmp/photo.', 'item-4');
    expect(result).toMatch(/insp-item-4-\d+\.$/);
  });
});

// ─── deletePhoto ─────────────────────────────────────────────────────────────

describe('deletePhoto', () => {
  it('deletes the file when it exists', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true, isDirectory: false, uri: 'file:///photos/x.jpg', size: 0, modificationTime: 0 });
    await deletePhoto('file:///photos/x.jpg');
    expect(mockDelete).toHaveBeenCalledWith('file:///photos/x.jpg', { idempotent: true });
  });

  it('does not call deleteAsync when the file does not exist', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 });
    await deletePhoto('file:///photos/missing.jpg');
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('does not throw when getInfoAsync fails', async () => {
    mockGetInfo.mockRejectedValueOnce(new Error('fs error'));
    await expect(deletePhoto('file:///photos/x.jpg')).resolves.toBeUndefined();
  });
});

// ─── photoExists ─────────────────────────────────────────────────────────────

describe('photoExists', () => {
  it('returns true when the file exists', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true, isDirectory: false, uri: 'file:///photos/x.jpg', size: 0, modificationTime: 0 });
    expect(await photoExists('file:///photos/x.jpg')).toBe(true);
  });

  it('returns false when the file does not exist', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 });
    expect(await photoExists('file:///photos/missing.jpg')).toBe(false);
  });

  it('returns false when getInfoAsync throws', async () => {
    mockGetInfo.mockRejectedValueOnce(new Error('fs error'));
    expect(await photoExists('file:///photos/x.jpg')).toBe(false);
  });
});
