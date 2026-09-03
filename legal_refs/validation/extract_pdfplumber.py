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
  These pages must emit RIGHT then LEFT.

Detection: right column contains a line matching:
  ^(Article|Art.) 1er[.]? [em-dash|en-dash|-]  (confirmed by hex dump: U+2014)
  and the line does NOT start with 'Chapitre'.

Column midpoint: always page.width/2.
  JO gazettes are symmetric A4 two-column layouts.
  The gap-detector approach corrupts on gazette headers that span both columns.

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

# Matches the first article header of a law in JO gazette format.
# The em-dash (U+2014) after 'Article 1er.' is mandatory in JO format.
# Confirmed by hex dump: 0x2014. Also accepts en-dash and ASCII hyphen.
# Negative lookahead excludes 'Chapitre 1er' chapter headings.
_LAW_START_RE = re.compile(
    r"^(?!Chapitre)(?:Article|Art[.])\s+1(?:er|ier)?[.]?\s+[—–-]",
    re.IGNORECASE,
)

# Any article header for preamble-strip fallback
_ANY_ART_HDR_RE = re.compile(r"^(?:Article|Art[.])\s+\d", re.IGNORECASE)


def _is_law_start(text: str) -> bool:
    for line in text.splitlines():
        s = line.strip()
        if _LAW_START_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return True
    return False


def _strip_preamble(text: str) -> str:
    lines = text.splitlines()
    for i, line in enumerate(lines):
        s = line.strip()
        if _LAW_START_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return "\n".join(lines[i:])
    for i, line in enumerate(lines):
        s = line.strip()
        if _ANY_ART_HDR_RE.match(s) and len(s) <= MAX_HEADER_LINE_LEN:
            return "\n".join(lines[i:])
    return text


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
    law_started = False

    try:
        with pdfplumber.open(pdf_path) as pdf:
            if not pdf.pages:
                return f"[EXTRACT-ERROR: {pdf_path.name} — no pages]\n"

            # Use page.width/2 — JO gazette is symmetric A4 two-column layout.
            # The gap-detector corrupts on multi-column gazette headers.
            mid = pdf.pages[0].width / 2

            for page in pdf.pages:
                if law_started:
                    t = _extract_page(page, mid, right_first=False)
                else:
                    h = page.height
                    right_text = (
                        page.crop((mid, 0, page.width, h))
                            .extract_text(x_tolerance=3, y_tolerance=3) or ""
                    )
                    if _is_law_start(right_text):
                        # Transition page: RIGHT (law body) before LEFT (preamble)
                        t = _extract_page(page, mid, right_first=True)
                        law_started = True
                    else:
                        # Gazette header / summary — skip
                        continue

                if t.strip():
                    text_parts.append(t)

    except Exception as e:
        return f"[EXTRACT-ERROR: {pdf_path.name} — {e}]\n"

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
