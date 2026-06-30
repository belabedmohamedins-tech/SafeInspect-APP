// src/__tests__/meetingGateService.test.ts
//
// Uses jest.spyOn() on the real InspectionRepository so that
// meetingGateService.ts is fully executed and instrumented.

import {
  persistOpeningMeetingDone,
  persistClosingMeetingDone,
} from '../services/meetingGateService';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection } from '../types';

const base: SavedInspection = {
  id:                  'insp-1',
  facilityId:          'fac-1',
  facilityName:        'Test',
  facilityAddress:     '',
  date:                '2024-01-01',
  status:              'draft',
  openingMeetingDone:  false,
  closingMeetingDone:  false,
  items:               [],
} as unknown as SavedInspection;

let spyGetById: jest.SpyInstance;
let spySave:    jest.SpyInstance;

beforeEach(() => {
  spyGetById = jest
    .spyOn(InspectionRepository, 'getById')
    .mockResolvedValue({ ...base });
  spySave = jest
    .spyOn(InspectionRepository, 'save')
    .mockResolvedValue({} as any);
});

afterEach(() => jest.restoreAllMocks());

describe('persistOpeningMeetingDone', () => {
  it('does nothing when inspection is not found', async () => {
    spyGetById.mockResolvedValue(null);
    await persistOpeningMeetingDone('missing-id');
    expect(spySave).not.toHaveBeenCalled();
  });

  it('saves with openingMeetingDone = true', async () => {
    await persistOpeningMeetingDone('insp-1');
    expect(spySave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true }),
    );
  });

  it('preserves all other fields on save', async () => {
    spyGetById.mockResolvedValue({ ...base, facilityName: 'Preserved' });
    await persistOpeningMeetingDone('insp-1');
    expect(spySave.mock.calls[0][0].facilityName).toBe('Preserved');
    expect(spySave.mock.calls[0][0].id).toBe('insp-1');
  });

  it('is idempotent when flag is already true', async () => {
    spyGetById.mockResolvedValue({ ...base, openingMeetingDone: true });
    await persistOpeningMeetingDone('insp-1');
    expect(spySave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true }),
    );
  });
});

describe('persistClosingMeetingDone', () => {
  it('does nothing when inspection is not found', async () => {
    spyGetById.mockResolvedValue(null);
    await persistClosingMeetingDone('missing-id');
    expect(spySave).not.toHaveBeenCalled();
  });

  it('saves with closingMeetingDone = true', async () => {
    await persistClosingMeetingDone('insp-1');
    expect(spySave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true }),
    );
  });

  it('preserves all other fields on save', async () => {
    spyGetById.mockResolvedValue({ ...base, facilityId: 'fac-99' });
    await persistClosingMeetingDone('insp-1');
    expect(spySave.mock.calls[0][0].facilityId).toBe('fac-99');
  });

  it('is idempotent when flag is already true', async () => {
    spyGetById.mockResolvedValue({ ...base, closingMeetingDone: true });
    await persistClosingMeetingDone('insp-1');
    expect(spySave).toHaveBeenCalledWith(
      expect.objectContaining({ closingMeetingDone: true }),
    );
  });
});
