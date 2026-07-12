// __tests__/services/meetingGateService.test.ts
import {
  persistOpeningMeetingDone,
  persistClosingMeetingDone,
} from '../../src/services/meetingGateService';
import { SavedInspection } from '../../src/types';

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    save: jest.fn(),
  },
}));

import { InspectionRepository } from '../../src/repositories/InspectionRepository';
const mockGetById = InspectionRepository.getById as jest.Mock;
const mockSave    = InspectionRepository.save    as jest.Mock;

const baseInspection: SavedInspection = {
  id: 'insp-1',
  facilityId: 'fac-1',
  openingMeetingDone: false,
  closingMeetingDone: false,
} as unknown as SavedInspection;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetById.mockResolvedValue({ ...baseInspection });
  mockSave.mockResolvedValue(undefined);
});

// ── persistOpeningMeetingDone ───────────────────────────────────────────────────
describe('persistOpeningMeetingDone', () => {
  it('calls getById with the correct inspectionId', async () => {
    await persistOpeningMeetingDone('insp-1');
    expect(mockGetById).toHaveBeenCalledWith('insp-1');
  });

  it('saves inspection with openingMeetingDone=true', async () => {
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true })
    );
  });

  it('does not mutate closingMeetingDone', async () => {
    await persistOpeningMeetingDone('insp-1');
    const saved = mockSave.mock.calls[0][0];
    expect(saved.closingMeetingDone).toBe(false);
  });

  it('does nothing (no save) when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('nonexistent');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('idempotent — calling twice saves twice with openingMeetingDone=true', async () => {
    await persistOpeningMeetingDone('insp-1');
    await persistOpeningMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSave.mock.calls[1][0].openingMeetingDone).toBe(true);
  });
});

// ── persistClosingMeetingDone ───────────────────────────────────────────────────
describe('persistClosingMeetingDone', () => {
  it('calls getById with the correct inspectionId', async () => {
    await persistClosingMeetingDone('insp-1');
    expect(mockGetById).toHaveBeenCalledWith('insp-1');
  });

  it('saves inspection with closingMeetingDone=true', async () => {
    await persistClosingMeetingDone('insp-1');
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true })
    );
  });

  it('does not mutate openingMeetingDone', async () => {
    await persistClosingMeetingDone('insp-1');
    const saved = mockSave.mock.calls[0][0];
    expect(saved.openingMeetingDone).toBe(false);
  });

  it('does nothing (no save) when inspection not found', async () => {
    mockGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('nonexistent');
    expect(mockSave).not.toHaveBeenCalled();
  });
});
