#!/usr/bin/env python3
"""
normalize.py — W97-P2
Normalise a legal_refs/*.md file:
  - Fix encoding artefacts (common OCR substitutions)
  - Normalise Arabic punctuation and whitespace
  - Strip BOM, CRLF → LF
  - Report lines that look like OCR gaps (blanks where numbers should be)

Usage:
  python tools/normalize.py legal_refs/some-law.md          # dry-run, report only
  python tools/normalize.py legal_refs/some-law.md --fix    # write in-place
  python tools/normalize.py legal_refs/some-law.md --fix --out out.md  # write to new file
"""

import re
import sys
import argparse
from pathlib import Path

# ── Substitution table ──────────────────────────────────────────────────────
# (pattern, replacement) — applied in order
SUBSTITUTIONS = [
    # BOM
    (r'^\ufeff', ''),
    # Windows line endings
    (r'\r\n', '\n'),
    (r'\r', '\n'),
    # Common OCR Arabic substitutions
    (r'ﻻ', 'لا'),
    (r'ﻷ', 'لأ'),
    (r'ﻹ', 'لإ'),
    (r'ﻵ', 'لآ'),
    # Ligature alef forms
    (r'\u0622', 'آ'),  # alef with madda — keep as-is but unify
    # Tatweel (kashida) sometimes inserted by OCR
    (r'\u0640+', ''),
    # Zero-width non-joiner / joiner noise
    (r'[\u200c\u200d]', ''),
    # Trailing whitespace on each line
    (r'[ \t]+$', ''),
    # Multiple consecutive blank lines → single blank line
    (r'\n{3,}', '\n\n'),
]

# ── Gap detector ────────────────────────────────────────────────────────────
# Lines that look like a table row with a blank where a number should be
GAP_PATTERN = re.compile(
    r'\|[^|]*\|\s*\|',   # two consecutive pipe-separated cells where one is empty
)
NUMERIC_BLANK = re.compile(
    r'(mg/[lL]|µg/[lL]|UFC|NTU|pH|°C|mg/kg)\s*\|\s*\|'
)


def detect_gaps(text: str) -> list[tuple[int, str]]:
    """Return (line_number, line) for lines that look like OCR numeric gaps."""
    gaps = []
    for i, line in enumerate(text.splitlines(), 1):
        if NUMERIC_BLANK.search(line) or (GAP_PATTERN.search(line) and '|' in line):
            gaps.append((i, line))
    return gaps


def normalize(text: str) -> str:
    for pattern, replacement in SUBSTITUTIONS:
        text = re.sub(pattern, replacement, text, flags=re.MULTILINE)
    return text


def main():
    ap = argparse.ArgumentParser(description='Normalise a legal_refs MD file')
    ap.add_argument('input', help='Path to the .md file')
    ap.add_argument('--fix', action='store_true', help='Apply fixes (default: dry-run only)')
    ap.add_argument('--out', help='Output path (default: overwrite input when --fix)')
    args = ap.parse_args()

    path = Path(args.input)
    if not path.exists():
        print(f'ERROR: file not found: {path}', file=sys.stderr)
        sys.exit(1)

    original = path.read_text(encoding='utf-8')
    fixed = normalize(original)
    gaps = detect_gaps(fixed)

    if gaps:
        print(f'⚠️  OCR GAPS detected in {path.name}:')
        for lineno, line in gaps:
            print(f'  L{lineno}: {line.strip()}')
    else:
        print(f'✅  No OCR gaps detected in {path.name}')

    if original != fixed:
        diff_count = sum(1 for a, b in zip(original.splitlines(), fixed.splitlines()) if a != b)
        print(f'   {diff_count} lines changed by normalisation')
    else:
        print(f'   No normalisation changes needed')

    if args.fix:
        out_path = Path(args.out) if args.out else path
        out_path.write_text(fixed, encoding='utf-8')
        print(f'   Written → {out_path}')


if __name__ == '__main__':
    main()
