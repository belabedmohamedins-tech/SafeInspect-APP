// src/repositories/InspectionRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditLogRepository } from './AuditLogRepository';
import { CorrectiveActionRepository } from './CorrectiveActionRepository';
import { IntegrityService } from '../services/IntegrityService';
import { SettingsRepository } from './SettingsRepository';
import { SavedInspection } from '../types';
import { StorageKeys } from './keys';

async function readAll(): Promise<SavedInspection[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.INSPECTIONS);
    return raw ? (JSON.parse(raw) as SavedInspection[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(inspections: SavedInspection[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.INSPECTIONS, JSON.stringify(inspections));
  // Always invalidate stats cache on any write so stats.tsx never serves stale data
  await AsyncStorage.removeItem(StorageKeys.STATS_CACHE);
}

/** Resolve the current inspector name for audit entries. */
async function resolveInspector(inspection: SavedInspection): Promise<string> {
  if (inspection.inspectorName?.trim()) return inspection.inspectorName.trim();
  const settings = await SettingsRepository.get();
  return settings.inspectorName || 'غير محدد';
}

export const InspectionRepository = {

  async getAll(): Promise<SavedInspection[]> {
    return readAll();
  },

  async getCompleted(): Promise<SavedInspection[]> {
    const all = await readAll();
    return all.filter(i => i.status === 'completed');
  },

  async getDrafts(): Promise<SavedInspection[]> {
    const all = await readAll();
    return all.filter(i => i.status === 'in-progress' || i.status === 'draft');
  },

  async getById(id: string): Promise<SavedInspection | null> {
    const all = await readAll();
    return all.find(i => i.id === id) ?? null;
  },

  async save(inspection: SavedInspection): Promise<void> {
    const all = await readAll();
    const index = all.findIndex(i => i.id === inspection.id);
    const isNew = index < 0;

    let record = inspection;

    // ── Integrity hash (completed inspections only) ──────────────────────────────
    if (record.status === 'completed' && !record.integrityHash) {
      // Hash is computed before the record is written so the hash covers
      // the record at the exact moment of completion.
      const hash = await IntegrityService.hashAndStore(record);
      record = { ...record, integrityHash: hash };
    }

    if (index >= 0) {
      all[index] = record;
    } else {
      all.push(record);
    }
    await writeAll(all);

    // ── Audit log ──────────────────────────────────────────────────────────────
    const inspector = await resolveInspector(record);
    await AuditLogRepository.append('INSPECTION_SAVED', inspector, {
      inspectionId: record.id,
      facilityName: record.facilityName,
      detail: `status=${record.status}${isNew ? ' (new)' : ' (update)'}`,
    });

    // ── Auto-create CAP items for completed inspections ──────────────────────
    if (record.status === 'completed') {
      const nonCompliant = record.items.filter(
        item => item.complianceStatus === 'non-compliant',
      );
      if (nonCompliant.length > 0) {
        // Load existing CAP items for this inspection to avoid duplicates
        const existing = await CorrectiveActionRepository.getByInspection(record.id);
        const existingItemIds = new Set(existing.map(a => a.inspectionItemId));

        for (const item of nonCompliant) {
          if (existingItemIds.has(item.id)) continue; // idempotent
          await CorrectiveActionRepository.save({
            inspectionId:    record.id,
            inspectionItemId: item.id,
            facilityId:      record.facilityId,
            facilityName:    record.facilityName,
            criteria:        item.criteria,
            severity:        item.severity,
            deadline:        '', // default (30 days) applied inside save()
            assignedTo:      '',
            status:          'open',
            notes:           item.comment,
          });
        }
      }
    }
  },

  async delete(id: string): Promise<void> {
    const all = await readAll();
    const target = all.find(i => i.id === id);
    const updated = all.filter(i => i.id !== id);
    await writeAll(updated);

    // Integrity: remove stored hash
    await IntegrityService.removeHash(id);

    // CAP: remove linked corrective actions
    await CorrectiveActionRepository.deleteByInspection(id);

    // Audit log
    if (target) {
      const inspector = await resolveInspector(target);
      await AuditLogRepository.append('INSPECTION_DELETED', inspector, {
        inspectionId: id,
        facilityName: target.facilityName,
      });
    }
  },

  async deleteMany(ids: string[]): Promise<void> {
    const set = new Set(ids);
    const all = await readAll();
    const targets = all.filter(i => set.has(i.id));
    const updated = all.filter(i => !set.has(i.id));
    await writeAll(updated);

    // Integrity: remove stored hashes
    await IntegrityService.removeHashes(ids);

    // CAP: remove linked corrective actions for each deleted inspection
    for (const id of ids) {
      await CorrectiveActionRepository.deleteByInspection(id);
    }

    // Audit log — one entry per deleted inspection
    for (const target of targets) {
      const inspector = await resolveInspector(target);
      await AuditLogRepository.append('INSPECTION_BULK_DELETED', inspector, {
        inspectionId: target.id,
        facilityName: target.facilityName,
        detail: `bulk delete (${ids.length} total)`,
      });
    }
  },
};
