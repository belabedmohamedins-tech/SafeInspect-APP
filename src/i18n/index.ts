// src/i18n/index.ts
// Direct re-export from the TSX implementation.
// Using './index.tsx' is not allowed without allowImportingTsExtensions,
// so we export the members by importing the module without an extension.
export { Language, I18nProvider, useTranslation } from './index';
