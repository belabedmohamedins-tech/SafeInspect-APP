// src/__tests__/PhotoService.test.ts
//
// expo-file-system is mocked at Layer 2 via moduleNameMapper.
// We control getInfoAsync / copyAsync / deleteAsync / makeDirectoryAsync
// via jest.spyOn on the imported module.

import * as FileSystem from 'expo-file-system';
import {
  copyToAppStorage,
  deletePhoto,
  photoExists,
} from '../../src/services/PhotoService';

const spyGetInfo  = jest.spyOn(FileSystem, 'getInfoAsync');
const spyCopy     = jest.spyOn(FileSystem, 'copyAsync');
const spyDelete   = jest.spyOn(FileSystem, 'deleteAsync');
const spyMakeDir  = jest.spyOn(FileSystem, 'makeDirectoryAsync');

beforeEach(() => {
  jest.clearAllMocks();
  // Default: photos dir already exists → no makeDirectoryAsync needed.
  spyGetInfo.mockResolvedValue({ exists: true, isDirectory: false, uri: '', size: 0, modificationTime: 0 });
  spyCopy.mockResolvedValue(undefined);
  spyDelete.mockResolvedValue(undefined);
  spyMakeDir.mockResolvedValue(undefined);
});

// ─── copyToAppStorage ────────────────────────────────────────────────────────

describe('copyToAppStorage', () => {
  it('returns a permanent URI on success', async () => {
    const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
    expect(result).toMatch(/photos\/insp-item-1-\d+\.jpg$/);
    expect(spyCopy).toHaveBeenCalledTimes(1);
  });

  it('creates the photos directory when it does not exist', async () => {
    spyGetInfo
      // First call: photos dir check → does not exist
      .mockResolvedValueOnce({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 })
      // Second call: (if any subsequent check occurs)
      .mockResolvedValue({ exists: true, isDirectory: false, uri: '', size: 0, modificationTime: 0 });

    const result = await copyToAppStorage('file:///tmp/photo.png', 'item-2');
    expect(spyMakeDir).toHaveBeenCalledTimes(1);
    expect(result).toMatch(/\.png$/);
  });

  it('returns null and does not throw when copyAsync fails', async () => {
    spyCopy.mockRejectedValueOnce(new Error('copy failed'));
    const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item-3');
    expect(result).toBeNull();
  });

  // Covers line 36 branch: URI with no dot → pop() returns a string with no
  // '?' separator, but the ?? 'jpg' fallback fires when pop() returns undefined
  // (URI has no extension segment at all).
  it('falls back to jpg extension when URI has no extension (line 36 ?? branch)', async () => {
    // A URI with no dot → split('.') gives a single-element array → pop()
    // returns that element, then split('?')[0] gives it unchanged.
    // To actually hit the ?? fallback we need pop() to return undefined,
    // which happens when the URI ends with a dot (empty last segment).
    const result = await copyToAppStorage('file:///tmp/photo.', 'item-4');
    // empty string after the dot → split('.').pop() = '' → falsy → ?? 'jpg'
    expect(result).toMatch(/\.jpg$/);
  });
});

// ─── deletePhoto ─────────────────────────────────────────────────────────────

describe('deletePhoto', () => {
  it('deletes the file when it exists', async () => {
    spyGetInfo.mockResolvedValueOnce({ exists: true, isDirectory: false, uri: 'file:///photos/x.jpg', size: 0, modificationTime: 0 });
    await deletePhoto('file:///photos/x.jpg');
    expect(spyDelete).toHaveBeenCalledWith('file:///photos/x.jpg', { idempotent: true });
  });

  it('does not call deleteAsync when the file does not exist', async () => {
    spyGetInfo.mockResolvedValueOnce({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 });
    await deletePhoto('file:///photos/missing.jpg');
    expect(spyDelete).not.toHaveBeenCalled();
  });

  it('does not throw when getInfoAsync fails', async () => {
    spyGetInfo.mockRejectedValueOnce(new Error('fs error'));
    await expect(deletePhoto('file:///photos/x.jpg')).resolves.toBeUndefined();
  });
});

// ─── photoExists ─────────────────────────────────────────────────────────────

describe('photoExists', () => {
  it('returns true when the file exists', async () => {
    spyGetInfo.mockResolvedValueOnce({ exists: true, isDirectory: false, uri: 'file:///photos/x.jpg', size: 0, modificationTime: 0 });
    expect(await photoExists('file:///photos/x.jpg')).toBe(true);
  });

  it('returns false when the file does not exist', async () => {
    spyGetInfo.mockResolvedValueOnce({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 });
    expect(await photoExists('file:///photos/missing.jpg')).toBe(false);
  });

  it('returns false when getInfoAsync throws', async () => {
    spyGetInfo.mockRejectedValueOnce(new Error('fs error'));
    expect(await photoExists('file:///photos/x.jpg')).toBe(false);
  });
});
