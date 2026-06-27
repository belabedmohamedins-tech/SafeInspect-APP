// src/stores/CriteriaPreviewStore.ts
// In-memory store that bridges the checklists screen and the preview screen.
// Using a plain object (not AsyncStorage) is intentional — this data is
// ephemeral and only needs to survive a single navigation push.

import { InspectionItem, SavedInspection } from '../types';

let _items: InspectionItem[] = [];
let _inspection: SavedInspection | null = null;

export const CriteriaPreviewStore = {
  /** Legacy: store only items (kept for backward compat). */
  set(items: InspectionItem[]): void {
    _items = items;
  },
  get(): InspectionItem[] {
    return _items;
  },

  /** Preferred: store a full fake SavedInspection. */
  setInspection(ins: SavedInspection): void {
    _inspection = ins;
    _items = ins.items; // keep legacy field in sync
  },
  getInspection(): SavedInspection | null {
    return _inspection;
  },

  clear(): void {
    _items = [];
    _inspection = null;
  },
};
