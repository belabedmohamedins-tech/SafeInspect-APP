// __tests__/stores/CriteriaPreviewStore.test.ts
import { CriteriaPreviewStore } from '../../src/stores/CriteriaPreviewStore';
import { InspectionItem, SavedInspection } from '../../src/types';

const item1 = { id: 'i1' } as InspectionItem;
const item2 = { id: 'i2' } as InspectionItem;
const mockInspection: SavedInspection = { id: 'ins1', items: [item1, item2] } as any;

beforeEach(() => {
  CriteriaPreviewStore.clear();
});

describe('CriteriaPreviewStore', () => {
  it('get() returns empty array by default', () => {
    expect(CriteriaPreviewStore.get()).toEqual([]);
  });

  it('getInspection() returns null by default', () => {
    expect(CriteriaPreviewStore.getInspection()).toBeNull();
  });

  it('set() stores items and get() returns them', () => {
    CriteriaPreviewStore.set([item1]);
    expect(CriteriaPreviewStore.get()).toEqual([item1]);
  });

  it('setInspection() stores inspection and getInspection() returns it', () => {
    CriteriaPreviewStore.setInspection(mockInspection);
    expect(CriteriaPreviewStore.getInspection()).toBe(mockInspection);
  });

  it('setInspection() also syncs legacy get() field', () => {
    CriteriaPreviewStore.setInspection(mockInspection);
    expect(CriteriaPreviewStore.get()).toEqual([item1, item2]);
  });

  it('clear() resets both items and inspection', () => {
    CriteriaPreviewStore.setInspection(mockInspection);
    CriteriaPreviewStore.clear();
    expect(CriteriaPreviewStore.get()).toEqual([]);
    expect(CriteriaPreviewStore.getInspection()).toBeNull();
  });

  it('set() overwrites previous items', () => {
    CriteriaPreviewStore.set([item1]);
    CriteriaPreviewStore.set([item2]);
    expect(CriteriaPreviewStore.get()).toEqual([item2]);
  });
});
