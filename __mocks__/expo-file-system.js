// __mocks__/expo-file-system.js
//
// L2 stub for expo-file-system.
// Provides configurable jest.fn() placeholders so L4 test files can freely
// override them with mockResolvedValue / mockRejectedValue without hitting
// Jest's "Cannot redefine property" error caused by the jest-expo preset's
// non-configurable auto-mock.
//
// Tests that need specific behaviour must supply their own jest.mock() factory
// (L4) which fully replaces this stub for that test file.

const FileSystem = {
  documentDirectory: 'file:///docs/',
  cacheDirectory:    'file:///cache/',
  EncodingType: {
    UTF8:   'utf8',
    Base64: 'base64',
  },
  getInfoAsync:       jest.fn().mockResolvedValue({ exists: false, isDirectory: false, uri: '', size: 0, modificationTime: 0 }),
  readAsStringAsync:  jest.fn().mockResolvedValue(''),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync:          jest.fn().mockResolvedValue(undefined),
  deleteAsync:        jest.fn().mockResolvedValue(undefined),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  moveAsync:          jest.fn().mockResolvedValue(undefined),
  downloadAsync:      jest.fn().mockResolvedValue({ uri: 'file:///cache/download', status: 200 }),
  createDownloadResumable: jest.fn(),
};

module.exports = FileSystem;
