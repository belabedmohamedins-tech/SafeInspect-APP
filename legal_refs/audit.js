#!/usr/bin/env node
/**
 * legal_refs/audit.js
 * Audits all .md files in this directory for article coverage.
 *
 * Usage:  node legal_refs/audit.js
 * NOTE:   Always run `git pull` before running to get the latest version.
 *
 * Per-line strategy:
 *   1. Test whether line starts with an article declaration.
 *      If yes:
 *        a. Capture ONLY the declared number from the leading match.
 *        b. Take the remainder of the line (after the match).
 *        c. If the remainder contains a cross-ref pattern, discard it.
 *        d. Otherwise scan the remainder for additional article numbers.
 *      This prevents "**Art. 68.** — ... (article 429 du code pénal)"
 *      from producing [68, 429] — it produces only [68].
 *   2. If line does NOT start with an article declaration:
 *      Apply cross-ref filter to the whole line. Skip if matched.
 *      Otherwise scan full line.
 */

const fs   = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname);

/**
 * Matches an article declaration at or near the START of a line.
 * Captures (group 1) = the declared article number.
 * Returns the match object so we know where it ends (match.index + match[0].length).
 */
const ARTICLE_START_RE = /^[\s#*>|]*\*{0,2}art(?:icle)?s?[.:\s]\s*(\d+)/im;

/** Full-line article scanner (used for non-header lines and header remainders). */
const ARTICLE_RE = /\*{0,2}art(?:icle)?s?[.:]?\s*(\d+)/gim;

/** Cross-reference patterns — applied to non-header lines and article-header remainders. */
const CROSS_REF_PATTERNS = [
  /code\s+pénal/i,
  /code\s+de\s+procédure/i,
  /code\s+civil/i,
  /code\s+du\s+travail/i,
  /code\s+de\s+commerce/i,
  /\(article\s+\d+\s+du\s+code/i,
  /article\s+\d+\s+(?:et\s+suivants\s+)?du\s+code/i,
];

function isCrossRef(text) {
  return CROSS_REF_PATTERNS.some(p => p.test(text));
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
      // Step 1a: capture the declared number only.
      numbers.add(parseInt(startMatch[1], 10));

      // Step 1b: isolate the remainder after the header portion.
      const remainder = line.slice(startMatch.index + startMatch[0].length);

      // Step 1c: skip remainder if it's a cross-reference.
      if (isCrossRef(remainder)) continue;

      // Step 1d: scan remainder for additional article references (e.g. "voir aussi Art. 12").
      let m;
      ARTICLE_RE.lastIndex = 0;
      while ((m = ARTICLE_RE.exec(remainder)) !== null) {
        numbers.add(parseInt(m[1], 10));
      }
      continue;
    }

    // Step 2: non-header line — apply cross-ref filter to the whole line.
    if (isCrossRef(line)) continue;

    let m;
    ARTICLE_RE.lastIndex = 0;
    while ((m = ARTICLE_RE.exec(line)) !== null) {
      numbers.add(parseInt(m[1], 10));
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

function gapNote() {
  // No hardcoded per-file exceptions. Every gap must be investigated
  // fresh each run — a note here previously asserted a gap was
  // "expected" without re-checking, which goes stale silently
  // (e.g. loi-01-19 was fixed to zero gaps, but the note remained,
  // ready to mislabel a *real* future gap as benign).
  // If a gap is confirmed benign by a human, log it in that file's
  // own header/README row — not in this script.
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
      const note = gapNote();
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
