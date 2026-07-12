// __tests__/services/PhotoService.test.ts

const mockGetInfo = jest.fn();
const mockMakeDir = jest.fn().mockResolvedValue(undefined);
const mockCopy    = jest.fn().mockResolvedValue(undefined);
const mockDelete  = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///docs/',
  getInfoAsync:      (...a: any[]) => mockGetInfo(...a),
  makeDirectoryAsync:(...a: any[]) => mockMakeDir(...a),
  copyAsync:         (...a: any[]) => mockCopy(...a),
  deleteAsync:       (...a: any[]) => mockDelete(...a),
}));

import { copyToAppStorage, deletePhoto, photoExists } from '../../src/services/PhotoService';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('copyToAppStorage', () => {
  it('copies file and returns permanent uri', async () => {
    mockGetInfo.mockResolvedValue({ exists: true });
    const uri = await copyToAppStorage('file:///tmp/photo.jpg', 'item1');
    expect(mockCopy).toHaveBeenCalledWith(expect.objectContaining({ from: 'file:///tmp/photo.jpg' }));
    expect(uri).toMatch(/^file:\/\/\/docs\/photos\/insp-item1-/);
  });

  it('creates photos dir when missing', async () => {
    mockGetInfo.mockResolvedValue({ exists: false });
    await copyToAppStorage('file:///tmp/photo.jpg', 'item1');
    expect(mockMakeDir).toHaveBeenCalled();
  });

  it('returns null on copy error', async () => {
    mockGetInfo.mockResolvedValue({ exists: true });
    mockCopy.mockRejectedValueOnce(new Error('disk full'));
    const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item1');
    expect(result).toBeNull();
  });

  it('handles uri without extension gracefully', async () => {
    mockGetInfo.mockResolvedValue({ exists: true });
    const uri = await copyToAppStorage('file:///tmp/photo', 'item2');
    expect(uri).toMatch(/\.photo$|photo$/);
  });
});

describe('deletePhoto', () => {
  it('deletes file when it exists', async () => {
    mockGetInfo.mockResolvedValue({ exists: true });
    await deletePhoto('file:///docs/photos/p.jpg');
    expect(mockDelete).toHaveBeenCalledWith('file:///docs/photos/p.jpg', { idempotent: true });
  });

  it('skips delete when file does not exist', async () => {
    mockGetInfo.mockResolvedValue({ exists: false });
    await deletePhoto('file:///docs/photos/gone.jpg');
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('swallows errors silently', async () => {
    mockGetInfo.mockRejectedValueOnce(new Error('fs error'));
    await expect(deletePhoto('file:///docs/photos/err.jpg')).resolves.not.toThrow();
  });
});

describe('photoExists', () => {
  it('returns true when file exists', async () => {
    mockGetInfo.mockResolvedValue({ exists: true });
    expect(await photoExists('file:///docs/photos/p.jpg')).toBe(true);
  });

  it('returns false when file does not exist', async () => {
    mockGetInfo.mockResolvedValue({ exists: false });
    expect(await photoExists('file:///docs/photos/gone.jpg')).toBe(false);
  });

  it('returns false on error', async () => {
    mockGetInfo.mockRejectedValueOnce(new Error('fs error'));
    expect(await photoExists('file:///docs/photos/err.jpg')).toBe(false);
  });
});
