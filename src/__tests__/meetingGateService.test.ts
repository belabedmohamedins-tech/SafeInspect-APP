// src/__tests__/meetingGateService.test.ts
import {
  persistOpeningMeetingDone,
  persistClosingMeetingDone,
} from '../../src/services/meetingGateService';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    save: jest.fn(),
  },
}));

const mockGet = InspectionRepository.getById as jest.Mock;
const mockSave = InspectionRepository.save as jest.Mock;

const baseInspection = {
  id: 'ins-1',
  facilityId: 'f-1',
  date: new Date().toISOString(),
  openingMeetingDone: false,
  closingMeetingDone: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('persistOpeningMeetingDone', () => {
  it('sets openingMeetingDone to true and saves', async () => {
    mockGet.mockResolvedValue({ ...baseInspection });
    await persistOpeningMeetingDone('ins-1');
    expect(mockGet).toHaveBeenCalledWith('ins-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true })
    );
  });

  it('does nothing when inspection is not found', async () => {
    mockGet.mockResolvedValue(null);
    await persistOpeningMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('is idempotent (already true)', async () => {
    mockGet.mockResolvedValue({ ...baseInspection, openingMeetingDone: true });
    await persistOpeningMeetingDone('ins-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true })
    );
  });
});

describe('persistClosingMeetingDone', () => {
  it('sets closingMeetingDone to true and saves', async () => {
    mockGet.mockResolvedValue({ ...baseInspection });
    await persistClosingMeetingDone('ins-1');
    expect(mockGet).toHaveBeenCalledWith('ins-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true })
    );
  });

  it('does nothing when inspection is not found', async () => {
    mockGet.mockResolvedValue(null);
    await persistClosingMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('is idempotent (already true)', async () => {
    mockGet.mockResolvedValue({ ...baseInspection, closingMeetingDone: true });
    await persistClosingMeetingDone('ins-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true })
    );
  });
});
