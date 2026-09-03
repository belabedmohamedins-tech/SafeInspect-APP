#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor for 2-column JO gazette PDFs.

Algerian Journal Officiel (JO) pages use a 2-column snake-flow layout:
  LEFT column  → fills top-to-bottom first
  RIGHT column → fills top-to-bottom second

Standard pages: LEFT then RIGHT.

Exception — preamble/transition page (e.g. loi 18-11.pdf page 4):
  LEFT  = presidential preamble (Vu la loi n°...)
  RIGHT = law body starting with Article 1er. — ...

For these pages RIGHT must be emitted before LEFT.
Detection: right column contains a line matching:
  ^(Article|Art[.]) 1er[.]? \u2014  (em-dash U+2014, mandatory in JO format)
  and the line does NOT start with 'Chapitre'.

Article notation confirmed from loi 18-11 hex dump:
  'Article 1er. \u2014 La présente loi...'
  chars: 0x41 0x72 0x74 0x69 0x63 0x6c 0x65 0x20 0x31 0x65 0x72 0x2e 0x20 0x2014

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

MAX_HEADER_LINE_LEN = 80

# Matches the FIRST article header of a law in JO gazette format:
#   'Article 1er. — '  or  'Art. 1er. — '  or  'Article 1er — '
# The em-dash (U+2014) is the mandatory JO separator — confirmed by hex dump.
# Also accepts en-dash (U+2013) and ASCII hyphen as fallback.
# Line must NOT start with 'Chapitre' (chapter heading also uses '1er').
_LAW_START_RE = re.compile(
    r"^(?!Chapitre)(?:Article|Art[.])\s+1(?:er|ier)?[.]?\s+[\u2014\u2013-]",
    re.IGNORECASE,
)

# Matches any article header: 'Article N' or 'Art. N' — for preamble strip fallback
_ANY_ART_HDR_RE = re.compile(r"^(?:Article|Art[.])\s+\d", re.IGNORECASE)


def _is_law_start(text: str) -> bool:
    """Return True if text contains a standalone Article 1er — header."""
    for line in text.splitlines():
        s = line.strip()
        if _LAW_START_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return True
    return False


def _strip_preamble(text: str) -> str:
    """Slice text from the first Article 1er — header onward."""
    lines = text.splitlines()
    for i, line in enumerate(lines):
        s = line.strip()
        if _LAW_START_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return "\n".join(lines[i:])
    # Fallback: any short article header
    for i, line in enumerate(lines):
        s = line.strip()
        if _ANY_ART_HDR_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return "\n".join(lines[i:])
    return text


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


def _extract_page(page, mid: float, right_first: bool = False) -> str:
    h = page.height
    left  = page.crop((0,   0, mid,        h)).extract_text(x_tolerance=3, y_tolerance=3) or ""
    right = page.crop((mid, 0, page.width, h)).extract_text(x_tolerance=3, y_tolerance=3) or ""
    if right_first:
        parts = [p for p in (right, left) if p.strip()]
    else:
        parts = [p for p in (left, right) if p.strip()]
    return "\n".join(parts)


def extract_one(pdf_path: Path) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pdfplumber not installed.", file=sys.stderr)
        sys.exit(1)

    text_parts: list[str] = []
    mid: float | None = None
    law_started = False

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                if mid is None:
                    words = page.extract_words(x_tolerance=3, y_tolerance=3) or []
                    if len(words) >= 10:
                        mid = _detect_column_midpoint(page)
                    else:
                        continue

                if law_started:
                    t = _extract_page(page, mid, right_first=False)
                else:
                    h = page.height
                    right_text = (
                        page.crop((mid, 0, page.width, h))
                            .extract_text(x_tolerance=3, y_tolerance=3) or ""
                    )
                    if _is_law_start(right_text):
                        # Transition page: emit RIGHT (law body) then LEFT (preamble)
                        t = _extract_page(page, mid, right_first=True)
                        law_started = True
                    else:
                        # Still in gazette header/summary — skip
                        continue

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
        print("Tier 2 re-extraction — default targets (use --all for full corpus):")
        for name in DEFAULT_TARGETS:
            process(name)


if __name__ == "__main__":
    main()
