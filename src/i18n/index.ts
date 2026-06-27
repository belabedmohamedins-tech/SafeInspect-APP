// src/i18n/index.ts — re-export barrel (actual implementation is in index.tsx)
// Metro/Babel reject JSX in .ts files; keeping this barrel ensures that any
// import path pointing at 'src/i18n' without an explicit extension still resolves.
export * from './index.tsx';
