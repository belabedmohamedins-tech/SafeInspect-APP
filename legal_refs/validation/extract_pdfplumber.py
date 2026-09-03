#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor for bilingual JO gazette PDFs.

Algerian Journal Officiel (JO) pages are bilingual two-column:
  LEFT half  = French text
  RIGHT half = Arabic text (right-to-left)

Default pdfminer/pdfplumber full-page extraction interleaves both languages
by y-position, producing garbage article bodies. This script:
  1. Crops each page to the French half only (auto-detected by Arabic char density)
  2. Strips the preamble block ("Vu la loi...") before Article 1er
  3. Writes clean French-only text to <stem>.txt for the diff pipeline

Usage (PowerShell):
    python legal_refs/validation/extract_pdfplumber.py
        -> re-extracts the two known failing files:
           legal_refs/pdf/Loi 01-19.pdf
           legal_refs/pdf/loi 18-11.pdf

    python legal_refs/validation/extract_pdfplumber.py --pdf "Loi 04-20.pdf"
        -> single file

    python legal_refs/validation/extract_pdfplumber.py --all
        -> re-extracts every PDF in legal_refs/pdf/

Dependencies:
    pip install pdfplumber   (already satisfied)

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

# Arabic Unicode block: U+0600–U+06FF
_ARABIC_RE = re.compile(r"[\u0600-\u06ff]")

# Preamble line patterns (French gazette): lines to strip before Article 1er
_PREAMBLE_LINE_RE = re.compile(
    r"^(Vu\s|Le\s[Pp]résident|Le\s[Pp]remier\s[Mm]inistre|Sur\s|Considérant|"
    r"Délibérant|Promulguée|JORA|Journal\sOfficiel|République\sAlgérienne)",
    re.MULTILINE,
)


def _arabic_density(text: str) -> float:
    """Return fraction of characters that are Arabic Unicode."""
    if not text:
        return 0.0
    return len(_ARABIC_RE.findall(text)) / len(text)


def _detect_french_bbox(page) -> tuple[float, float, float, float]:
    """
    Sample both halves of the page and return the bbox for the French half.
    French half = lower Arabic character density.
    Falls back to left half (0, 0, width/2, height) if both halves are similar.
    """
    w, h = page.width, page.height
    half = w / 2

    left_crop = page.crop((0, 0, half, h))
    right_crop = page.crop((half, 0, w, h))

    left_text = left_crop.extract_text(x_tolerance=3, y_tolerance=3) or ""
    right_text = right_crop.extract_text(x_tolerance=3, y_tolerance=3) or ""

    left_arabic = _arabic_density(left_text)
    right_arabic = _arabic_density(right_text)

    # French side = whichever half has less Arabic
    if right_arabic < left_arabic:
        # French is on the RIGHT half
        return (half, 0, w, h)
    else:
        # French is on the LEFT half (standard DZ JO)
        return (0, 0, half, h)


def _strip_preamble(text: str) -> str:
    """
    Remove preamble lines before the first article marker.
    Preamble = 'Vu la loi...', 'Le President...', 'Sur rapport...', etc.
    Find the first 'Article' (or 'Art.') line and slice from there.
    If no article marker found, return text as-is (don't discard content).
    """
    # Find position of first article header
    m = re.search(
        r"(?mi)^[Aa]rt(?:icle[r]?)?\s*\.?\s*\d",
        text,
    )
    if m and m.start() > 0:
        # Keep a small window before the first article for context (decree header)
        # but drop clear preamble-only leading content
        preamble_candidate = text[: m.start()]
        # Only strip if the preamble is dominated by Vu/Le/Sur lines
        preamble_lines = [l for l in preamble_candidate.splitlines() if l.strip()]
        preamble_hits = sum(
            1 for l in preamble_lines if _PREAMBLE_LINE_RE.match(l.strip())
        )
        if preamble_lines and (preamble_hits / len(preamble_lines)) > 0.3:
            return text[m.start() :]
    return text


def extract_one(pdf_path: Path) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)

    text_parts = []
    french_bbox = None  # detect once from first non-trivial page, reuse for rest

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                # Detect French bbox from first page (or first page with content)
                if french_bbox is None:
                    french_bbox = _detect_french_bbox(page)

                cropped = page.crop(french_bbox)
                t = cropped.extract_text(x_tolerance=3, y_tolerance=3)
                if t:
                    text_parts.append(t)
    except Exception as e:
        return f"[EXTRACT-ERROR: {pdf_path.name} \u2014 {e}]\n"

    text = "\n".join(text_parts)
    if not text.strip():
        return f"[SCANNED: {pdf_path.name} \u2014 OCR required]\n"

    # Strip gazette preamble before Article 1er
    text = _strip_preamble(text)
    return text


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
    parser = argparse.ArgumentParser(
        description="Tier 2 pdfplumber extractor for bilingual JO gazette PDFs."
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
        print("Tier 2 re-extraction \u2014 default targets (use --all for full corpus):")
        for name in DEFAULT_TARGETS:
            process(name)


if __name__ == "__main__":
    main()
