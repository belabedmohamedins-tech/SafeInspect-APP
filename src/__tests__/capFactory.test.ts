// src/__tests__/capFactory.test.ts
import { makeCapFromItem } from '../services/capFactory';
import { InspectionItem, Severity } from '../types';

const SEVERITIES: Severity[] = ['low', 'medium', 'high'];

const makeItem = (id: string, status: string, severity: Severity): InspectionItem => ({
  id,
  criteria: 'Test criterion',
  legalReference: '',
  axis: 'Hygiene',
  complianceStatus: status as InspectionItem['complianceStatus'],
  comment: '',
  severity,
});

const makeInspection = (items: InspectionItem[]) => ({
  id: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  facilityAddress: '',
  date: new Date().toISOString(),
  inspectorName: 'Test Inspector',
  items,
});

describe('makeCapFromItem', () => {
  SEVERITIES.forEach(severity => {
    it(`creates a CAP for severity=${severity}`, () => {
      const item = makeItem('1', 'non-compliant', severity);
      const insp = makeInspection([item]);
      const cap = makeCapFromItem(item, insp as any, new Date().toISOString());
      expect(cap).toBeDefined();
    });
  });
});
