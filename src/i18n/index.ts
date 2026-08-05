// src/i18n/index.ts
// Re-exports the i18n public API.
// We import from the compiled JS neighbour (index.tsx → resolved by Metro
// without the extension) so TSC does not require allowImportingTsExtensions.
export { Language, I18nProvider, useTranslation } from './index';
export type { Language as LanguageType } from './index';
