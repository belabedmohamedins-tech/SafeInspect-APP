// src/repositories/AuditLogRepository.ts
//
// Append-only audit log for all data-mutating operations in the app.
// Every write action (inspection saved/deleted, agenda changed, settings
// changed, backup restored) produces an AuditEntry that is persisted under
// the AUDIT_LOG AsyncStorage key.
//
// The log is a ring-buffer capped at MAX_ENTRIES to prevent unbounded growth.
// Oldest entries are dropped first when the cap is reached.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';

const MAX_ENTRIES = 500;

export type AuditAction =
  | 'INSPECTION_SAVED'
  | 'INSPECTION_DELETED'
  | 'INSPECTION_BULK_DELETED'
  | 'AGENDA_ITEM_SAVED'
  | 'AGENDA_ITEM_DELETED'
  | 'SETTINGS_CHANGED'
  | 'BACKUP_RESTORED';

export interface AuditEntry {
  id: string;             // uuid-style: timestamp + random suffix
  timestamp: string;      // ISO datetime
  action: AuditAction;
  inspectorName: string;
  inspectionId?: string;
  facilityName?: string;
  /** Human-readable detail string (optional, for context). */
  detail?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function readLog(): Promise<AuditEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.AUDIT_LOG);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeLog(entries: AuditEntry[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.AUDIT_LOG, JSON.stringify(entries));
}

// ─── Public API ───────────────────────────────────────────────────────────────────

export const AuditLogRepository = {
  /**
   * Append a new entry to the audit log.
   * The log is trimmed to MAX_ENTRIES (oldest first) after every append.
   */
  async append(
    action: AuditAction,
    inspectorName: string,
    opts?: {
      inspectionId?: string;
      facilityName?: string;
      detail?: string;
    },
  ): Promise<void> {
    try {
      const entry: AuditEntry = {
        id: makeId(),
        timestamp: new Date().toISOString(),
        action,
        inspectorName,
        inspectionId: opts?.inspectionId,
        facilityName: opts?.facilityName,
        detail: opts?.detail,
      };
      const log = await readLog();
      log.push(entry);
      // Ring-buffer: keep only the most recent MAX_ENTRIES
      const trimmed = log.length > MAX_ENTRIES ? log.slice(log.length - MAX_ENTRIES) : log;
      await writeLog(trimmed);
    } catch {
      // Audit log failures must never crash the app
    }
  },

  /** Return all audit entries, newest-first. */
  async getAll(): Promise<AuditEntry[]> {
    const log = await readLog();
    return [...log].reverse();
  },

  /** Return entries filtered by action type. */
  async getByAction(action: AuditAction): Promise<AuditEntry[]> {
    const log = await readLog();
    return [...log].reverse().filter(e => e.action === action);
  },

  /** Return entries related to a specific inspection. */
  async getByInspection(inspectionId: string): Promise<AuditEntry[]> {
    const log = await readLog();
    return [...log].reverse().filter(e => e.inspectionId === inspectionId);
  },

  /** Wipe the entire audit log (admin / testing only). */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(StorageKeys.AUDIT_LOG);
  },
};
