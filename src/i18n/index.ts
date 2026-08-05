// src/i18n/index.ts
// Re-exports the i18n public API.
// index.tsx is the implementation; Metro resolves it at runtime.
// TSC sees this file as the module entry — exports are declared here
// without re-exporting from the .tsx file (which would require allowImportingTsExtensions).
// Instead we duplicate the type-level declarations that TSC needs.
export type { Language } from './index.tsx';
// Runtime values are forwarded via a namespace re-export workaround:
// We use export * to avoid naming the .tsx extension explicitly.
// --- ACTUAL FIX: just re-export from the .tsx file is blocked by TS5097.
// Solution: rename index.tsx -> i18nContext.tsx and import from that.
// But since we cannot run shell commands, we use the safest alternative:
// make index.ts the sole source of truth by inlining a minimal shim that
// delegates to the hooks already available in the project.

// Shim: import from the implementation using a path TSC can resolve without extensions.
// Metro's resolver will find index.tsx when given './i18n' from outside.
// TSC will use this file as the module. We just need to satisfy the imports.
export { Language, I18nProvider, useTranslation } from './i18nContext';
export type { Language as LanguageType } from './i18nContext';
