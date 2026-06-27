// src/constants/index.ts
// Central export point for all app-wide constants.
// Import from here, not from individual files.
//
// NOTE: Colors was removed — it pointed to a non-existent ./colors file
// and had zero consumers in the codebase. Add a colors.ts here if
// app-wide color tokens are needed in the future.
export { StorageKeys } from '../repositories/keys';
