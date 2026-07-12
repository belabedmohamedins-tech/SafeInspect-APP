// __tests__/services/PhotoService.test.ts
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///app/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

import * as FileSystem from 'expo-file-system';
import { copyToAppStorage, deletePhoto, photoExists } from '../../src/services/PhotoService';

const mockGetInfo = FileSystem.getInfoAsync as jest.Mock;
const mockMakeDir = FileSystem.makeDirectoryAsync as jest.Mock;
const mockCopy    = FileSystem.copyAsync as jest.Mock;
const mockDelete  = FileSystem.deleteAsync as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('copyToAppStorage', () => {
  it('creates dir when missing then copies, returns dest URI', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: false });
    mockMakeDir.mockResolvedValue(undefined);
    mockCopy.mockResolvedValue(undefined);

    const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
    expect(mockMakeDir).toHaveBeenCalled();
    expect(mockCopy).toHaveBeenCalledWith(expect.objectContaining({ from: 'file:///tmp/photo.jpg' }));
    expect(result).toContain('insp-item-1-');
    expect(result).toContain('.jpg');
  });

  it('skips makeDir when dir already exists', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true });
    mockCopy.mockResolvedValue(undefined);

    await copyToAppStorage('file:///tmp/x.png', 'item-2');
    expect(mockMakeDir).not.toHaveBeenCalled();
    expect(mockCopy).toHaveBeenCalled();
  });

  it('preserves extension from URI', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true });
    mockCopy.mockResolvedValue(undefined);
    const result = await copyToAppStorage('file:///tmp/shot.png', 'item-3');
    expect(result).toContain('.png');
  });

  it('strips query string from extension', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true });
    mockCopy.mockResolvedValue(undefined);
    const result = await copyToAppStorage('file:///tmp/shot.jpg?token=abc', 'item-4');
    expect(result).toContain('.jpg');
    expect(result).not.toContain('?');
  });

  it('returns null on copy error', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true });
    mockCopy.mockRejectedValue(new Error('copy failed'));
    const result = await copyToAppStorage('file:///tmp/bad.jpg', 'item-5');
    expect(result).toBeNull();
  });
});

describe('deletePhoto', () => {
  it('deletes file when it exists', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true });
    mockDelete.mockResolvedValue(undefined);
    await deletePhoto('file:///app/photos/photo.jpg');
    expect(mockDelete).toHaveBeenCalledWith('file:///app/photos/photo.jpg', { idempotent: true });
  });

  it('skips delete when file does not exist', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: false });
    await deletePhoto('file:///app/photos/missing.jpg');
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('swallows errors silently', async () => {
    mockGetInfo.mockRejectedValue(new Error('fs error'));
    await expect(deletePhoto('file:///app/photos/err.jpg')).resolves.toBeUndefined();
  });
});

describe('photoExists', () => {
  it('returns true when file exists', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: true });
    expect(await photoExists('file:///app/photos/p.jpg')).toBe(true);
  });

  it('returns false when file does not exist', async () => {
    mockGetInfo.mockResolvedValueOnce({ exists: false });
    expect(await photoExists('file:///app/photos/p.jpg')).toBe(false);
  });

  it('returns false on error', async () => {
    mockGetInfo.mockRejectedValue(new Error('err'));
    expect(await photoExists('file:///app/photos/p.jpg')).toBe(false);
  });
});
