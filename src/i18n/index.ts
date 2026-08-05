// src/i18n/index.ts
// Re-exports the i18n public API from the TSX implementation file.
// Must use './index.tsx' explicitly so TSC does not resolve './index' back to this file.
// Metro ignores extensions and resolves correctly at runtime.
export { Language, I18nProvider, useTranslation } from './index.tsx';
export type { Language as LanguageType } from './index.tsx';
