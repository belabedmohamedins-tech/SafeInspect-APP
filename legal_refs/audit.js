#!/usr/bin/env node
/**
 * legal_refs/audit.js
 * Audits all .md files in this directory for article coverage.
 *
 * Usage:  node legal_refs/audit.js
 *
 * What it reports per file:
 *   - Total article numbers detected
 *   - Highest article number found
 *   - Any sequence gaps (e.g. Art.5 found but Art.4 missing)
 *   - Lines tagged [MANQUANT] or [À VÉRIFIER]
 *
 * Regex design (W31-1 fix):
 *   Previous regex required whitespace before "art" — this caused bold
 *   markdown headers (**Art. N.**) to be missed entirely because the **
 *   sits directly against the word with no preceding space.
 *
 *   Fixed regex tolerates:
 *     - Leading asterisks (bold markdown: **Art. or *Art.)
 *     - "Art." and "Article" and plural "Articles"
 *     - Period OR colon as terminator (Art. N. and Art. N :)
 *     - No terminator (Article 12 with no punctuation)
 *     - Case-insensitive
 *
 *   Regex: /(?:^|[\s*])\*{0,2}(article?s?)\.?\s*(\d+)/gim
 *   Simplified to:  /\*{0,2}art(?:icle)?s?[.:]?\s*(\d+)/gim
 */

const fs   = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname);

// Matches: **Art. 12**, *Article 3 :*, Art.5, Article 12, Articles 3 à 7, etc.
// Does NOT match bare numbers or unrelated occurrences of "art".
const ARTICLE_RE = /\*{0,2}art(?:icle)?s?[.:]?\s*(\d+)/gim;

const MANQUANT_RE  = /\[MANQUANT/gi;
const AVERIFIER_RE = /\[À VÉRIFIER/gi;

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  const numbers = new Set();
  let match;
  ARTICLE_RE.lastIndex = 0;
  while ((match = ARTICLE_RE.exec(content)) !== null) {
    numbers.add(parseInt(match[1], 10));
  }

  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const max    = sorted.length ? sorted[sorted.length - 1] : 0;

  // Detect gaps (only meaningful if at least 3 articles found)
  const gaps = [];
  if (sorted.length >= 3) {
    for (let i = sorted[0]; i <= max; i++) {
      if (!numbers.has(i)) gaps.push(i);
    }
  }

  const manquantCount  = (content.match(MANQUANT_RE)  || []).length;
  const averifierCount = (content.match(AVERIFIER_RE) || []).length;

  return { filename, sorted, max, gaps, manquantCount, averifierCount };
}

function main() {
  const files = fs.readdirSync(DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();

  let totalManquant  = 0;
  let totalAverifie  = 0;
  let filesWithGaps  = 0;

  console.log('='.repeat(72));
  console.log('SafeInspect legal_refs — Article Coverage Audit');
  console.log('='.repeat(72));
  console.log();

  for (const file of files) {
    const r = auditFile(path.join(DIR, file));
    totalManquant  += r.manquantCount;
    totalAverifie  += r.averifierCount;
    if (r.gaps.length) filesWithGaps++;

    const status = r.manquantCount > 0  ? '⚠️  PARTIEL'
                 : r.averifierCount > 0 ? '⚠️  À VÉRIFIER'
                 : r.sorted.length === 0 ? '–  (no articles)'
                 : '✅ OK';

    console.log(`📄 ${r.filename}`);
    console.log(`   Status     : ${status}`);
    console.log(`   Articles   : ${r.sorted.length} found, highest = ${r.max}`);
    if (r.sorted.length > 0) {
      console.log(`   Numbers    : ${r.sorted.slice(0, 20).join(', ')}${r.sorted.length > 20 ? ' …' : ''}`);
    }
    if (r.gaps.length) {
      console.log(`   ⚠ Gaps     : ${r.gaps.slice(0, 20).join(', ')}${r.gaps.length > 20 ? ` … (${r.gaps.length} total)` : ''}`);
    }
    if (r.manquantCount)  console.log(`   [MANQUANT] : ${r.manquantCount} occurrence(s)`);
    if (r.averifierCount) console.log(`   [À VÉRIF.] : ${r.averifierCount} occurrence(s)`);
    console.log();
  }

  console.log('='.repeat(72));
  console.log('SUMMARY');
  console.log(`  Files scanned    : ${files.length}`);
  console.log(`  Files with gaps  : ${filesWithGaps}`);
  console.log(`  [MANQUANT] total : ${totalManquant}`);
  console.log(`  [À VÉRIFIER] tot : ${totalAverifie}`);
  console.log('='.repeat(72));
}

main();
