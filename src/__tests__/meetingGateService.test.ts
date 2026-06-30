// src/__tests__/meetingGateService.test.ts
import {
  persistOpeningMeetingDone,
  persistClosingMeetingDone,
} from '../services/meetingGateService';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection } from '../types';

jest.mock('../repositories/InspectionRepository');

const mockGetById = InspectionRepository.getById as jest.Mock;
const mockSave   = InspectionRepository.save   as jest.Mock;

const baseInspection: SavedInspection = {
  id: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test',
  facilityAddress: '',
  date: '2024-01-01',
  status: 'draft',
  openingMeetingDone: false,
  closingMeetingDone: false,
  items: [],
} as unknown as SavedInspection;

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('persistOpeningMeetingDone', () => {
  it('does nothing when inspection is not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('missing-id');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves with openingMeetingDone = true', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection });
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true }),
    );
  });

  it('preserves all other fields on save', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection, facilityName: 'Preserved' });
    await persistOpeningMeetingDone('insp-1');
    const saved = mockSave.mock.calls[0][0];
    expect(saved.facilityName).toBe('Preserved');
    expect(saved.id).toBe('insp-1');
  });

  it('is idempotent (already true stays true)', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection, openingMeetingDone: true });
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true }),
    );
  });
});

describe('persistClosingMeetingDone', () => {
  it('does nothing when inspection is not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('missing-id');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves with closingMeetingDone = true', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection });
    await persistClosingMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true }),
    );
  });

  it('preserves all other fields on save', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection, facilityId: 'fac-99' });
    await persistClosingMeetingDone('insp-1');
    const saved = mockSave.mock.calls[0][0];
    expect(saved.facilityId).toBe('fac-99');
  });

  it('is idempotent (already true stays true)', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection, closingMeetingDone: true });
    await persistClosingMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true }),
    );
  });
});
