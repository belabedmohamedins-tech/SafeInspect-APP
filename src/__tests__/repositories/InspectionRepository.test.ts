// src/__tests__/repositories/InspectionRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper. Do NOT add an inline jest.mock() factory
// for it here. Use AsyncStorage.__resetStore() in beforeEach.

jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: {
    computeHash:      jest.fn(() => 'mock-hash-abc123'),
    verifyInspection: jest.fn(() => true),
  },
}));

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: {
    append: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    createFromInspection: jest.fn(() => Promise.resolve()),
  },
}));

// Lazy imports inside save() are handled via jest.mock below
jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: {
    enqueue: jest.fn(() => Promise.resolve()),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionRepository } from '../../repositories/InspectionRepository';
import { StorageKeys }           from '../../repositories/keys';
import { SavedInspection }       from '../../types';
import { AuditLogRepository }    from '../../repositories/AuditLogRepository';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id:              'insp-1',
    facilityId:      'fac-1',
    facilityName:    'Test Facility',
    facilityAddress: '123 Test St',
    date:            '2025-01-15T09:00:00.000Z',
    inspectorName:   'Inspector A',
    officeName:      'HQ',
    status:          'completed',
    items:           [],
    inspectionCause:   '',
    referenceDocument: '',
    committeeMembers:  [],
    signature:         '',
    ...overrides,
  } as SavedInspection;
}

// ─── loadAll parse-error branch ───────────────────────────────────────────────

describe('InspectionRepository — corrupt storage', () => {
  it('getAll returns [] when stored JSON is corrupt', async () => {
    await AsyncStorage.setItem(StorageKeys.INSPECTIONS, 'CORRUPT{{{');
    const result = await InspectionRepository.getAll();
    expect(result).toEqual([]);
  });
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.getAll', () => {
  it('returns [] when storage is empty', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns all stored inspections', async () => {
    const insp = makeInspection();
    await AsyncStorage.setItem(StorageKeys.INSPECTIONS, JSON.stringify([insp]));
    const result = await InspectionRepository.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('insp-1');
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('InspectionRepository.getById', () => {
  it('returns the matching inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'x1', status: 'in-progress' }));
    const result = await InspectionRepository.getById('x1');
    expect(result?.id).toBe('x1');
  });

  it('returns null when id is not found', async () => {
    const result = await InspectionRepository.getById('ghost');
    expect(result).toBeNull();
  });
});

// ─── getCompleted ─────────────────────────────────────────────────────────────

describe('InspectionRepository.getCompleted', () => {
  it('returns only completed inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', status: 'completed' }));
    await InspectionRepository.save(makeInspection({ id: '2', status: 'in-progress' }));
    const result = await InspectionRepository.getCompleted();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

// ─── getDrafts ────────────────────────────────────────────────────────────────

describe('InspectionRepository.getDrafts', () => {
  it('returns in-progress inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', status: 'completed' }));
    await InspectionRepository.save(makeInspection({ id: '2', status: 'in-progress' }));
    const result = await InspectionRepository.getDrafts();
    expect(result.map(i => i.id)).toContain('2');
    expect(result.map(i => i.id)).not.toContain('1');
  });

  it('returns inspections with status "draft"', async () => {
    // exercises the `|| i.status === 'draft'` branch (lines 41-42)
    await AsyncStorage.setItem(
      StorageKeys.INSPECTIONS,
      JSON.stringify([makeInspection({ id: 'd1', status: 'draft' as any })])
    );
    const result = await InspectionRepository.getDrafts();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('d1');
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('InspectionRepository.save', () => {
  it('persists a new inspection', async () => {
    await InspectionRepository.save(makeInspection());
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('insp-1');
  });

  it('replaces an existing inspection with the same id', async () => {
    await InspectionRepository.save(makeInspection({ facilityName: 'Old Name' }));
    await InspectionRepository.save(makeInspection({ facilityName: 'New Name' }));
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].facilityName).toBe('New Name');
  });

  it('triggers AuditLog + CAP on first completion', async () => {
    await InspectionRepository.save(makeInspection({ id: 'new-c', status: 'completed' }));
    expect(
      (AuditLogRepository.append as jest.Mock).mock.calls.some(
        (c: any[]) => c[0]?.action === 'INSPECTION_SAVED'
      )
    ).toBe(true);
    expect(CorrectiveActionRepository.createFromInspection).toHaveBeenCalled();
  });

  it('calls followUpService and ApprovalRepository on first completion (lazy import paths)', async () => {
    // exercises lines 79 and 85
    await InspectionRepository.save(makeInspection({ id: 'lazy-1', status: 'completed' }));
    const { createFollowUpIfNeeded } = require('../../services/followUpService');
    const { ApprovalRepository }     = require('../../repositories/ApprovalRepository');
    expect(createFollowUpIfNeeded).toHaveBeenCalled();
    expect(ApprovalRepository.enqueue).toHaveBeenCalled();
  });

  it('does NOT trigger side-effects when saving an in-progress inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'draft-x', status: 'in-progress' }));
    expect(AuditLogRepository.append).not.toHaveBeenCalled();
    expect(CorrectiveActionRepository.createFromInspection).not.toHaveBeenCalled();
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.delete', () => {
  it('removes the inspection by id', async () => {
    await InspectionRepository.save(makeInspection());
    jest.clearAllMocks();
    await InspectionRepository.delete('insp-1');
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS)) ?? '[]');
    expect(stored).toHaveLength(0);
  });

  it('is a no-op when id does not exist', async () => {
    await InspectionRepository.delete('nonexistent');
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS)) ?? '[]');
    expect(stored).toHaveLength(0);
  });
});

// ─── deleteMany ───────────────────────────────────────────────────────────────

describe('InspectionRepository.deleteMany', () => {
  it('removes all inspections whose ids are in the list', async () => {
    await InspectionRepository.save(makeInspection({ id: 'a1', status: 'in-progress' }));
    await InspectionRepository.save(makeInspection({ id: 'a2', status: 'in-progress' }));
    await InspectionRepository.save(makeInspection({ id: 'a3', status: 'in-progress' }));
    await InspectionRepository.deleteMany(['a1', 'a3']);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('a2');
  });

  it('appends a INSPECTION_BULK_DELETED audit entry', async () => {
    jest.clearAllMocks();
    await InspectionRepository.deleteMany(['x1', 'x2']);
    expect(
      (AuditLogRepository.append as jest.Mock).mock.calls.some(
        (c: any[]) => c[0]?.action === 'INSPECTION_BULK_DELETED'
      )
    ).toBe(true);
  });

  it('is a no-op when the id list is empty', async () => {
    await InspectionRepository.save(makeInspection({ id: 'keep-1', status: 'in-progress' }));
    await InspectionRepository.deleteMany([]);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
  });
});
