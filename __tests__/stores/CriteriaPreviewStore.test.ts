// __tests__/stores/CriteriaPreviewStore.test.ts
import { CriteriaPreviewStore } from '../../src/stores/CriteriaPreviewStore';
import { InspectionItem, SavedInspection } from '../../src/types';

function item(id: string): InspectionItem {
  return { id, complianceStatus: 'compliant' } as InspectionItem;
}

function insp(id: string, items: InspectionItem[] = []): SavedInspection {
  return { id, items, facilityId: 'f1', status: 'completed', date: '', title: '' } as SavedInspection;
}

beforeEach(() => CriteriaPreviewStore.clear());

describe('CriteriaPreviewStore', () => {
  it('set/get items (legacy)', () => {
    const items = [item('i1'), item('i2')];
    CriteriaPreviewStore.set(items);
    expect(CriteriaPreviewStore.get()).toEqual(items);
  });

  it('get returns empty array after clear', () => {
    CriteriaPreviewStore.set([item('i1')]);
    CriteriaPreviewStore.clear();
    expect(CriteriaPreviewStore.get()).toEqual([]);
  });

  it('setInspection stores inspection and syncs items', () => {
    const i = insp('ins1', [item('i1')]);
    CriteriaPreviewStore.setInspection(i);
    expect(CriteriaPreviewStore.getInspection()?.id).toBe('ins1');
    expect(CriteriaPreviewStore.get()).toEqual([item('i1')]);
  });

  it('getInspection returns null before set', () => {
    expect(CriteriaPreviewStore.getInspection()).toBeNull();
  });

  it('clear resets both fields', () => {
    CriteriaPreviewStore.setInspection(insp('ins1', [item('i1')]));
    CriteriaPreviewStore.clear();
    expect(CriteriaPreviewStore.get()).toEqual([]);
    expect(CriteriaPreviewStore.getInspection()).toBeNull();
  });
});
