// src/stores/CriteriaPreviewStore.ts
//
// In-memory store used exclusively to pass template criteria items from
// checklists.tsx → preview.tsx without serialising them into URL params.
//
// Why not URL params?
//   Expo Router serialises params as strings. A full criteria array (with
//   Arabic text + legal references) can easily exceed Android's intent
//   extras size limit (~500 KB), causing a silent navigation crash.
//
// Usage:
//   Write:  CriteriaPreviewStore.set(criteriaItems);
//           router.push({ pathname: '/preview', params: { title: activityName } });
//   Read:   const items = CriteriaPreviewStore.get();

import { InspectionItem } from '../types';

let _items: InspectionItem[] = [];

export const CriteriaPreviewStore = {
  set(items: InspectionItem[]): void {
    _items = items;
  },

  get(): InspectionItem[] {
    return _items;
  },

  clear(): void {
    _items = [];
  },
};
