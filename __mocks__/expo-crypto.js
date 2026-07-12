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

const CodingType = {
  HEX:    'hex',
  BASE64: 'base64',
};

module.exports = {
  CryptoDigestAlgorithm,
  CodingType,
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
