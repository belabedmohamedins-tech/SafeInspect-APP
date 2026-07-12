// __tests__/services/meetingGateService.test.ts
const mockGetById = jest.fn();
const mockSave    = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: (...a: any[]) => mockGetById(...a),
    save:    (...a: any[]) => mockSave(...a),
  },
}));

import { persistOpeningMeetingDone, persistClosingMeetingDone } from '../../src/services/meetingGateService';

const baseInspection = { id: 'i1', facilityName: 'FAC', openingMeetingDone: false, closingMeetingDone: false };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetById.mockResolvedValue({ ...baseInspection });
});

describe('persistOpeningMeetingDone', () => {
  it('saves inspection with openingMeetingDone=true', async () => {
    await persistOpeningMeetingDone('i1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ openingMeetingDone: true }));
  });

  it('is a no-op when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('NOPE');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('is idempotent when already true', async () => {
    mockGetById.mockResolvedValue({ ...baseInspection, openingMeetingDone: true });
    await persistOpeningMeetingDone('i1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ openingMeetingDone: true }));
  });
});

describe('persistClosingMeetingDone', () => {
  it('saves inspection with closingMeetingDone=true', async () => {
    await persistClosingMeetingDone('i1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ closingMeetingDone: true }));
  });

  it('is a no-op when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('NOPE');
    expect(mockSave).not.toHaveBeenCalled();
  });
});
