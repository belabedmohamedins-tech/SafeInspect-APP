// src/__tests__/CriteriaPreviewStore.test.ts
import { CriteriaPreviewStore } from '../stores/CriteriaPreviewStore';
import { InspectionItem, SavedInspection } from '../types';

const makeItem = (id: string): InspectionItem => ({
  id,
  criteria:         `معيار ${id}`,
  legalReference:   '',
  axis:             'محور',
  complianceStatus: 'not-evaluated',
  comment:          '',
});

function makeInspection(id: string, items: InspectionItem[] = []): SavedInspection {
  return {
    id,
    facilityId:        'fac-1',
    facilityName:      'Test Facility',
    facilityAddress:   '1 Test St',
    date:              new Date().toISOString(),
    inspectorName:     'Inspector A',
    officeName:        'HQ',
    status:            'completed',
    items,
    inspectionCause:   '',
    referenceDocument: '',
    committeeMembers:  [],
  } as SavedInspection;
}

beforeEach(() => CriteriaPreviewStore.clear());

describe('CriteriaPreviewStore — legacy set/get', () => {
  it('get() returns an empty array on initialisation', () => {
    expect(CriteriaPreviewStore.get()).toEqual([]);
  });

  it('set() stores items and get() retrieves them', () => {
    const items = [makeItem('a'), makeItem('b')];
    CriteriaPreviewStore.set(items);
    expect(CriteriaPreviewStore.get()).toEqual(items);
  });

  it('set() replaces any previously stored items', () => {
    CriteriaPreviewStore.set([makeItem('a')]);
    CriteriaPreviewStore.set([makeItem('b'), makeItem('c')]);
    expect(CriteriaPreviewStore.get()).toHaveLength(2);
    expect(CriteriaPreviewStore.get()[0].id).toBe('b');
  });

  it('clear() empties the store', () => {
    CriteriaPreviewStore.set([makeItem('a')]);
    CriteriaPreviewStore.clear();
    expect(CriteriaPreviewStore.get()).toEqual([]);
  });

  it('get() after clear() returns []', () => {
    CriteriaPreviewStore.set([makeItem('x')]);
    CriteriaPreviewStore.clear();
    expect(CriteriaPreviewStore.get()).toHaveLength(0);
  });

  it('set → clear → set cycle works correctly', () => {
    CriteriaPreviewStore.set([makeItem('1')]);
    CriteriaPreviewStore.clear();
    const newItems = [makeItem('2'), makeItem('3')];
    CriteriaPreviewStore.set(newItems);
    expect(CriteriaPreviewStore.get()).toEqual(newItems);
  });
});

describe('CriteriaPreviewStore — setInspection/getInspection', () => {
  it('getInspection() returns null before anything is set', () => {
    expect(CriteriaPreviewStore.getInspection()).toBeNull();
  });

  it('setInspection() stores the full inspection and getInspection() retrieves it', () => {
    const ins = makeInspection('ins-1', [makeItem('a'), makeItem('b')]);
    CriteriaPreviewStore.setInspection(ins);
    expect(CriteriaPreviewStore.getInspection()).toStrictEqual(ins);
  });

  it('setInspection() keeps the legacy items field in sync', () => {
    const items = [makeItem('x'), makeItem('y')];
    const ins = makeInspection('ins-2', items);
    CriteriaPreviewStore.setInspection(ins);
    expect(CriteriaPreviewStore.get()).toEqual(items);
  });

  it('clear() also wipes the inspection', () => {
    CriteriaPreviewStore.setInspection(makeInspection('ins-3', [makeItem('z')]));
    CriteriaPreviewStore.clear();
    expect(CriteriaPreviewStore.getInspection()).toBeNull();
    expect(CriteriaPreviewStore.get()).toEqual([]);
  });

  it('setInspection() replaces a previously stored inspection', () => {
    CriteriaPreviewStore.setInspection(makeInspection('ins-A', [makeItem('1')]));
    const ins2 = makeInspection('ins-B', [makeItem('2'), makeItem('3')]);
    CriteriaPreviewStore.setInspection(ins2);
    expect(CriteriaPreviewStore.getInspection()?.id).toBe('ins-B');
    expect(CriteriaPreviewStore.get()).toHaveLength(2);
  });
});
