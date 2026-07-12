// __tests__/services/PhotoService.test.ts
const mockGetInfoAsync       = jest.fn();
const mockMakeDirectoryAsync = jest.fn();
const mockCopyAsync          = jest.fn();
const mockDeleteAsync        = jest.fn();

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///app/',
  getInfoAsync:       (...a: any[]) => mockGetInfoAsync(...a),
  makeDirectoryAsync: (...a: any[]) => mockMakeDirectoryAsync(...a),
  copyAsync:          (...a: any[]) => mockCopyAsync(...a),
  deleteAsync:        (...a: any[]) => mockDeleteAsync(...a),
}));

import { copyToAppStorage, deletePhoto, photoExists } from '../../src/services/PhotoService';

beforeEach(() => {
  jest.clearAllMocks();
  mockMakeDirectoryAsync.mockResolvedValue(undefined);
  mockCopyAsync.mockResolvedValue(undefined);
  mockDeleteAsync.mockResolvedValue(undefined);
});

describe('copyToAppStorage', () => {
  it('creates the photos dir when it does not exist, then copies', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: false });
    const dest = await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
    expect(mockMakeDirectoryAsync).toHaveBeenCalledWith(
      'file:///app/photos/', { intermediates: true }
    );
    expect(mockCopyAsync).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'file:///tmp/photo.jpg' })
    );
    expect(dest).toMatch(/file:\/\/\/app\/photos\/insp-item-1-.+\.jpg/);
  });

  it('skips mkdir when dir already exists', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
    expect(mockMakeDirectoryAsync).not.toHaveBeenCalled();
  });

  it('preserves the source extension', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    const dest = await copyToAppStorage('file:///tmp/photo.png', 'item-2');
    expect(dest).toMatch(/\.png$/);
  });

  it('returns null on error', async () => {
    mockGetInfoAsync.mockRejectedValue(new Error('fs error'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const dest = await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
    expect(dest).toBeNull();
    warnSpy.mockRestore();
  });
});

describe('deletePhoto', () => {
  it('deletes file when it exists', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    await deletePhoto('file:///app/photos/insp-1.jpg');
    expect(mockDeleteAsync).toHaveBeenCalledWith(
      'file:///app/photos/insp-1.jpg', { idempotent: true }
    );
  });

  it('does not call deleteAsync when file does not exist', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: false });
    await deletePhoto('file:///app/photos/missing.jpg');
    expect(mockDeleteAsync).not.toHaveBeenCalled();
  });

  it('swallows errors gracefully', async () => {
    mockGetInfoAsync.mockRejectedValue(new Error('fs error'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(deletePhoto('file:///app/photos/bad.jpg')).resolves.toBeUndefined();
    warnSpy.mockRestore();
  });
});

describe('photoExists', () => {
  it('returns true when file exists', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    expect(await photoExists('file:///app/photos/insp-1.jpg')).toBe(true);
  });

  it('returns false when file does not exist', async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: false });
    expect(await photoExists('file:///app/photos/missing.jpg')).toBe(false);
  });

  it('returns false on error', async () => {
    mockGetInfoAsync.mockRejectedValue(new Error('fs error'));
    expect(await photoExists('file:///app/photos/bad.jpg')).toBe(false);
  });
});
