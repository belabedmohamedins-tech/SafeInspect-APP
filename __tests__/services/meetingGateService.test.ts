// __tests__/services/meetingGateService.test.ts
const mockGetById = jest.fn();
const mockSave    = jest.fn();

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: (...a: any[]) => mockGetById(...a),
    save:    (...a: any[]) => mockSave(...a),
  },
}));

import {
  persistOpeningMeetingDone,
  persistClosingMeetingDone,
} from '../../src/services/meetingGateService';

const BASE = { id: 'insp-1', facilityId: 'f1', openingMeetingDone: false, closingMeetingDone: false };

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

describe('persistOpeningMeetingDone', () => {
  it('sets openingMeetingDone=true and saves', async () => {
    mockGetById.mockResolvedValue({ ...BASE });
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ openingMeetingDone: true }));
  });

  it('does nothing when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('is idempotent — calling twice still saves once per call', async () => {
    mockGetById.mockResolvedValue({ ...BASE });
    await persistOpeningMeetingDone('insp-1');
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledTimes(2);
  });
});

describe('persistClosingMeetingDone', () => {
  it('sets closingMeetingDone=true and saves', async () => {
    mockGetById.mockResolvedValue({ ...BASE });
    await persistClosingMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ closingMeetingDone: true }));
  });

  it('does nothing when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('missing');
    expect(mockSave).not.toHaveBeenCalled();
  });
});
