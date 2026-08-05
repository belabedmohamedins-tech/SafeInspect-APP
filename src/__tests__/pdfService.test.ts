// src/__tests__/pdfService.test.ts
import { SavedInspection, InspectionItem } from '../types';

const makeItem = (): InspectionItem => ({
  id: 'item-1',
  criteria: 'Test criterion',
  legalReference: '',
  axis: 'Hygiene',
  complianceStatus: 'not-evaluated',
  comment: '',
  severity: 'medium',
});

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  facilityAddress: '',
  date: new Date().toISOString(),
  inspectorName: '',
  items: [makeItem()],
  ...overrides,
} as SavedInspection);

const makeSettings = () => ({
  inspectorName: '',
  officeName: '',
  inspectionCause: '',
});

describe('pdfService fixtures', () => {
  it('makeInspection has facilityId', () => {
    const insp = makeInspection();
    expect(insp.facilityId).toBe('fac-1');
  });

  it('makeSettings has inspectionCause', () => {
    const s = makeSettings();
    expect(s.inspectionCause).toBeDefined();
  });

  it('settings with inspectorName', () => {
    const s = { ...makeSettings(), inspectorName: 'فاطمة بن علي' };
    expect(s.inspectorName).toBe('فاطمة بن علي');
  });

  it('empty inspector name', () => {
    const s = makeSettings();
    expect(s.inspectorName).toBe('');
  });
});
