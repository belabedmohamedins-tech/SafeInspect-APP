#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor for 2-column JO gazette PDFs.

Algerian Journal Officiel (JO) pages use a 2-column snake-flow layout:
  LEFT column  → fills top-to-bottom first
  RIGHT column → fills top-to-bottom second

pdfplumber default extraction reads by y-position (horizontal bands),
merging both columns into a single stream. Fix: two-pass per page —
extract LEFT column first, then RIGHT column, concatenate.

Preamble strip:
  Hard-slice everything before the first STANDALONE 'Article 1er' header.
  A standalone header is:
    - Short line (≤ 60 chars)
    - Starts with 'Article 1er' / 'Article 1ier' / 'Article Premier'
    - NOT followed by citation markers ('de la loi', 'du décret', etc.)

Usage (PowerShell):
    python legal_refs/validation/extract_pdfplumber.py
    python legal_refs/validation/extract_pdfplumber.py --pdf "Loi 04-20.pdf"
    python legal_refs/validation/extract_pdfplumber.py --all

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

# Matches the START of a standalone Article-1er header line.
_ART1ER_START_RE = re.compile(
    r"^\s*Article\s+(?:1(?:er|ier)?|[Pp]remier)\b",
    re.IGNORECASE,
)

# Citation markers that appear immediately after '1er' in preamble references:
# e.g. 'Article 1er de la loi n° ...', 'Article 1er du décret ...'
_CITATION_AFTER_RE = re.compile(
    r"\b1(?:er|ier)?\s+(?:de\s+la|du|de\s+l['’]|de\s+l’|al-)",
    re.IGNORECASE,
)

MAX_HEADER_LINE_LEN = 60  # standalone headers are short


def _is_standalone_art1er(line: str) -> bool:
    """
    Return True only if this line is a standalone Article-1er section header,
    not a mid-sentence citation to another law's article 1er.
    """
    stripped = line.strip()
    if not _ART1ER_START_RE.match(stripped):
        return False
    if len(stripped) > MAX_HEADER_LINE_LEN:
        return False
    if _CITATION_AFTER_RE.search(stripped):
        return False
    return True


def _detect_column_midpoint(page) -> float:
    """Detect column divider x by finding largest word-centre gap in middle 20-80% of page."""
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
    """Extract page in snake-flow order: left column then right column."""
    h = page.height
    left = page.crop((0, 0, mid, h))
    right = page.crop((mid, 0, page.width, h))
    left_text = left.extract_text(x_tolerance=3, y_tolerance=3) or ""
    right_text = right.extract_text(x_tolerance=3, y_tolerance=3) or ""
    parts = [p for p in (left_text, right_text) if p.strip()]
    return "\n".join(parts)


def _strip_preamble(text: str) -> str:
    """
    Hard-slice everything before the first STANDALONE 'Article 1er' header.

    Falls back to first '^Article [digit]' at line start if no Article-1er
    standalone header is found (handles decrees that start with Article 1).
    """
    lines = text.splitlines()

    # Pass 1: standalone Article 1er header
    for i, line in enumerate(lines):
        if _is_standalone_art1er(line):
            return "\n".join(lines[i:])

    # Pass 2: fallback — any short Article-N header at line start
    _any_art = re.compile(r"^\s*Article\s+\d", re.IGNORECASE)
    for i, line in enumerate(lines):
        stripped = line.strip()
        if _any_art.match(stripped) and len(stripped) <= MAX_HEADER_LINE_LEN:
            return "\n".join(lines[i:])

    # No article found — return as-is
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

    return _strip_preamble(raw)


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
