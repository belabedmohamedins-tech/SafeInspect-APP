// __tests__/services/differentialView.test.ts
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    getAll: jest.fn(),
  },
}));

import {
  buildDifferentialView,
  buildDifferentialViewSync,
} from '../../src/services/differentialView';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';

const makeItem = (id: string, status: string): any => ({
  id,
  complianceStatus: status,
  criteria: `Criteria ${id}`,
});

const makeInspection = (overrides: any = {}): any => ({
  id: 'current',
  facilityId: 'f1',
  date: '2026-06-01',
  status: 'completed',
  items: [
    makeItem('item1', 'compliant'),
    makeItem('item2', 'non-compliant'),
    makeItem('item3', 'compliant'),
  ],
  ...overrides,
});

const makePrior = (overrides: any = {}): any => ({
  id: 'prior',
  facilityId: 'f1',
  date: '2026-05-01',
  status: 'completed',
  items: [
    makeItem('item1', 'non-compliant'),
    makeItem('item2', 'non-compliant'),
    makeItem('item3', 'compliant'),
  ],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  (InspectionRepository.getById as jest.Mock).mockResolvedValue(null);
  (InspectionRepository.getAll as jest.Mock).mockResolvedValue([]);
});

describe('buildDifferentialView', () => {
  it('returns not-in-prior for all items when no prior exists', async () => {
    const result = await buildDifferentialView(makeInspection());
    expect(result.priorInspection).toBeNull();
    expect(result.all.every(e => e.diffStatus === 'not-in-prior')).toBe(true);
  });

  it('uses priorInspectionId when set and completed', async () => {
    (InspectionRepository.getById as jest.Mock).mockResolvedValue(makePrior());
    const result = await buildDifferentialView(makeInspection({ priorInspectionId: 'prior' }));
    expect(result.priorInspection?.id).toBe('prior');
  });

  it('ignores priorInspectionId pointing to non-completed record', async () => {
    (InspectionRepository.getById as jest.Mock).mockResolvedValue(makePrior({ status: 'draft' }));
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([]);
    const result = await buildDifferentialView(makeInspection({ priorInspectionId: 'prior' }));
    expect(result.priorInspection).toBeNull();
  });

  it('falls back to most-recent completed same-facility inspection', async () => {
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([makePrior()]);
    const result = await buildDifferentialView(makeInspection());
    expect(result.priorInspection?.id).toBe('prior');
  });

  it('excludes self from candidates', async () => {
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([makeInspection()]);
    const result = await buildDifferentialView(makeInspection());
    expect(result.priorInspection).toBeNull();
  });

  it('ignores non-completed candidates', async () => {
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([makePrior({ status: 'draft' })]);
    const result = await buildDifferentialView(makeInspection());
    expect(result.priorInspection).toBeNull();
  });

  it('classifies resolved, still-failing, unchanged correctly', async () => {
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([makePrior()]);
    const result = await buildDifferentialView(makeInspection());
    const byId = Object.fromEntries(result.all.map(e => [e.item.id, e.diffStatus]));
    expect(byId['item1']).toBe('resolved');
    expect(byId['item2']).toBe('still-failing');
    expect(byId['item3']).toBe('unchanged');
  });

  it('classifies new-violation', async () => {
    const prior = makePrior({
      items: [makeItem('item1', 'compliant'), makeItem('item2', 'compliant'), makeItem('item3', 'compliant')],
    });
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([prior]);
    const current = makeInspection({
      items: [makeItem('item1', 'non-compliant'), makeItem('item2', 'non-compliant'), makeItem('item3', 'compliant')],
    });
    const result = await buildDifferentialView(current);
    expect(result.newViolations).toHaveLength(2);
    expect(result.hasUnresolvedPriorViolations).toBe(false);
  });

  it('hasUnresolvedPriorViolations is true when stillFailing > 0', async () => {
    (InspectionRepository.getAll as jest.Mock).mockResolvedValue([makePrior()]);
    const result = await buildDifferentialView(makeInspection());
    expect(result.hasUnresolvedPriorViolations).toBe(true);
  });
});

describe('buildDifferentialViewSync', () => {
  it('returns not-in-prior for all when prior is null', () => {
    const result = buildDifferentialViewSync(makeInspection(), null);
    expect(result.all.every(e => e.diffStatus === 'not-in-prior')).toBe(true);
    expect(result.priorInspection).toBeNull();
  });

  it('classifies resolved and still-failing', () => {
    const result = buildDifferentialViewSync(makeInspection(), makePrior());
    const byId = Object.fromEntries(result.all.map(e => [e.item.id, e.diffStatus]));
    expect(byId['item1']).toBe('resolved');
    expect(byId['item2']).toBe('still-failing');
    expect(result.hasUnresolvedPriorViolations).toBe(true);
  });

  it('item not in prior gets not-in-prior', () => {
    const current = makeInspection({
      items: [makeItem('item1', 'compliant'), makeItem('item99', 'non-compliant')],
    });
    const result = buildDifferentialViewSync(current, makePrior());
    const item99 = result.all.find(e => e.item.id === 'item99')!;
    expect(item99.diffStatus).toBe('not-in-prior');
  });

  it('counts resolved/stillFailing/newViolations correctly', () => {
    const prior = makePrior({
      items: [makeItem('item1', 'non-compliant'), makeItem('item2', 'non-compliant'), makeItem('item3', 'non-compliant')],
    });
    const current = makeInspection({
      items: [makeItem('item1', 'compliant'), makeItem('item2', 'non-compliant'), makeItem('item3', 'compliant')],
    });
    const result = buildDifferentialViewSync(current, prior);
    expect(result.resolved).toHaveLength(2);
    expect(result.stillFailing).toHaveLength(1);
    expect(result.newViolations).toHaveLength(0);
  });

  it('classifies new-violation in sync version', () => {
    const prior = makePrior({
      items: [makeItem('item1', 'compliant'), makeItem('item2', 'compliant'), makeItem('item3', 'compliant')],
    });
    const current = makeInspection({
      items: [makeItem('item1', 'non-compliant'), makeItem('item2', 'compliant'), makeItem('item3', 'compliant')],
    });
    const result = buildDifferentialViewSync(current, prior);
    expect(result.newViolations).toHaveLength(1);
    expect(result.newViolations[0].item.id).toBe('item1');
  });
});
