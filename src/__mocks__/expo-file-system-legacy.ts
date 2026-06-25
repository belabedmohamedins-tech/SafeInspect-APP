/**
 * Mock shim for 'expo-file-system/legacy'.
 *
 * jest.config (moduleNameMapper) redirects all imports of
 * 'expo-file-system/legacy' here so the tests can mock the module
 * without needing the native binary.
 *
 * Individual test files override specific functions with jest.mock(...).
 * This file provides the baseline surface so TypeScript is happy and
 * un-mocked code paths don't throw 'undefined is not a function'.
 */

export const documentDirectory = 'file:///docs/';
export const cacheDirectory    = 'file:///cache/';

export const EncodingType = { UTF8: 'utf8' } as const;

export const copyAsync            = jest.fn().mockResolvedValue(undefined);
export const deleteAsync          = jest.fn().mockResolvedValue(undefined);
export const writeAsStringAsync   = jest.fn().mockResolvedValue(undefined);
export const readAsStringAsync    = jest.fn().mockResolvedValue('');
export const getInfoAsync         = jest.fn().mockResolvedValue({ exists: false });
export const makeDirectoryAsync   = jest.fn().mockResolvedValue(undefined);
export const moveAsync            = jest.fn().mockResolvedValue(undefined);
