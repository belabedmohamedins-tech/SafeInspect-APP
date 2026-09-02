#!/usr/bin/env python3
"""
index_articles.py — W97-P1
Parse a legal_refs/*.md file and emit a JSON index of articles.

Supports format families:
  Family A: "## Article N" or "## Art. N"
  Family B: "**Article N**" or "**Art. N**" (inline bold)
  Family C: "Art. N. —" / "Art. N —" (JORADP plain-text, most common in repo)
             Also handles "Article ler" / "Art. 1er" / "Aït." OCR artefact.

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

# Family A: heading-level  (## Article 1 — Title)
HEADING_ART = re.compile(
    r'^#{1,4}\s+(?:Article|Art\.?)\s+(\d+(?:\s*(?:bis|ter|quater|ler|er))?)',
    re.IGNORECASE
)

# Family B: bold-inline  (**Article 1** — Title)
INLINE_ART = re.compile(
    r'^\*{1,2}(?:Article|Art\.?)\s+(\d+(?:\s*(?:bis|ter|quater|ler|er))?)\*{1,2}',
    re.IGNORECASE
)

# Family C: JORADP plain-text  "Art. 2. —"  "Art 3 —"  "Article ler. —"
# Also catches OCR artefact "Aït." as alias for "Art."
PLAIN_ART = re.compile(
    r'^(?:Article|Art(?:icle)?\.?|A[i\xef]t\.?)\s+'
    r'(\d+(?:\s*(?:bis|ter|quater))?|ler|1er)'
    r'(?:\s*\.)?'
    r'\s*(?:\u2014|-{1,2}|:)',
    re.IGNORECASE
)


def _norm_num(n: str) -> str:
    n = n.strip()
    if n.lower() in ('ler', '1er'):
        return '1'
    return n


def _title_from_line(line: str, raw_num: str) -> str:
    cleaned = re.sub(
        r'^[#*\s]*(?:Article|Art(?:icle)?\.?|A[i\xef]t\.?)\s+'
        + re.escape(raw_num)
        + r'(?:\s*\.)?\s*(?:\u2014|-{1,2}|:)?\s*',
        '', line, flags=re.IGNORECASE
    ).strip('* \t')
    return cleaned or ''


def _match_article(line: str):
    """Return (normalised_num, title) if line starts an article, else None."""
    for pat in (HEADING_ART, INLINE_ART, PLAIN_ART):
        m = pat.match(line)
        if m:
            raw = m.group(1).strip()
            num = _norm_num(raw)
            title = _title_from_line(line, raw)
            return num, title
    return None


def parse(path: Path) -> list[dict]:
    lines = path.read_text(encoding='utf-8').splitlines()

    articles: list[dict] = []
    current: dict | None = None
    body_lines: list[str] = []

    def flush():
        if current is not None:
            current['text'] = '\n'.join(body_lines).strip()
            articles.append(current)

    for line in lines:
        result = _match_article(line)
        if result:
            flush()
            num, title = result
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
        print(f'Written {len(articles)} articles -> {args.out}')
    else:
        print(output)
        print(f'\n# {len(articles)} articles indexed from {path.name}', file=sys.stderr)


if __name__ == '__main__':
    main()
