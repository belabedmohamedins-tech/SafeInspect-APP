#!/usr/bin/env node
/**
 * patch-expo.js
 * Patches all known expo-* packages that ship raw TypeScript source
 * as their "main" entry point. Runs automatically on `npm install`
 * via the postinstall hook.
 */
const fs = require('fs');
const path = require('path');

const patches = [
  {
    pkg: 'expo-modules-core',
    from: 'src/index.ts',
    to:   'build/index.js',
  },
  {
    pkg: 'expo-sharing',
    // expo-sharing/build/ExpoSharing native module is a .ts file
    // Patch the main entry so Node resolves the built JS instead
    from: 'build/ExpoSharing.ts',
    to:   'build/ExpoSharing.js',
    file: 'build/Sharing.js',   // patch the require() line inside this file
    replaceIn: true,
  },
];

for (const patch of patches) {
  const pkgJsonPath = path.join(__dirname, 'node_modules', patch.pkg, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    console.log(`[patch-expo] Skipping ${patch.pkg} (not installed)`);
    continue;
  }

  if (patch.replaceIn) {
    // Replace a require/import path inside a built JS file
    const targetFile = path.join(__dirname, 'node_modules', patch.pkg, patch.file);
    if (fs.existsSync(targetFile)) {
      let src = fs.readFileSync(targetFile, 'utf8');
      if (src.includes(patch.from)) {
        src = src.split(patch.from).join(patch.to);
        fs.writeFileSync(targetFile, src);
        console.log(`[patch-expo] Patched ${patch.pkg}/${patch.file}: ${patch.from} → ${patch.to}`);
      } else {
        console.log(`[patch-expo] ${patch.pkg}/${patch.file} already patched or pattern not found.`);
      }
    } else {
      console.log(`[patch-expo] ${patch.pkg}/${patch.file} not found, skipping.`);
    }
    continue;
  }

  // Patch the package.json "main" field
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (pkg.main && pkg.main.includes(patch.from)) {
    pkg.main = patch.to;
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
    console.log(`[patch-expo] Patched ${patch.pkg}/package.json: main → ${patch.to}`);
  } else {
    console.log(`[patch-expo] ${patch.pkg} already patched (main: ${pkg.main}).`);
  }
}

console.log('[patch-expo] Done.');
