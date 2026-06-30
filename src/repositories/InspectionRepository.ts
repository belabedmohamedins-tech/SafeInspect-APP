// src/repositories/InspectionRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';
import { SavedInspection } from '../types';
import { IntegrityService } from '../services/IntegrityService';
import { AuditLogRepository } from './AuditLogRepository';
import { CorrectiveActionRepository } from './CorrectiveActionRepository';
import { createFollowUpIfNeeded } from '../services/followUpService';
import { ApprovalRepository } from './ApprovalRepository';

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
  // Invalidate stats cache so stale aggregates are not served
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

    // Auto-hash on completion — computeHash is async (SHA-256 via expo-crypto)
    let toSave = inspection;
    if (isNewCompletion) {
      const hash = await IntegrityService.computeHash(inspection);
      toSave = { ...inspection, integrityHash: hash, approvalStatus: inspection.approvalStatus ?? 'pending' };
    }

    if (idx === -1) {
      all.push(toSave);
    } else {
      all[idx] = toSave;
    }
    await saveAll(all);

    // Audit log + CAP + follow-up on first completion
    if (isNewCompletion) {
      await AuditLogRepository.append({
        action: 'INSPECTION_SAVED',
        inspectionId: toSave.id,
        facilityName: toSave.facilityName,
        inspectorName: toSave.inspectorName,
      });
      await CorrectiveActionRepository.createFromInspection(toSave);

      // Auto follow-up agenda (FR-025)
      try {
        await createFollowUpIfNeeded(toSave);
      } catch { /* non-fatal */ }

      // Enqueue for supervisor approval (FR-069)
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
      await AuditLogRepository.append({
        action: 'INSPECTION_DELETED',
        inspectionId: id,
        facilityName: target.facilityName,
        inspectorName: target.inspectorName,
      });
    }
  },

  async deleteMany(ids: string[]): Promise<void> {
    const all = await loadAll();
    const updated = all.filter(i => !ids.includes(i.id));
    await saveAll(updated);
    await AuditLogRepository.append({
      action: 'INSPECTION_BULK_DELETED',
      inspectorName: 'system',
      detail: `حذف ${ids.length} تقارير`,
    });
  },
};
