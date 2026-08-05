// src/__tests__/CapReportService.test.ts
import { CorrectiveAction, Severity } from '../types';

const makeAction = (overrides: Partial<CorrectiveAction> = {}): CorrectiveAction => ({
  id: 'cap-1',
  inspectionId: 'insp-1',
  inspectionItemId: 'item-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  criteria: 'Test criteria',
  severity: 'medium' as Severity,
  deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
  assignedTo: '',
  status: 'open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('CapReportService fixtures', () => {
  it('makeAction produces valid CorrectiveAction', () => {
    const action = makeAction();
    expect(action.criteria).toBe('Test criteria');
    expect(action.inspectionItemId).toBe('item-1');
  });
});
