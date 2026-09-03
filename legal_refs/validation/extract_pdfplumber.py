#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor for 2-column JO gazette PDFs.

Algerian Journal Officiel (JO) pages use a 2-column snake-flow layout:
  LEFT column  → fills top-to-bottom first
  RIGHT column → fills top-to-bottom second

pdfplumber default reads by y-position (horizontal bands), merging both
columns. Fix: two-pass per page (left then right).

Gazette context:
  JO issues often contain multiple laws. A PDF named 'loi 18-11.pdf' may
  be a full gazette issue where loi 18-11 starts after other laws.
  The preamble strip must find loi 18-11's OWN Article 1er, not the first
  Article 1er in the gazette. Strategy:
    1. Find the law-title anchor line (e.g. 'Loi n° 18-11 du ...')
       by extracting the numeric identifier from the filename
    2. Starting from that anchor, find the next standalone Article 1er header
    3. Slice from Article 1er onward
  Falls back to first-Article-1er if no anchor found.

Usage (PowerShell):
    python legal_refs/validation/extract_pdfplumber.py
    python legal_refs/validation/extract_pdfplumber.py --pdf "Loi 04-20.pdf"
    python legal_refs/validation/extract_pdfplumber.py --all

Dependencies: pip install pdfplumber
Output: legal_refs/pdf/<stem>.txt  (always overwrites)
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

MAX_HEADER_LINE_LEN = 60

# Article-1er header: starts with 'Article 1er/1ier/Premier', short, no citation marker
_ART1ER_START_RE = re.compile(
    r"^\s*Article\s+(?:1(?:er|ier)?|[Pp]remier)\b",
    re.IGNORECASE,
)
_CITATION_AFTER_RE = re.compile(
    r"\b1(?:er|ier)?\s+(?:de\s+la|du|de\s+l['’‘]|al-)",
    re.IGNORECASE,
)

# Any standalone Article-N header (short line starting with Article + digit)
_ANY_ART_HDR_RE = re.compile(r"^\s*Article\s+\d", re.IGNORECASE)


def _is_standalone_art1er(line: str) -> bool:
    s = line.strip()
    if not _ART1ER_START_RE.match(s):
        return False
    if len(s) > MAX_HEADER_LINE_LEN:
        return False
    if _CITATION_AFTER_RE.search(s):
        return False
    return True


def _law_anchor_re(stem: str) -> "re.Pattern | None":
    """
    Build a regex that matches the law-title line in the gazette text.
    Extracts the numeric identifier from the filename stem.
    'loi 18-11' -> r'(?:loi|LOI|Loi)\s+n[o°]\.?\s*18.?11'
    'Loi 01-19'  -> r'(?:loi|LOI|Loi)\s+n[o°]\.?\s*01.?19'
    Returns None if no numeric id found.
    """
    # Find a pattern like '18-11' or '01-19' or '90-11' in the stem
    m = re.search(r"(\d{2,4})[-\s](\d{2,3})", stem)
    if not m:
        return None
    year, num = m.group(1), m.group(2)
    # Build pattern: matches 'Loi n° 18-11' or 'loi no 18 11' etc.
    pat = (
        r"(?:[Ll][Oo][Ii]|[Oo]rdonnance|[Dd]écret)\s+"
        r"n[o°º]\.?\s*"
        + re.escape(year)
        + r"[-\s]"
        + re.escape(num)
        + r"\b"
    )
    return re.compile(pat, re.IGNORECASE)


def _strip_preamble(text: str, pdf_stem: str) -> str:
    """
    Find the law's own Article 1er and slice from there.

    Strategy:
    1. Build a law-anchor regex from the filename (e.g. '18-11').
    2. Search for the anchor in the full text to find the law-title position.
    3. From that position, search for the next standalone Article 1er header.
    4. Slice from that Article 1er line onward.
    Falls back to plain first-Article-1er if anchor not found.
    """
    lines = text.splitlines()
    anchor_re = _law_anchor_re(pdf_stem)

    # Determine the search start line (after law-title anchor if found)
    search_from = 0
    if anchor_re:
        for i, line in enumerate(lines):
            if anchor_re.search(line):
                search_from = i
                break  # use LAST anchor occurrence for safety? No, first is fine.
                # For multi-law gazettes, we want the title of THIS law.
                # If the law is cited in an earlier law's preamble too, we might
                # hit that citation first. Use LAST match to be safe.
        # Actually: use LAST match in case law is cited in its own preamble
        last_anchor = 0
        for i, line in enumerate(lines):
            if anchor_re.search(line):
                last_anchor = i
        search_from = last_anchor

    # From search_from, find the next standalone Article 1er header
    for i in range(search_from, len(lines)):
        if _is_standalone_art1er(lines[i]):
            return "\n".join(lines[i:])

    # Fallback: any short Article-N header after anchor
    for i in range(search_from, len(lines)):
        s = lines[i].strip()
        if _ANY_ART_HDR_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return "\n".join(lines[i:])

    # No article found from anchor: try from beginning
    for i, line in enumerate(lines):
        if _is_standalone_art1er(line):
            return "\n".join(lines[i:])

    return text  # give up, return as-is


def _detect_column_midpoint(page) -> float:
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
    max_gap, mid = 0.0, page.width / 2
    for i in range(1, len(candidates)):
        gap = candidates[i] - candidates[i - 1]
        if gap > max_gap:
            max_gap = gap
            mid = (candidates[i] + candidates[i - 1]) / 2
    if not (w * 0.30 < mid < w * 0.70):
        return page.width / 2
    return mid


def _extract_page_two_pass(page, mid: float) -> str:
    h = page.height
    left = page.crop((0, 0, mid, h))
    right = page.crop((mid, 0, page.width, h))
    left_text = left.extract_text(x_tolerance=3, y_tolerance=3) or ""
    right_text = right.extract_text(x_tolerance=3, y_tolerance=3) or ""
    parts = [p for p in (left_text, right_text) if p.strip()]
    return "\n".join(parts)


def extract_one(pdf_path: Path) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pdfplumber not installed.", file=sys.stderr)
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
        return f"[EXTRACT-ERROR: {pdf_path.name} \u2014 {e}]\n"

    if mid is None:
        return f"[EXTRACT-ERROR: {pdf_path.name} \u2014 could not detect column midpoint]\n"

    raw = "\n".join(text_parts)
    if not raw.strip():
        return f"[SCANNED: {pdf_path.name} \u2014 OCR required]\n"

    return _strip_preamble(raw, pdf_path.stem)


def process(pdf_name: str) -> None:
    p = PDF_DIR / pdf_name
    if not p.exists():
        name_lower = pdf_name.lower()
        matches = [f for f in PDF_DIR.iterdir() if f.name.lower() == name_lower]
        if not matches:
            print(f"[NO-PDF]  {pdf_name} \u2014 not found in {PDF_DIR}")
            return
        p = matches[0]
    text = extract_one(p)
    out = p.with_suffix(".txt")
    out.write_text(text, encoding="utf-8")
    if text.startswith("["):
        print(f"[WARN]    {out.name} \u2014 {text[:80].strip()}")
    else:
        print(f"[OK]      {out.name}  ({len(text):,} chars)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", help="Single PDF filename in legal_refs/pdf/")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    if args.pdf:
        process(args.pdf)
    elif args.all:
        for pdf in sorted(PDF_DIR.glob("*.pdf")):
            process(pdf.name)
    else:
        print("Tier 2 re-extraction \u2014 default targets (use --all for full corpus):")
        for name in DEFAULT_TARGETS:
            process(name)


if __name__ == "__main__":
    main()
