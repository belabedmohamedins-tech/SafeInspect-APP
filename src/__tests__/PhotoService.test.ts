// src/__tests__/PhotoService.test.ts

jest.mock('expo-file-system', () => ({
  documentDirectory:   'file:///app/',
  getInfoAsync:        jest.fn(),
  makeDirectoryAsync:  jest.fn(),
  copyAsync:           jest.fn(),
  deleteAsync:         jest.fn(),
}));

import * as FileSystem from 'expo-file-system';
import { copyToAppStorage, deletePhoto, photoExists } from '../services/PhotoService';

// ─── Typed stubs ─────────────────────────────────────────────────────────────
const mockGetInfo = jest.mocked(FileSystem.getInfoAsync);
const mockMakeDir = jest.mocked(FileSystem.makeDirectoryAsync);
const mockCopy    = jest.mocked(FileSystem.copyAsync);
const mockDelete  = jest.mocked(FileSystem.deleteAsync);

beforeEach(() => {
  jest.clearAllMocks();
  mockMakeDir.mockResolvedValue(undefined);
  mockCopy.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
});

describe('PhotoService', () => {
  describe('copyToAppStorage', () => {
    it('creates the photos directory when it does not exist', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: false } as any);
      await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
      expect(mockMakeDir).toHaveBeenCalledWith('file:///app/photos/', { intermediates: true });
    });

    it('skips directory creation when it already exists', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: true } as any);
      await copyToAppStorage('file:///tmp/photo.jpg', 'item-1');
      expect(mockMakeDir).not.toHaveBeenCalled();
    });

    it('copies the file and returns the permanent URI', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: true } as any);
      const result = await copyToAppStorage('file:///tmp/photo.jpg', 'item-42');
      expect(mockCopy).toHaveBeenCalledWith(expect.objectContaining({ from: 'file:///tmp/photo.jpg' }));
      expect(result).toMatch(/^file:\/\/\/app\/photos\/insp-item-42-\d+\.jpg$/);
    });

    it('preserves the file extension from the source URI', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: true } as any);
      const result = await copyToAppStorage('file:///tmp/snapshot.png', 'item-1');
      expect(result).toMatch(/\.png$/);
    });

    it('returns null when copyAsync throws', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: true } as any);
      mockCopy.mockRejectedValueOnce(new Error('disk full'));
      expect(await copyToAppStorage('file:///tmp/photo.jpg', 'item-1')).toBeNull();
    });
  });

  describe('deletePhoto', () => {
    it('deletes the file when it exists', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: true } as any);
      await deletePhoto('file:///app/photos/insp-item-1-123.jpg');
      expect(mockDelete).toHaveBeenCalledWith('file:///app/photos/insp-item-1-123.jpg', { idempotent: true });
    });

    it('does not call deleteAsync when the file does not exist', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: false } as any);
      await deletePhoto('file:///app/photos/ghost.jpg');
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('does not throw when getInfoAsync throws', async () => {
      mockGetInfo.mockRejectedValueOnce(new Error('fs error'));
      await expect(deletePhoto('file:///app/photos/x.jpg')).resolves.toBeUndefined();
    });
  });

  describe('photoExists', () => {
    it('returns true when the file exists', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: true } as any);
      expect(await photoExists('file:///app/photos/x.jpg')).toBe(true);
    });

    it('returns false when the file does not exist', async () => {
      mockGetInfo.mockResolvedValueOnce({ exists: false } as any);
      expect(await photoExists('file:///app/photos/x.jpg')).toBe(false);
    });

    it('returns false when getInfoAsync throws', async () => {
      mockGetInfo.mockRejectedValueOnce(new Error('fs error'));
      expect(await photoExists('file:///app/photos/x.jpg')).toBe(false);
    });
  });
});
