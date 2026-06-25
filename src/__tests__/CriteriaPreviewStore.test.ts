/**
 * Unit tests for src/stores/CriteriaPreviewStore.ts
 */
import { CriteriaPreviewStore } from '../stores/CriteriaPreviewStore';
import { InspectionItem } from '../types';

const makeItem = (id: string): InspectionItem => ({
  id,
  criteria:         `معيار ${id}`,
  legalReference:   '',
  axis:             'محور',
  complianceStatus: 'not-evaluated',
  comment:          '',
});

beforeEach(() => CriteriaPreviewStore.clear());

describe('CriteriaPreviewStore', () => {
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
