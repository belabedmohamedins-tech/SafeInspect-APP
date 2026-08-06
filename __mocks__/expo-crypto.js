// __mocks__/expo-crypto.js — LAYER 2
// expo-crypto calls requireNativeModule('ExpoCrypto') at load time.
// Our expo.js stub returns {} so requireNativeModule is undefined → crash.
// Provide just enough surface for IntegrityService (getRandomBytes, digestStringAsync).
'use strict';

const CryptoDigestAlgorithm = {
  SHA1:   'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
  MD5:    'MD5',
};

// CodingType is the internal enum name in some expo-crypto versions.
// Production code (IntegrityService.ts) uses Crypto.CryptoEncoding.HEX,
// so we export BOTH names pointing to the same object.
const CodingType = {
  HEX:    'hex',
  BASE64: 'base64',
};

// Alias used by IntegrityService.ts: Crypto.CryptoEncoding.HEX
const CryptoEncoding = CodingType;

module.exports = {
  CryptoDigestAlgorithm,
  CodingType,
  CryptoEncoding,
  getRandomBytes:      jest.fn((size) => new Uint8Array(size).fill(0)),
  getRandomBytesAsync: jest.fn((size) => Promise.resolve(new Uint8Array(size).fill(0))),
  digestStringAsync:   jest.fn((_alg, data, _opts) =>
    Promise.resolve(Buffer.from(String(data)).toString('hex'))
  ),
  digest:              jest.fn((_alg, data) =>
    Promise.resolve(new Uint8Array(Buffer.from(String(data))))
  ),
  randomUUID:          jest.fn(() => '00000000-0000-0000-0000-000000000000'),
};
