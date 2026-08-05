// src/i18n/index.ts
// Re-exports the i18n public API from index.tsx.
// Previously this pointed to './index-impl' which never existed.
export { Language, I18nProvider, useTranslation } from './index.tsx';
export type { Language as LanguageType } from './index.tsx';
