// src/repositories/CorrectiveActionRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveAction } from '../types';
import { StorageKeys } from './keys';

async function writeAll(actions: CorrectiveAction[]): Promise<void> {
  await AsyncStorage.setItem(
    StorageKeys.CORRECTIVE_ACTIONS,
    JSON.stringify(actions),
  );
}

function makeId(): string {
  return `cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

async function readAll(): Promise<CorrectiveAction[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.CORRECTIVE_ACTIONS);
    if (!raw) return [];

    const actions = JSON.parse(raw) as CorrectiveAction[];
    const today   = new Date().toISOString().slice(0, 10);
    let   dirty   = false;

    const escalated = actions.map(a => {
      if (
        (a.status === 'open' || a.status === 'in-progress') &&
        a.deadline < today
      ) {
        dirty = true;
        return { ...a, status: 'overdue' as const, updatedAt: new Date().toISOString() };
      }
      return a;
    });

    if (dirty) {
      await writeAll(escalated).catch(() => { /* non-fatal */ });
    }

    return escalated;
  } catch {
    return [];
  }
}

export interface CapStats {
  open:              number;
  inProgress:        number;
  overdue:           number;
  resolved:          number;
  total:             number;
  nearDeadlineCount: number;
}

export const CorrectiveActionRepository = {
  async getAll(): Promise<CorrectiveAction[]> {
    return readAll();
  },

  async getByInspection(inspectionId: string): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(a => a.inspectionId === inspectionId);
  },

  async getByFacility(facilityId: string): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(a => a.facilityId === facilityId);
  },

  async getOpen(): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(
      a => a.status === 'open' ||
           a.status === 'in-progress' ||
           a.status === 'overdue',
    );
  },

  async getOverdue(): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(a => a.status === 'overdue');
  },

  async getStats(nearDays = 7): Promise<CapStats> {
    const all   = await readAll();
    const today = new Date().toISOString().slice(0, 10);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + nearDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const stats: CapStats = {
      open:              0,
      inProgress:        0,
      overdue:           0,
      resolved:          0,
      total:             all.length,
      nearDeadlineCount: 0,
    };

    for (const a of all) {
      if      (a.status === 'open')        stats.open++;
      else if (a.status === 'in-progress') stats.inProgress++;
      else if (a.status === 'overdue')     stats.overdue++;
      else if (a.status === 'resolved')    stats.resolved++;

      if (
        a.status !== 'resolved' &&
        a.deadline >= today &&
        a.deadline <= cutoffStr
      ) {
        stats.nearDeadlineCount++;
      }
    }

    return stats;
  },

  async persistOverdueEscalation(): Promise<number> {
    try {
      const raw = await AsyncStorage.getItem(StorageKeys.CORRECTIVE_ACTIONS);
      if (!raw) return 0;

      const actions = JSON.parse(raw) as CorrectiveAction[];
      const today   = new Date().toISOString().slice(0, 10);
      let   count   = 0;

      const updated = actions.map(a => {
        if (
          (a.status === 'open' || a.status === 'in-progress') &&
          a.deadline < today
        ) {
          count++;
          return { ...a, status: 'overdue' as const, updatedAt: new Date().toISOString() };
        }
        return a;
      });

      if (count > 0) await writeAll(updated);
      return count;
    } catch /* istanbul ignore next */ {
      return 0;
    }
  },

  async save(
    action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> &
            Partial<Pick<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<CorrectiveAction> {
    const all = await readAll();
    const now = new Date().toISOString();
    const id  = /* istanbul ignore next */ action.id ?? makeId();

    const existing = all.findIndex(a => a.id === id);
    const record: CorrectiveAction = {
      ...action,
      id,
      deadline:   /* istanbul ignore next */ action.deadline   || defaultDeadline(),
      assignedTo: /* istanbul ignore next */ action.assignedTo || '',
      createdAt:  /* istanbul ignore next */ action.createdAt  ?? now,
      updatedAt:  now,
    };

    if (existing >= 0) {
      all[existing] = record;
    } else {
      all.push(record);
    }

    await writeAll(all);
    return record;
  },

  async updateStatus(
    id:     string,
    status: CorrectiveAction['status'],
    notes?: string,
  ): Promise<void> {
    const all   = await readAll();
    const index = all.findIndex(a => a.id === id);
    if (index < 0) return;

    const now    = new Date().toISOString();
    const prev   = all[index];

    all[index] = {
      ...prev,
      status,
      notes:    /* istanbul ignore next */ notes ?? prev.notes,
      updatedAt: now,
      closedAt:  status === 'resolved' ? now : prev.closedAt,
    };

    await writeAll(all);
  },

  async delete(id: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(a => a.id !== id));
  },

  async deleteByInspection(inspectionId: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(a => a.inspectionId !== inspectionId));
  },
};
