#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor for 2-column JO gazette PDFs.

Algerian Journal Officiel (JO) pages use a 2-column snake-flow layout:
  LEFT column  → fills top-to-bottom first
  RIGHT column → fills top-to-bottom second

pdfplumber default extraction reads by y-position (horizontal bands),
merging both columns into a single stream — producing text like:
  "La présente loi a pour objet de fixer les  artisanales et autres..."
where the end of Art.1 (left col) is merged with mid-body of Art.3 (right col).

Fix: two-pass per page — extract LEFT column first, then RIGHT column,
concatenate with newline. This gives correct snake-flow reading order.
Column midpoint auto-detected from word x-centre gap analysis.

Preamble handling:
  Laws like loi-18-11 have a long preamble that references other laws by
  article number ("notamment ses articles 2 et 3"). The diff script's
  article boundary regex fires on these mid-preamble references, creating
  false article slices. Solution: hard-slice everything before the FIRST
  standalone "Article 1er" line at line start.

Usage (PowerShell):
    python legal_refs/validation/extract_pdfplumber.py
        -> re-extracts the two default targets:
           legal_refs/pdf/Loi 01-19.pdf
           legal_refs/pdf/loi 18-11.pdf

    python legal_refs/validation/extract_pdfplumber.py --pdf "Loi 04-20.pdf"
        -> single file

    python legal_refs/validation/extract_pdfplumber.py --all
        -> re-extracts every PDF in legal_refs/pdf/

Dependencies: pip install pdfplumber  (already satisfied)
Output:       legal_refs/pdf/<stem>.txt  (always overwrites)
"""

import argparse
import re
import sys
from pathlib import Path

PDF_DIR = Path("legal_refs/pdf")

DEFAULT_TARGETS = [
    "Loi 01-19.pdf",
    "loi 18-11.pdf",
]

# Matches a standalone Article 1er / Article 1 / Article Premier header at line start.
# Does NOT match mid-sentence "ses articles 2 et 3" references.
_ART1ER_LINE_RE = re.compile(
    r"^\s*Article\s+(?:1(?:er|ier)?|[Pp]remier)\b",
    re.IGNORECASE,
)


def _detect_column_midpoint(page) -> float:
    """
    Detect the column divider x-coordinate by finding the largest gap
    in the distribution of word x-centres across the middle 20-80% of page width.
    Falls back to page.width / 2.
    """
    try:
        words = page.extract_words(x_tolerance=3, y_tolerance=3)
    except Exception:
        return page.width / 2

    if not words:
        return page.width / 2

    centres = sorted((w["x0"] + w["x1"]) / 2 for w in words)
    if len(centres) < 10:
        return page.width / 2

    w = page.width
    lo, hi = w * 0.20, w * 0.80
    candidates = [c for c in centres if lo < c < hi]
    if not candidates or len(candidates) < 4:
        return page.width / 2

    max_gap = 0.0
    mid = page.width / 2
    for i in range(1, len(candidates)):
        gap = candidates[i] - candidates[i - 1]
        if gap > max_gap:
            max_gap = gap
            mid = (candidates[i] + candidates[i - 1]) / 2

    if not (w * 0.30 < mid < w * 0.70):
        return page.width / 2

    return mid


def _extract_page_two_pass(page, mid: float) -> str:
    """Extract page text in correct snake-flow order: left column then right column."""
    h = page.height
    left = page.crop((0, 0, mid, h))
    right = page.crop((mid, 0, page.width, h))
    left_text = left.extract_text(x_tolerance=3, y_tolerance=3) or ""
    right_text = right.extract_text(x_tolerance=3, y_tolerance=3) or ""
    parts = [p for p in (left_text, right_text) if p.strip()]
    return "\n".join(parts)


def _strip_preamble(text: str) -> str:
    """
    Hard-slice everything before the first standalone 'Article 1er' line.

    The Algerian JO preamble for laws cites other laws by article number
    (e.g. 'notamment ses articles 2, 3 et 4'), which triggers false article
    boundaries in the diff script. Discarding everything before the first
    Article-1er line start is safe: that marker is always the beginning of
    the published law itself.

    If no Article-1er line is found (e.g. a decree that starts with Article 1),
    fall back to discarding lines starting with 'Vu ' before the first
    'Article \d' line start.
    """
    lines = text.splitlines()

    # Pass 1: look for 'Article 1er' / 'Article Premier' at line start
    for i, line in enumerate(lines):
        if _ART1ER_LINE_RE.match(line):
            return "\n".join(lines[i:])

    # Pass 2: fallback — first 'Article \d' at line start
    _any_art = re.compile(r"^\s*Article\s+\d", re.IGNORECASE)
    for i, line in enumerate(lines):
        if _any_art.match(line):
            return "\n".join(lines[i:])

    # No article found — return as-is (don't discard content)
    return text


def extract_one(pdf_path: Path) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)

    text_parts: list[str] = []
    mid: float | None = None

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                if mid is None:
                    words = page.extract_words(x_tolerance=3, y_tolerance=3) or []
                    if len(words) >= 10:
                        mid = _detect_column_midpoint(page)
                    else:
                        continue

                t = _extract_page_two_pass(page, mid)
                if t.strip():
                    text_parts.append(t)
    except Exception as e:
        return f"[EXTRACT-ERROR: {pdf_path.name} — {e}]\n"

    if mid is None:
        return f"[EXTRACT-ERROR: {pdf_path.name} — could not detect column midpoint]\n"

    raw = "\n".join(text_parts)
    if not raw.strip():
        return f"[SCANNED: {pdf_path.name} — OCR required]\n"

    text = _strip_preamble(raw)
    return text


def process(pdf_name: str) -> None:
    p = PDF_DIR / pdf_name
    if not p.exists():
        name_lower = pdf_name.lower()
        matches = [f for f in PDF_DIR.iterdir() if f.name.lower() == name_lower]
        if not matches:
            print(f"[NO-PDF]  {pdf_name} — not found in {PDF_DIR}")
            return
        p = matches[0]

    text = extract_one(p)
    out = p.with_suffix(".txt")
    out.write_text(text, encoding="utf-8")

    if text.startswith("["):
        print(f"[WARN]    {out.name} — {text[:80].strip()}")
    else:
        print(f"[OK]      {out.name}  ({len(text):,} chars)")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Tier 2 two-pass column extractor for JO gazette PDFs."
    )
    parser.add_argument("--pdf", help="Single PDF filename in legal_refs/pdf/")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Re-extract every PDF in legal_refs/pdf/ using pdfplumber",
    )
    args = parser.parse_args()

    if args.pdf:
        process(args.pdf)
    elif args.all:
        pdfs = sorted(PDF_DIR.glob("*.pdf"))
        if not pdfs:
            print(f"No PDFs found in {PDF_DIR}")
            return
        for pdf in pdfs:
            process(pdf.name)
    else:
        print("Tier 2 re-extraction — default targets (use --all for full corpus):")
        for name in DEFAULT_TARGETS:
            process(name)


if __name__ == "__main__":
    main()
