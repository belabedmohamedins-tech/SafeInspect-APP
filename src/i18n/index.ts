// src/i18n/index.ts
// Barrel re-export from the TSX implementation.
// We cannot write `from './index.tsx'` without allowImportingTsExtensions,
// so we rely on the module resolver finding index.tsx when no extension is given.
// The ts-ignore below suppresses the TS2303 circular-alias false positive that
// occurs when TypeScript resolves './index' back to this file during declaration
// emit — at runtime Metro resolves it correctly to index.tsx.
// @ts-ignore TS2303 — resolved by Metro to ./index.tsx, not to this file
export { Language, I18nProvider, useTranslation } from './index.tsx';
