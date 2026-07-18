// src/repositories/InspectionRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';
import { SavedInspection, InspectionItem } from '../types';
import { IntegrityService } from '../services/IntegrityService';
import { AuditLogRepository } from './AuditLogRepository';
import { createCapItemsFromInspection } from '../services/capFactory';
import { createFollowUpIfNeeded } from '../services/followUpService';
import { ApprovalRepository } from './ApprovalRepository';
import { annotateRepeatViolations } from '../services/violationHistory';

// T0.11 — strip NaN / Infinity / null from numericValue before persisting.
// These can arrive when a user clears the input field or when a platform
// coerces an empty string to 0 then to NaN through a parseFloat cycle.
function sanitizeItems(items: InspectionItem[]): InspectionItem[] {
  return items.map(item => {
    const v = item.numericValue;
    if (v === undefined) return item;
    if (v === null || !isFinite(v) || isNaN(v)) {
      const { numericValue: _drop, ...rest } = item;
      return rest as InspectionItem;
    }
    return item;
  });
}

async function loadAll(): Promise<SavedInspection[]> {
  const raw = await AsyncStorage.getItem(StorageKeys.INSPECTIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedInspection[];
  } catch {
    return [];
  }
}

async function saveAll(inspections: SavedInspection[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.INSPECTIONS, JSON.stringify(inspections));
  await AsyncStorage.removeItem(StorageKeys.STATS_CACHE);
}

export const InspectionRepository = {
  async getAll(): Promise<SavedInspection[]> {
    return loadAll();
  },

  async getCompleted(): Promise<SavedInspection[]> {
    const all = await loadAll();
    return all.filter(i => i.status === 'completed');
  },

  async getDrafts(): Promise<SavedInspection[]> {
    const all = await loadAll();
    return all.filter(i => i.status === 'in-progress' || i.status === 'draft');
  },

  async getById(id: string): Promise<SavedInspection | null> {
    const all = await loadAll();
    return all.find(i => i.id === id) ?? null;
  },

  async save(inspection: SavedInspection): Promise<void> {
    const all = await loadAll();
    const idx = all.findIndex(i => i.id === inspection.id);
    const isNewCompletion =
      inspection.status === 'completed' &&
      (idx === -1 || all[idx]?.status !== 'completed');

    // T0.11: sanitize numeric values before any further processing or storage.
    let toSave: SavedInspection = {
      ...inspection,
      items: sanitizeItems(inspection.items),
    };

    if (isNewCompletion) {
      try {
        const accessors = {
          getAll: () => InspectionRepository.getAll(),
          getById: (id: string) => InspectionRepository.getById(id),
        };
        const annotatedItems = await annotateRepeatViolations(
          accessors,
          toSave.items,
          toSave.facilityId,
          toSave.id,
          toSave.priorInspectionId,
        );
        toSave = { ...toSave, items: annotatedItems }; // istanbul ignore next
      } catch {
        // Non-fatal — annotation failure must not block save.
      }

      const hash = await IntegrityService.computeHash(toSave);
      toSave = {
        ...toSave,
        integrityHash: hash,
        approvalStatus: /* istanbul ignore next */ toSave.approvalStatus ?? 'pending',
      };
    }

    if (idx === -1) {
      all.push(toSave);
    } else {
      all[idx] = toSave;
    }
    await saveAll(all);

    if (isNewCompletion) {
      // FIX (G17a): use positional-args form that matches AuditLogRepository.append signature
      await AuditLogRepository.append(
        'INSPECTION_SAVED',
        toSave.inspectorName,
        { inspectionId: toSave.id, facilityName: toSave.facilityName },
      );

      // FIX (G17c): replaced dead CorrectiveActionRepository.createFromInspection
      // (method never existed) with the real capFactory function — this is why
      // CAP items were silently not being created on inspection completion.
      await createCapItemsFromInspection(toSave);

      try {
        await createFollowUpIfNeeded(toSave);
      } catch { /* non-fatal */ }

      try {
        await ApprovalRepository.enqueue(toSave);
      } catch { /* non-fatal */ }
    }
  },

  async delete(id: string): Promise<void> {
    const all = await loadAll();
    const target = all.find(i => i.id === id);
    const updated = all.filter(i => i.id !== id);
    await saveAll(updated);
    if (target) {
      // FIX (G17a): positional-args form
      await AuditLogRepository.append(
        'INSPECTION_DELETED',
        target.inspectorName,
        { inspectionId: id, facilityName: target.facilityName },
      );
    }
  },

  async deleteMany(ids: string[]): Promise<void> {
    const all = await loadAll();
    const updated = all.filter(i => !ids.includes(i.id));
    await saveAll(updated);
    // FIX (G17a): positional-args form
    await AuditLogRepository.append(
      'INSPECTION_BULK_DELETED',
      'system',
      { detail: `حذف ${ids.length} تقارير` },
    );
  },
};
