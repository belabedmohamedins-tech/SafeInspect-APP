/**
 * __tests__/repositories/InspectionRepository.test.ts
 * Z6-TSC: inspectorId does not exist on SavedInspection; use inspectorName.
 * W52: added guard tests — delete/deleteMany/clear reject approved inspections.
 */
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import type { SavedInspection } from '../../src/types';

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-default',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: '1 Rue Test',
    date: '2026-08-01',
    inspectorName: 'Inspector A',
    items: [],
    status: 'completed',
    ...overrides,
  };
}

beforeEach(async () => {
  // Clear only non-approved rows so approved-guard tests can seed their own state.
  // For most tests the table is empty going in; approved-guard tests clean up after.
  try { await InspectionRepository.clear(); } catch { /* may throw if approved row exists */ }
});

describe('InspectionRepository', () => {
  it('saves and retrieves all inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.save(makeInspection({ id: '2' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(2);
  });

  it('retrieves by id', async () => {
    await InspectionRepository.save(makeInspection({ id: 'abc' }));
    const found = await InspectionRepository.getById('abc');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('abc');
  });

  it('deletes an inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'del-1' }));
    await InspectionRepository.delete('del-1');
    const all = await InspectionRepository.getAll();
    expect(all.every(i => i.id !== 'del-1')).toBe(true);
  });

  it('filters by facilityId', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', facilityId: 'A' }));
    await InspectionRepository.save(makeInspection({ id: '2', facilityId: 'B' }));
    const result = await InspectionRepository.getByFacility('A');
    expect(result.every(i => i.facilityId === 'A')).toBe(true);
  });

  it('clear empties all inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.clear();
    expect(await InspectionRepository.getAll()).toHaveLength(0);
  });

  // ── W52: INSPECTION_LOCKED guard ────────────────────────────────────────────

  it('W52: delete() throws INSPECTION_LOCKED for approved inspection', async () => {
    const id = 'w52-del-approved';
    await InspectionRepository.save(
      makeInspection({ id, approvalStatus: 'approved' }),
    );
    await expect(InspectionRepository.delete(id)).rejects.toThrow('INSPECTION_LOCKED');
    // cleanup
    const db = (InspectionRepository as any)._db ||
      (await import('../../src/db/schema').then(m => m.getDb()));
    if (db && typeof db.runAsync === 'function') {
      await db.runAsync('DELETE FROM inspections WHERE id = ?', [id]);
    }
  });

  it('W52: delete() succeeds for non-approved inspection', async () => {
    const id = 'w52-del-draft';
    await InspectionRepository.save(makeInspection({ id, approvalStatus: 'pending' }));
    await expect(InspectionRepository.delete(id)).resolves.not.toThrow();
    expect(await InspectionRepository.getById(id)).toBeNull();
  });

  it('W52: deleteMany() throws INSPECTION_LOCKED if any inspection is approved', async () => {
    await InspectionRepository.save(makeInspection({ id: 'w52-dm-ok', approvalStatus: 'pending' }));
    await InspectionRepository.save(makeInspection({ id: 'w52-dm-locked', approvalStatus: 'approved' }));
    await expect(
      InspectionRepository.deleteMany(['w52-dm-ok', 'w52-dm-locked']),
    ).rejects.toThrow('INSPECTION_LOCKED');
    // Both rows must still exist (atomic: nothing deleted)
    expect(await InspectionRepository.getById('w52-dm-ok')).not.toBeNull();
    // cleanup approved row
    const { getDb } = await import('../../src/db/schema');
    const db = await getDb();
    await db.runAsync('DELETE FROM inspections WHERE id IN (?, ?)', ['w52-dm-ok', 'w52-dm-locked']);
  });

  it('W52: deleteMany() succeeds when no inspection is approved', async () => {
    await InspectionRepository.save(makeInspection({ id: 'w52-dm-a', approvalStatus: 'pending' }));
    await InspectionRepository.save(makeInspection({ id: 'w52-dm-b', approvalStatus: 'pending' }));
    await expect(
      InspectionRepository.deleteMany(['w52-dm-a', 'w52-dm-b']),
    ).resolves.not.toThrow();
    expect(await InspectionRepository.getById('w52-dm-a')).toBeNull();
    expect(await InspectionRepository.getById('w52-dm-b')).toBeNull();
  });

  it('W52: clear() throws INSPECTION_LOCKED when an approved inspection exists', async () => {
    const id = 'w52-clear-approved';
    await InspectionRepository.save(makeInspection({ id, approvalStatus: 'approved' }));
    await expect(InspectionRepository.clear()).rejects.toThrow('INSPECTION_LOCKED');
    expect(await InspectionRepository.getAll()).not.toHaveLength(0);
    // cleanup
    const { getDb } = await import('../../src/db/schema');
    const db = await getDb();
    await db.runAsync('DELETE FROM inspections WHERE id = ?', [id]);
  });

  it('W52: clear() succeeds when no approved inspection exists', async () => {
    await InspectionRepository.save(makeInspection({ id: 'w52-clear-ok', approvalStatus: 'pending' }));
    await expect(InspectionRepository.clear()).resolves.not.toThrow();
    expect(await InspectionRepository.getAll()).toHaveLength(0);
  });
});
