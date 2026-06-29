// Targeted fix: rewrites expo-modules-core/package.json main field
// from src/index.ts to build/index.js so Node 20 does not try to
// load raw TypeScript when expo CLI starts.
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(
  __dirname,
  'node_modules',
  'expo-modules-core',
  'package.json'
);

if (!fs.existsSync(pkgPath)) {
  console.log('[fix-expo-modules] expo-modules-core not found, skipping.');
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

if (pkg.main === 'build/index.js') {
  console.log('[fix-expo-modules] Already correct, nothing to do.');
  process.exit(0);
}

const buildEntry = path.resolve(
  __dirname,
  'node_modules',
  'expo-modules-core',
  'build',
  'index.js'
);

if (!fs.existsSync(buildEntry)) {
  console.warn('[fix-expo-modules] build/index.js does not exist — cannot patch. Skipping.');
  process.exit(0);
}

const original = pkg.main;
pkg.main = 'build/index.js';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`[fix-expo-modules] Patched main: ${original} -> build/index.js`);
