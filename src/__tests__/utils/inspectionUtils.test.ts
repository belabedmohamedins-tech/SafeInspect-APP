// src/__tests__/utils/inspectionUtils.test.ts
import { InspectionItem, ComplianceStatus, Severity } from '../../types';

type MakeItemOptions = Partial<InspectionItem> & { complianceStatus?: ComplianceStatus };

const makeItem = (overrides: MakeItemOptions = {}): InspectionItem => ({
  id:               overrides.id              ?? 'item-1',
  criteria:         overrides.criteria        ?? 'Test criterion',
  legalReference:   overrides.legalReference  ?? '',
  axis:             overrides.axis            ?? 'Hygiene',
  complianceStatus: overrides.complianceStatus ?? 'not-evaluated',
  comment:          overrides.comment         ?? '',
  severity:         overrides.severity        ?? ('medium' as Severity),
});

describe('inspectionUtils fixtures', () => {
  it('makeItem produces valid InspectionItem', () => {
    const item = makeItem();
    expect(item.id).toBe('item-1');
    expect(item.criteria).toBe('Test criterion');
    expect(item.severity).toBe('medium');
  });

  it('makeItem with overrides', () => {
    const item = makeItem({ id: 'item-2', complianceStatus: 'non-compliant', severity: 'high' });
    expect(item.id).toBe('item-2');
    expect(item.complianceStatus).toBe('non-compliant');
    expect(item.severity).toBe('high');
  });

  it('makeItem with compliant status', () => {
    const item = makeItem({ complianceStatus: 'compliant' });
    expect(item.complianceStatus).toBe('compliant');
  });

  it('makeItem with na status', () => {
    const item = makeItem({ complianceStatus: 'na' });
    expect(item.complianceStatus).toBe('na');
  });

  it('makeItem with observation-only status', () => {
    const item = makeItem({ complianceStatus: 'observation-only' });
    expect(item.complianceStatus).toBe('observation-only');
  });

  it('makeItem with unable-to-verify status', () => {
    const item = makeItem({ complianceStatus: 'unable-to-verify' });
    expect(item.complianceStatus).toBe('unable-to-verify');
  });
});
