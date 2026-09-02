#!/usr/bin/env python3
"""
index_articles.py — Article boundary extractor for SafeInspect legal_refs MD files.

Formats handled:
  Format A (bold abbrev) : **Art. 12.**  or  **Article 1er.**
  Format B (heading)     : ### Article 12  or  ## Article 1er
  Format C (Arabic)      : المادة 12  or  **المادة 12**  or  ### المادة 12

Outputs a dict: {article_number_str: article_text_str}
Article text is the raw MD slice — caller is responsible for normalization via normalize.py.

NOTE: All three formats are compiled into a single ARTICLE_BOUNDARY_RE so that
mixed files (bilingual Arabic/French) are handled in one pass.
"""

import re
import sys
from pathlib import Path
from typing import Dict

# ---------------------------------------------------------------------------
# Regex — matches article boundary lines in all known MD formats
# Group 1 captures the article number (western digits OR Arabic-Indic digits)
# ---------------------------------------------------------------------------
ARTICLE_BOUNDARY_RE = re.compile(
    r"(?:^|\n)\s*"
    r"(?:\*\*|#{2,3}\s*)?"     # optional bold marker OR heading (## or ###)
    r"\s*"
    r"(?:المادة|Article|Art\.)"
    r"\s*[:\-]?\s*"
    r"([\d٠-٩]+)"              # arabic-indic digits: ٠١٢٣٤٥٦٧٨٩
    r"(?:er|ère|re)?"           # optional ordinal suffix (1er, 1ère)
    r"(?:[\. \*]|$)",          # followed by dot, space, closing **, or EOL
    re.MULTILINE,
)


def extract_articles(md_text: str) -> Dict[str, str]:
    """
    Split md_text on every article boundary and return a mapping of
    normalised article number → raw MD text of that article.

    Numbers are normalised to western digits so Arabic-Indic ٢ becomes '2'.
    """
    # Collect all boundary positions and their article numbers
    boundaries = []
    for m in ARTICLE_BOUNDARY_RE.finditer(md_text):
        raw_num = m.group(1)
        western_num = _arabic_indic_to_western(raw_num)
        # start of match (include the newline so boundary char is kept)
        boundaries.append((m.start(), western_num, m.group(0)))

    if not boundaries:
        return {}

    articles: Dict[str, str] = {}
    for i, (start, num, header) in enumerate(boundaries):
        end = boundaries[i + 1][0] if i + 1 < len(boundaries) else len(md_text)
        articles[num] = md_text[start:end]

    return articles


def _arabic_indic_to_western(s: str) -> str:
    """Convert Arabic-Indic digit characters (\u0660-\u0669) to ASCII digits."""
    table = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')
    return s.translate(table)


def load_file(path: str) -> Dict[str, str]:
    """Convenience helper: read a file and return extract_articles() result."""
    text = Path(path).read_text(encoding='utf-8')
    return extract_articles(text)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python index_articles.py <path/to/file.md>')
        sys.exit(1)
    result = load_file(sys.argv[1])
    print(f'Found {len(result)} articles.')
    for num in sorted(result, key=lambda x: int(x) if x.isdigit() else 0):
        snippet = result[num][:80].replace('\n', ' ')
        print(f'  Art.{num}: {snippet}...')
