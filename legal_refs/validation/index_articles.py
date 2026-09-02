#!/usr/bin/env python3
"""
index_articles.py — Article boundary extractor for SafeInspect legal_refs MD files.

Formats handled:
  Format A (bold abbrev) : **Art. 12.**  or  **Article 1er.**  or ***Art. 2.***
  Format B (heading)     : ### Article 12  or  ## Article 1er
  Format C (Arabic)      : المادة 12  or  **المادة 12**  or  ### المادة 12

Outputs a dict: {article_number_str: article_text_str}
Article text is the raw MD slice starting at the \n before the marker.

ORDER OF OPERATIONS (critical — do not change):
  1. extract_articles() runs on the WHOLE raw MD file to detect boundaries.
     normalize_md() must NOT run before this step — it would strip the **
     markers that identify Format A boundaries.
  2. After slicing, normalize_text(slice, source='md') is called PER-ARTICLE
     by the diff pipeline (not here). This file only slices; it does not
     normalise. See normalize.py.

Regex fix (2026-09-02, Claude audit):
  Trailing group was (?:[\. \*]|$) — matched exactly ONE character, leaving
  the closing ** of **Art. 2.** as two orphan asterisks at the start of
  every Format A slice. Fixed to (?:[.\s]*\*{0,3}\s*) which greedily
  consumes trailing period, whitespace, and up to three closing asterisks
  (covers **, *** bold+italic, and no-asterisk cases).
"""

import re
import sys
from pathlib import Path
from typing import Dict

# ---------------------------------------------------------------------------
# Regex — matches article boundary lines in all known MD formats.
# Group 1 captures the article number (western digits OR Arabic-Indic digits).
#
# Trailing group (?:[.\s]*\*{0,3}\s*) explanation:
#   [.\s]*   — eat trailing period and any whitespace
#   \*{0,3}  — eat up to 3 closing asterisks (**, ***, or none)
#   \s*      — eat any trailing whitespace after asterisks
# This ensures m.end() lands after the full closing bold/italic sequence.
# ---------------------------------------------------------------------------
ARTICLE_BOUNDARY_RE = re.compile(
    r"(?:^|\n)\s*"
    r"(?:\*{1,3}|#{2,3}\s*)?"   # optional bold/bold+italic OR heading ## / ###
    r"\s*"
    r"(?:المادة|Article|Art\.)"
    r"\s*[:\-]?\s*"
    r"([\d\u0660-\u0669]+)"      # western digits OR Arabic-Indic ٠-٩
    r"(?:er|\u00e8re|re)?"       # optional ordinal suffix (1er, 1ère)
    r"(?:[.\s]*\*{0,3}\s*)",    # consume trailing . + up to 3 closing asterisks
    re.MULTILINE,
)


def extract_articles(md_text: str) -> Dict[str, str]:
    """
    Split md_text on every article boundary and return a mapping of
    normalised article number → raw MD slice of that article.

    Slices start at m.start() (the \n before the marker) so the boundary
    line itself is included in the article text. The diff pipeline strips
    it via normalize_md() called per-article — not here.

    Numbers are normalised to western digits (Arabic-Indic ٢ → '2').
    """
    boundaries = []
    for m in ARTICLE_BOUNDARY_RE.finditer(md_text):
        raw_num = m.group(1)
        western_num = _arabic_indic_to_western(raw_num)
        boundaries.append((m.start(), western_num))

    if not boundaries:
        return {}

    articles: Dict[str, str] = {}
    for i, (start, num) in enumerate(boundaries):
        end = boundaries[i + 1][0] if i + 1 < len(boundaries) else len(md_text)
        articles[num] = md_text[start:end]

    return articles


def _arabic_indic_to_western(s: str) -> str:
    """Convert Arabic-Indic digit characters (U+0660–U+0669) to ASCII digits."""
    table = str.maketrans('\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669',
                          '0123456789')
    return s.translate(table)


def load_file(path: str) -> Dict[str, str]:
    """Convenience helper: read a file and return extract_articles() result."""
    text = Path(path).read_text(encoding='utf-8')
    return extract_articles(text)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python index_articles.py <path/to/file.md>')
        sys.exit(1)

    from normalize import normalize_text

    result = load_file(sys.argv[1])
    print(f'Found {len(result)} articles.')
    print()

    # Visual confirmation check: print raw + normalised first 80 chars
    # for articles 1 and 2. Both must be free of leading **, ##, or stray .
    # before Phase 2 is declared open.
    for check_num in ['1', '2']:
        if check_num in result:
            raw_slice = result[check_num]
            norm_slice = normalize_text(raw_slice, source='md')
            raw_preview  = raw_slice[:80].replace('\n', '↵')
            norm_preview = norm_slice[:80].replace('\n', '↵')
            print(f'Art.{check_num} RAW  [{len(raw_slice):>6} chars]: {raw_preview!r}')
            print(f'Art.{check_num} NORM [{len(norm_slice):>6} chars]: {norm_preview!r}')
            print()
        else:
            print(f'Art.{check_num}: NOT FOUND in this file')
            print()
