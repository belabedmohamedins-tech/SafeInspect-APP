// src/__tests__/repositories/CorrectiveActionRepository.extended.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../types';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

const tomorrow = (): string => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); };
const yesterday = (): string => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };
const inDays = (n: number): string => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

const base = (o: Partial<CorrectiveAction> = {}): Omit<CorrectiveAction,'id'|'createdAt'|'updatedAt'> => ({
  inspectionId:'ins-1', inspectionItemId:'item-1', facilityId:'fac-1', facilityName:'F',
  title:'Fix', description:'d', status:'open', severity:'medium', deadline:tomorrow(), assignedTo:'', ...o,
});

async function seedRaw(items: CorrectiveAction[]): Promise<void> {
  await AsyncStorage.setItem('CORRECTIVE_ACTIONS', JSON.stringify(items));
}
function makeRaw(o: Partial<CorrectiveAction> = {}): CorrectiveAction {
  const now = new Date().toISOString();
  return { id:`cap-${Math.random().toString(36).slice(2,7)}`, inspectionId:'ins-1', inspectionItemId:'item-1',
    facilityId:'fac-1', facilityName:'F', title:'Fix', description:'d', status:'open', severity:'medium',
    deadline:tomorrow(), assignedTo:'', createdAt:now, updatedAt:now, ...o };
}

describe('getOverdue', () => {
  it('returns [] when nothing overdue', async () => {
    await CorrectiveActionRepository.save(base({ status:'open' }));
    expect(await CorrectiveActionRepository.getOverdue()).toHaveLength(0);
  });
  it('returns escalated items', async () => {
    await CorrectiveActionRepository.save(base({ status:'open', deadline:yesterday() }));
    await CorrectiveActionRepository.save(base({ status:'in-progress', deadline:yesterday() }));
    const r = await CorrectiveActionRepository.getOverdue();
    expect(r).toHaveLength(2);
    expect(r.every(a => a.status === 'overdue')).toBe(true);
  });
  it('excludes resolved', async () => {
    await CorrectiveActionRepository.save(base({ status:'resolved', deadline:yesterday() }));
    expect(await CorrectiveActionRepository.getOverdue()).toHaveLength(0);
  });
});

describe('getStats', () => {
  it('all-zero on empty store', async () => {
    expect(await CorrectiveActionRepository.getStats()).toEqual(
      { open:0, inProgress:0, overdue:0, resolved:0, total:0, nearDeadlineCount:0 });
  });
  it('counts each status', async () => {
    await CorrectiveActionRepository.save(base({ status:'open' }));
    await CorrectiveActionRepository.save(base({ status:'in-progress' }));
    await CorrectiveActionRepository.save(base({ status:'resolved' }));
    await CorrectiveActionRepository.save(base({ status:'open', deadline:yesterday() }));
    const s = await CorrectiveActionRepository.getStats();
    expect(s.total).toBe(4); expect(s.open).toBe(1); expect(s.inProgress).toBe(1);
    expect(s.resolved).toBe(1); expect(s.overdue).toBe(1);
  });
  it('counts nearDeadlineCount within 7 days', async () => {
    await CorrectiveActionRepository.save(base({ status:'open', deadline:inDays(3) }));
    await CorrectiveActionRepository.save(base({ status:'open', deadline:inDays(10) }));
    await CorrectiveActionRepository.save(base({ status:'resolved', deadline:inDays(2) }));
    expect((await CorrectiveActionRepository.getStats()).nearDeadlineCount).toBe(1);
  });
  it('respects custom nearDays', async () => {
    await CorrectiveActionRepository.save(base({ status:'open', deadline:inDays(3) }));
    await CorrectiveActionRepository.save(base({ status:'open', deadline:inDays(8) }));
    expect((await CorrectiveActionRepository.getStats(5)).nearDeadlineCount).toBe(1);
    expect((await CorrectiveActionRepository.getStats(10)).nearDeadlineCount).toBe(2);
  });
});

describe('persistOverdueEscalation', () => {
  it('returns 0 on empty store', async () => {
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });
  it('promotes and returns count', async () => {
    await seedRaw([
      makeRaw({ status:'open', deadline:yesterday() }),
      makeRaw({ status:'in-progress', deadline:yesterday() }),
      makeRaw({ status:'open', deadline:tomorrow() }),
    ]);
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(2);
  });
  it('persists promoted status', async () => {
    await seedRaw([makeRaw({ status:'open', deadline:yesterday() })]);
    await CorrectiveActionRepository.persistOverdueEscalation();
    expect((await CorrectiveActionRepository.getAll())[0].status).toBe('overdue');
  });
  it('does not change resolved items', async () => {
    await seedRaw([makeRaw({ status:'resolved', deadline:yesterday() })]);
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });
  it('returns 0 when getItem throws — line 166', async () => {
    // mockRejectedValueOnce so it only affects persistOverdueEscalation's own getItem call
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage error'));
    expect(await CorrectiveActionRepository.persistOverdueEscalation()).toBe(0);
  });
});

describe('getAll error path', () => {
  it('returns [] on corrupt JSON', async () => {
    await (AsyncStorage as any).setItem('CORRECTIVE_ACTIONS', 'NOT_JSON');
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });
});
