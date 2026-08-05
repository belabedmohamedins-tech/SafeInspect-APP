// src/i18n/index.ts
// INTENTIONALLY EMPTY SHIM — see index.tsx for implementation.
// TSC resolves this file when importing from 'src/i18n'.
// We declare the exports here using 'export type' so TSC is satisfied,
// and the actual runtime values come from index.tsx (Metro resolves without extension).
// This avoids both the circular import AND TS5097 (no .tsx extension needed).
export { Language, I18nProvider, useTranslation } from './i18n-impl';
export type { Language as LanguageType } from './i18n-impl';
