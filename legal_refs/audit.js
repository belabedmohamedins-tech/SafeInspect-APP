#!/usr/bin/env node
/**
 * legal_refs/audit.js
 * Audits all .md files in this directory for article coverage.
 *
 * Usage:  node legal_refs/audit.js
 * NOTE:   Always run `git pull` before running to get the latest version.
 *
 * Strategy (per line):
 *   1. If line STARTS with an article declaration (**Art. N.** etc.):
 *      → capture ONLY the declared number (first match). Stop scanning that line.
 *      This prevents picking up inline cross-ref numbers like
 *      "**Art. 68.** — ... (article 429 du code pénal)".
 *   2. If line does NOT start with an article declaration:
 *      → apply cross-ref filter. If it’s a cross-reference, skip entirely.
 *      Otherwise scan full line (catches non-header article mentions if any).
 */

const fs   = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname);

// Captures the declared article number at the START of a line.
// Group 1 = the number.
const ARTICLE_START_RE = /^[\s#*>|]*\*{0,2}art(?:icle)?s?[.:\s]\s*(\d+)/im;

// Full-line scanner (used for non-header lines only).
const ARTICLE_RE = /\*{0,2}art(?:icle)?s?[.:]?\s*(\d+)/gim;

// Cross-reference patterns — only applied to non-header lines.
const CROSS_REF_PATTERNS = [
  /code\s+pénal/i,
  /code\s+de\s+procédure/i,
  /code\s+civil/i,
  /code\s+du\s+travail/i,
  /code\s+de\s+commerce/i,
  /\(article\s+\d+\s+du\s+code/i,
  /article\s+\d+\s+(?:et\s+suivants\s+)?du\s+code/i,
];

function isCrossRefOnly(line) {
  return CROSS_REF_PATTERNS.some(p => p.test(line));
}

const MANQUANT_RE  = /\[MANQUANT/gi;
const AVERIFIER_RE = /\[À VÉRIFIER/gi;

function auditFile(filePath) {
  const content  = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const lines    = content.split('\n');

  const numbers = new Set();

  for (const line of lines) {
    const startMatch = ARTICLE_START_RE.exec(line);
    if (startMatch) {
      // Line is an article declaration — take ONLY the declared number.
      numbers.add(parseInt(startMatch[1], 10));
      continue; // do not scan rest of line for more numbers
    }
    // Not an article-start line.
    if (isCrossRefOnly(line)) continue;
    // Scan body line for any article references.
    let match;
    ARTICLE_RE.lastIndex = 0;
    while ((match = ARTICLE_RE.exec(line)) !== null) {
      numbers.add(parseInt(match[1], 10));
    }
  }

  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const max    = sorted.length ? sorted[sorted.length - 1] : 0;

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

function gapNote(filename, gaps) {
  if (filename.includes('decret-06-198') && gaps.some(g => g >= 51))
    return ' (gaps likely = Annexes, not numbered articles)';
  if (filename.includes('decret-09-19') && gaps.some(g => g >= 18))
    return ' (gap expected: Art.85 = final abrogation clause)';
  if (filename.includes('loi-19-02') && gaps.some(g => g >= 43))
    return ' (partial file — only key articles extracted)';
  if (filename.includes('loi-01-19') && gaps.some(g => g >= 73))
    return ' (partial file — only key articles extracted)';
  return '';
}

function main() {
  const files = fs.readdirSync(DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();

  let totalManquant = 0;
  let totalAverifie = 0;
  let filesWithGaps = 0;

  console.log('='.repeat(72));
  console.log('SafeInspect legal_refs — Article Coverage Audit');
  console.log('='.repeat(72));
  console.log();

  for (const file of files) {
    const r = auditFile(path.join(DIR, file));
    totalManquant += r.manquantCount;
    totalAverifie += r.averifierCount;
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
      const note = gapNote(r.filename, r.gaps);
      console.log(`   ⚠ Gaps     : ${r.gaps.slice(0, 20).join(', ')}${r.gaps.length > 20 ? ` … (${r.gaps.length} total)` : ''}${note}`);
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
