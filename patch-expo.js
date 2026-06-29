#!/usr/bin/env node
/**
 * patch-expo.js — Node 22 compatibility patch for Expo SDK 53
 *
 * Several expo-* packages ship "main": "src/index.ts" in their package.json,
 * which causes Node 22 to crash with ERR_UNKNOWN_FILE_EXTENSION when Expo CLI
 * tries to load them. This script rewrites those entries to point at the
 * pre-compiled build/ JS files instead.
 *
 * Runs automatically via the postinstall npm hook.
 */
const fs   = require('fs');
const path = require('path');

// List of packages whose package.json "main" field points at a .ts file
const PKG_PATCHES = [
  { pkg: 'expo-modules-core', from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-sharing',      from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-crypto',       from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-print',        from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-document-picker', from: 'src/index.ts', to: 'build/index.js'  },
  { pkg: 'expo-secure-store', from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-local-authentication', from: 'src/index.ts', to: 'build/index.js' },
  { pkg: 'expo-notifications', from: 'src/index.ts',  to: 'build/index.js'   },
  { pkg: 'expo-file-system',  from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-constants',    from: 'src/index.ts',   to: 'build/index.js'   },
  { pkg: 'expo-splash-screen', from: 'src/index.ts',  to: 'build/index.js'   },
];

// Also patch any require() calls inside build JS files that reference .ts
const FILE_PATCHES = [
  {
    pkg:  'expo-sharing',
    file: 'build/Sharing.js',
    from: './ExpoSharing.ts',
    to:   './ExpoSharing.js',
  },
];

let patched = 0;

for (const { pkg, from, to } of PKG_PATCHES) {
  const pkgJsonPath = path.join(__dirname, 'node_modules', pkg, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (pkgJson.main && pkgJson.main.includes(from)) {
    const buildPath = path.join(__dirname, 'node_modules', pkg, to);
    if (!fs.existsSync(buildPath)) {
      console.warn(`[patch-expo] WARNING: ${pkg}/${to} does not exist — skipping.`);
      continue;
    }
    pkgJson.main = to;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    console.log(`[patch-expo] ${pkg}: main → ${to}`);
    patched++;
  }
}

for (const { pkg, file, from, to } of FILE_PATCHES) {
  const filePath = path.join(__dirname, 'node_modules', pkg, file);
  if (!fs.existsSync(filePath)) continue;

  let src = fs.readFileSync(filePath, 'utf8');
  if (src.includes(from)) {
    fs.writeFileSync(filePath, src.split(from).join(to));
    console.log(`[patch-expo] ${pkg}/${file}: ${from} → ${to}`);
    patched++;
  }
}

console.log(`[patch-expo] Done. ${patched} patch(es) applied.`);
