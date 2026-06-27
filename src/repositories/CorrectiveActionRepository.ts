// src/repositories/CorrectiveActionRepository.ts
//
// Manages the Corrective Action Plan (CAP) — a list of remediation tasks
// generated automatically when an inspection is completed with non-compliant
// findings. Inspectors can also create CAP items manually.
//
// Each CorrectiveAction is linked to:
//   - the source inspection (inspectionId)
//   - the specific finding (inspectionItemId)
//   - the facility (facilityId / facilityName)
//
// Status lifecycle:
//   open → in-progress → resolved
//            ↓ (if past deadline and not resolved)
//          overdue

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CorrectiveAction } from '../types';
import { StorageKeys } from './keys';

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function readAll(): Promise<CorrectiveAction[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.CORRECTIVE_ACTIONS);
    if (!raw) return [];
    const actions = JSON.parse(raw) as CorrectiveAction[];
    // Auto-escalate open/in-progress items past their deadline to 'overdue'
    const today = new Date().toISOString().slice(0, 10);
    return actions.map(a =>
      (a.status === 'open' || a.status === 'in-progress') && a.deadline < today
        ? { ...a, status: 'overdue' as const, updatedAt: new Date().toISOString() }
        : a,
    );
  } catch {
    return [];
  }
}

async function writeAll(actions: CorrectiveAction[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.CORRECTIVE_ACTIONS, JSON.stringify(actions));
}

function makeId(): string {
  return `cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Default deadline: 30 days from today. */
function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

// ─── Public API ───────────────────────────────────────────────────────────────────

export const CorrectiveActionRepository = {
  /** Return all CAP items (with auto-overdue escalation applied). */
  async getAll(): Promise<CorrectiveAction[]> {
    return readAll();
  },

  /** Return all CAP items for a specific inspection. */
  async getByInspection(inspectionId: string): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(a => a.inspectionId === inspectionId);
  },

  /** Return all CAP items for a specific facility. */
  async getByFacility(facilityId: string): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(a => a.facilityId === facilityId);
  },

  /** Return all open or overdue CAP items (pending resolution). */
  async getOpen(): Promise<CorrectiveAction[]> {
    const all = await readAll();
    return all.filter(a => a.status === 'open' || a.status === 'in-progress' || a.status === 'overdue');
  },

  /**
   * Upsert a CAP item. If an item with the same id exists it is replaced;
   * otherwise the item is appended. `createdAt` and `id` are auto-set for
   * new items if not provided.
   */
  async save(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CorrectiveAction> {
    const all = await readAll();
    const now = new Date().toISOString();
    const id = action.id ?? makeId();
    const existing = all.findIndex(a => a.id === id);
    const record: CorrectiveAction = {
      ...action,
      id,
      deadline: action.deadline || defaultDeadline(),
      assignedTo: action.assignedTo || '',
      createdAt: action.createdAt ?? now,
      updatedAt: now,
    };
    if (existing >= 0) {
      all[existing] = record;
    } else {
      all.push(record);
    }
    await writeAll(all);
    return record;
  },

  /**
   * Update only the status (and optional notes/closedAt) of a CAP item.
   * Automatically sets closedAt when status becomes 'resolved'.
   */
  async updateStatus(
    id: string,
    status: CorrectiveAction['status'],
    notes?: string,
  ): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(a => a.id === id);
    if (index < 0) return;
    const now = new Date().toISOString();
    all[index] = {
      ...all[index],
      status,
      notes: notes ?? all[index].notes,
      updatedAt: now,
      closedAt: status === 'resolved' ? now : all[index].closedAt,
    };
    await writeAll(all);
  },

  /** Delete a single CAP item by id. */
  async delete(id: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(a => a.id !== id));
  },

  /** Delete all CAP items linked to a specific inspection (called when inspection is deleted). */
  async deleteByInspection(inspectionId: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(a => a.inspectionId !== inspectionId));
  },
};
