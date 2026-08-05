// src/i18n/index.ts
// Re-export from the TSX implementation so both
// `import from 'src/i18n'` and `import from 'src/i18n/index'` resolve.
export { Language, I18nProvider, useTranslation } from './index.tsx';
