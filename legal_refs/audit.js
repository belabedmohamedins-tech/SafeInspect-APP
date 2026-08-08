#!/usr/bin/env node
/**
 * legal_refs/audit.js
 * Scans all *.md files in legal_refs/, extracts article numbers,
 * flags duplicate instruments, and reports numbering gaps.
 *
 * Usage:  node legal_refs/audit.js
 * Node >= 14 required (fs.readdirSync, no external deps)
 */

const fs   = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract all article numbers from file content.
 *  Matches patterns like:
 *    ## Art. 12      ## Article 12      **Art. 12**
 *    Art. 12 —       Article 12.        art. 12
 *  Returns sorted array of unique integers found.
 */
function extractArticleNumbers(content) {
  const re = /(?:^|\s)(?:art(?:icle)?[s.]\s*)(\d+)/gim;
  const nums = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    const n = parseInt(m[1], 10);
    if (!isNaN(n)) nums.add(n);
  }
  return [...nums].sort((a, b) => a - b);
}

/** Given a sorted array of ints, return an array of gap descriptions. */
function findGaps(nums) {
  const gaps = [];
  for (let i = 1; i < nums.length; i++) {
    const prev = nums[i - 1];
    const curr = nums[i];
    if (curr - prev > 1) {
      const missing = [];
      for (let j = prev + 1; j < curr; j++) missing.push(j);
      gaps.push({ after: prev, before: curr, missing });
    }
  }
  return gaps;
}

/** Derive a normalised instrument key from a filename for duplicate detection.
 *  Strips type prefix variants and slug suffixes so that:
 *    loi-19-02-incendie-panique.md
 *    loi-19-02-prevention-incendie-panique.md
 *  both map to  "loi-19-02"
 */
function instrumentKey(filename) {
  // Remove .md extension
  let s = filename.replace(/\.md$/, '');
  // Normalise separators and case
  s = s.toLowerCase().replace(/[_\s]+/g, '-');
  // Match type + number pattern at start
  const m = s.match(/^(loi|decret|arr[eê]t[eé]|arrete|ordonnance|circulaire|code|aim|note)[^a-z0-9]*([0-9]{2}-[0-9]{2,3})/i);
  if (m) return `${m[1].toLowerCase()}-${m[2]}`;
  // Fallback: first 20 chars
  return s.slice(0, 20);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.md') && f !== 'README.md')
  .sort();

if (files.length === 0) {
  console.log('No .md files found in', DIR);
  process.exit(0);
}

const results     = [];
const keyToFiles  = {};          // instrument key → [filenames]
let   totalIssues = 0;

for (const file of files) {
  const filepath = path.join(DIR, file);
  const content  = fs.readFileSync(filepath, 'utf8');
  const nums     = extractArticleNumbers(content);
  const gaps     = findGaps(nums);
  const key      = instrumentKey(file);

  if (!keyToFiles[key]) keyToFiles[key] = [];
  keyToFiles[key].push(file);

  results.push({ file, key, nums, gaps });
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════');
console.log('  SafeInspect — legal_refs audit');
console.log(`  ${new Date().toISOString()}`);
console.log('═══════════════════════════════════════════════════════\n');

// 1. Duplicate instruments
console.log('── 1. DUPLICATE INSTRUMENT CHECK ──────────────────────');
let hasDupes = false;
for (const [key, flist] of Object.entries(keyToFiles)) {
  if (flist.length > 1) {
    hasDupes = true;
    totalIssues++;
    console.log(`  ❌ DUPLICATE  key="${key}"`);
    flist.forEach(f => {
      const stat = fs.statSync(path.join(DIR, f));
      console.log(`       ${f}  (${stat.size} bytes)`);
    });
    console.log(`     → Keep the larger/more complete file; delete the other.`);
  }
}
if (!hasDupes) console.log('  ✅ No duplicate instruments detected.');

// 2. Per-file article audit
console.log('\n── 2. PER-FILE ARTICLE AUDIT ──────────────────────────');
for (const { file, nums, gaps } of results) {
  const rangeStr = nums.length === 0
    ? 'NO ARTICLES DETECTED'
    : formatRanges(nums);

  const gapStr = gaps.length === 0 ? '✅ No gaps' : `❌ ${gaps.length} gap(s)`;
  console.log(`\n  📄 ${file}`);
  console.log(`     Articles found : ${nums.length === 0 ? '⚠️  none' : nums.length}  [${rangeStr}]`);
  console.log(`     Sequence check : ${gapStr}`);

  if (gaps.length > 0) {
    totalIssues++;
    gaps.forEach(g => {
      const mStr = g.missing.length <= 10
        ? g.missing.join(', ')
        : g.missing.slice(0, 10).join(', ') + ` … (${g.missing.length} total)`;
      console.log(`       Missing after Art.${g.after}: Art. ${mStr}`);
    });
  }

  if (nums.length === 0) totalIssues++;
}

// 3. Summary
console.log('\n── 3. SUMMARY ─────────────────────────────────────────');
console.log(`  Files scanned : ${files.length}`);
console.log(`  Total issues  : ${totalIssues === 0 ? '✅ 0 — clean!' : '❌ ' + totalIssues}`);
if (totalIssues > 0) {
  console.log('  → Fix duplicates and fill gaps before relying on this folder for legal citations.');
}
console.log();

// ── Utility ──────────────────────────────────────────────────────────────────

/** Compact a sorted int array into a human-readable range string.
 *  [1,2,3,5,6,10] → "1–3, 5–6, 10" */
function formatRanges(nums) {
  if (nums.length === 0) return '';
  const ranges = [];
  let start = nums[0], end = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === end + 1) {
      end = nums[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}–${end}`);
      start = end = nums[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(', ');
}
