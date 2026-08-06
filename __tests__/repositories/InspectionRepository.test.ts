/**
 * __tests__/repositories/InspectionRepository.test.ts
 * Contract tests for InspectionRepository — SQLite contract (rewritten).
 */
import InspectionRepository from '../../src/repositories/InspectionRepository';
import type { SavedInspection } from '../../src/types';

const SQLite = require('expo-sqlite');

jest.mock('../../src/repositories/AuditLogRepository', () => ({
  append: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  save: jest.fn().mockResolvedValue({ id: 'cap-mock' }),
  deleteByInspection: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/services/IntegrityService', () => ({
  computeHash: jest.fn().mockResolvedValue('mock-hash-abc123'),
}));

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test',
  inspectorId: 'u1',
  inspectorName: 'Inspector',
  facilityType: 'restaurant',
  status: 'draft',
  score: null,
  checklistAnswers: {},
  findings: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  SQLite.__resetAll();
  jest.clearAllMocks();
});

describe('InspectionRepository.getAll', () => {
  it('returns empty array when no inspections', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns all stored inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: 'i1', status: 'completed' }));
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

describe('InspectionRepository.getCompleted', () => {
  it('returns only completed inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', status: 'completed' }));
    await InspectionRepository.save(makeInspection({ id: '2', status: 'draft' }));
    const result = await InspectionRepository.getCompleted();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

describe('InspectionRepository.getDrafts', () => {
  it('returns draft and in-progress inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', status: 'completed' }));
    await InspectionRepository.save(makeInspection({ id: '2', status: 'draft' }));
    await InspectionRepository.save(makeInspection({ id: '3', status: 'in-progress' }));
    const result = await InspectionRepository.getDrafts();
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(expect.arrayContaining(['2', '3']));
  });
});

describe('InspectionRepository.getById', () => {
  it('returns null when not found', async () => {
    expect(await InspectionRepository.getById('missing')).toBeNull();
  });

  it('returns the matching inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'abc' }));
    const result = await InspectionRepository.getById('abc');
    expect(result?.id).toBe('abc');
  });
});

describe('InspectionRepository.save', () => {
  it('persists a new inspection', async () => {
    await InspectionRepository.save(makeInspection());
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });

  it('replaces an existing inspection with the same id', async () => {
    await InspectionRepository.save(makeInspection({ id: 'insp-1', facilityName: 'Old' }));
    await InspectionRepository.save(makeInspection({ id: 'insp-1', facilityName: 'New Name' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].facilityName).toBe('New Name');
  });
});

describe('InspectionRepository.delete', () => {
  it('removes the inspection with the given id', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.save(makeInspection({ id: '2' }));
    await InspectionRepository.delete('1');
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('is a no-op for an unknown id', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.delete('missing');
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

describe('InspectionRepository.deleteMany', () => {
  it('removes all inspections whose ids are in the set', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.save(makeInspection({ id: '2' }));
    await InspectionRepository.save(makeInspection({ id: '3' }));
    await InspectionRepository.deleteMany(['1', '3']);
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('handles empty ids array gracefully', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.deleteMany([]);
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});
