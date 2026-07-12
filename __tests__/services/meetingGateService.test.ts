// __tests__/services/meetingGateService.test.ts
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    save: jest.fn(),
  },
}));

import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { persistOpeningMeetingDone, persistClosingMeetingDone } from '../../src/services/meetingGateService';
import { SavedInspection } from '../../src/types';

const mockGetById = InspectionRepository.getById as jest.Mock;
const mockSave = InspectionRepository.save as jest.Mock;

const base: SavedInspection = {
  id: 'insp-1',
  facilityId: 'f1',
  status: 'completed',
  openingMeetingDone: false,
  closingMeetingDone: false,
} as unknown as SavedInspection;

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('persistOpeningMeetingDone', () => {
  it('sets openingMeetingDone=true and saves', async () => {
    mockGetById.mockResolvedValue({ ...base });
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ openingMeetingDone: true }));
  });

  it('does nothing when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('is idempotent — calling twice is safe', async () => {
    mockGetById.mockResolvedValue({ ...base, openingMeetingDone: true });
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ openingMeetingDone: true }));
  });
});

describe('persistClosingMeetingDone', () => {
  it('sets closingMeetingDone=true and saves', async () => {
    mockGetById.mockResolvedValue({ ...base });
    await persistClosingMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ closingMeetingDone: true }));
  });

  it('does nothing when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('is idempotent — calling twice is safe', async () => {
    mockGetById.mockResolvedValue({ ...base, closingMeetingDone: true });
    await persistClosingMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ closingMeetingDone: true }));
  });
});
