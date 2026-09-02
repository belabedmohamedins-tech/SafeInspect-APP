#!/usr/bin/env python3
"""
index_articles.py — W97-P1
Parse a legal_refs/*.md file and emit a JSON index of articles.

Supports two format families:
  Family A: "## Article N" or "## Art. N"
  Family B: "**Article N**" or "**Art. N**" (inline bold, no heading)

Output (stdout): JSON array of {"article": "N", "title": "...", "text": "..."}
Usage:
  python tools/index_articles.py legal_refs/some-law.md
  python tools/index_articles.py legal_refs/some-law.md --out index.json
"""

import re
import sys
import json
import argparse
from pathlib import Path

# ── Patterns ────────────────────────────────────────────────────────────────
# Family A: heading-level articles  (## Article 1 — Title)
HEADING_ART = re.compile(
    r'^#{1,4}\s+(?:Article|Art\.?)\s+(\d+(?:\s*(?:bis|ter|quater))?)',
    re.IGNORECASE
)

# Family B: bold-inline articles  (**Article 1** — Title)
INLINE_ART = re.compile(
    r'^\*{1,2}(?:Article|Art\.?)\s+(\d+(?:\s*(?:bis|ter|quater))?)\*{1,2}',
    re.IGNORECASE
)


def _title_from_line(line: str, num: str) -> str:
    """Extract optional title fragment after the article number."""
    # Strip leading hashes, stars, article keyword + number
    cleaned = re.sub(
        r'^[#*\s]*(?:Article|Art\.?)\s+' + re.escape(num) + r'\s*[:\-–—]?\s*',
        '', line, flags=re.IGNORECASE
    ).strip('* \t')
    return cleaned or ''


def parse(path: Path) -> list[dict]:
    lines = path.read_text(encoding='utf-8').splitlines()

    articles = []
    current: dict | None = None
    body_lines: list[str] = []

    def flush():
        if current is not None:
            current['text'] = '\n'.join(body_lines).strip()
            articles.append(current)

    for line in lines:
        m = HEADING_ART.match(line) or INLINE_ART.match(line)
        if m:
            flush()
            num = m.group(1).strip()
            title = _title_from_line(line, num)
            current = {'article': num, 'title': title}
            body_lines = []
        else:
            if current is not None:
                body_lines.append(line)

    flush()
    return articles


def main():
    ap = argparse.ArgumentParser(description='Index articles from a legal_refs MD file')
    ap.add_argument('input', help='Path to the .md file')
    ap.add_argument('--out', help='Write JSON to this file instead of stdout')
    args = ap.parse_args()

    path = Path(args.input)
    if not path.exists():
        print(f'ERROR: file not found: {path}', file=sys.stderr)
        sys.exit(1)

    articles = parse(path)
    output = json.dumps(articles, ensure_ascii=False, indent=2)

    if args.out:
        Path(args.out).write_text(output, encoding='utf-8')
        print(f'Written {len(articles)} articles → {args.out}')
    else:
        print(output)
        print(f'\n# {len(articles)} articles indexed from {path.name}', file=sys.stderr)


if __name__ == '__main__':
    main()
