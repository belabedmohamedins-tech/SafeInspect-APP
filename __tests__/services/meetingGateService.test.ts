// __tests__/services/meetingGateService.test.ts
// Use factory mock to avoid expo winter runtime explosion via InspectionRepository
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    save: jest.fn(),
  },
}));

import { persistOpeningMeetingDone, persistClosingMeetingDone } from '../../src/services/meetingGateService';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';

const mockGetById = InspectionRepository.getById as jest.Mock;
const mockSave = InspectionRepository.save as jest.Mock;

const base = { id: 'i1', facilityId: 'f1', openingMeetingDone: false, closingMeetingDone: false };

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('persistOpeningMeetingDone', () => {
  it('sets openingMeetingDone=true and saves', async () => {
    mockGetById.mockResolvedValue({ ...base });
    await persistOpeningMeetingDone('i1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ openingMeetingDone: true }));
  });

  it('no-op when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe('persistClosingMeetingDone', () => {
  it('sets closingMeetingDone=true and saves', async () => {
    mockGetById.mockResolvedValue({ ...base });
    await persistClosingMeetingDone('i1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ closingMeetingDone: true }));
  });

  it('no-op when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });
});
