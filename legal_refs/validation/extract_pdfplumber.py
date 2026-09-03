#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor for bilingual JO gazette PDFs.

Algerian Journal Officiel (JO) pages are bilingual two-column:
  LEFT half  = French text
  RIGHT half = Arabic text (right-to-left)

Both columns share the same y-coordinate space, so default extractors
interleave both languages by y-position. Geometric half-page cropping
fails because article headers are CENTERED across both columns and fall
on the crop boundary.

This script uses an Arabic character filter instead:
  1. Extract full-page text (pdfplumber default)
  2. Drop lines that are >60% Arabic Unicode characters
  3. Strip Arabic characters from mixed lines, collapse spaces
  4. Strip preamble lines (Vu la loi / Le Président) line-by-line
     until the first Article marker — never slice mid-document

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

# Arabic Unicode blocks: main + Supplement + Presentation Forms A + B + Arabic Math
_ARABIC_BLOCKS = re.compile(
    r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]+"
)

# Preamble line patterns: only strip these as LEADING lines, not mid-document
_PREAMBLE_LINE_RE = re.compile(
    r"^(Vu\s|Consid[eé]rant|Sur\s+rapport|Sur\s+le\s+rapport|"
    r"Le\s+Pr[eé]sident|Le\s+Premier\s+Ministre|D[eé]lib[eé]rant|"
    r"Promulgu[eé]e?\s|JORA\b|Journal\s+Officiel|"
    r"R[eé]publique\s+Alg[eé]rienne|N°\s*\d|\d+\s*/\s*\d+)",
    re.IGNORECASE,
)

# Article header: "Article 1er", "Article 3", "Art. 5", etc.
_ARTICLE_HDR_RE = re.compile(r"^\s*Art(?:icle[r]?)?\s*\.?\s*\d", re.IGNORECASE)


def _arabic_density(text: str) -> float:
    """Return fraction of characters that are Arabic Unicode."""
    if not text:
        return 0.0
    arabic_chars = len("".join(_ARABIC_BLOCKS.findall(text)))
    return arabic_chars / len(text)


def _filter_arabic_lines(text: str) -> str:
    """
    Process text line by line:
    - Drop lines where >60% of characters are Arabic Unicode
    - For mixed lines, remove Arabic character sequences and collapse spaces
    Returns clean French-only text.
    """
    out_lines = []
    for line in text.splitlines():
        density = _arabic_density(line)
        if density > 0.60:
            # Predominantly Arabic line — drop entirely
            continue
        if density > 0.0:
            # Mixed line — strip Arabic characters, collapse internal spaces
            cleaned = _ARABIC_BLOCKS.sub(" ", line)
            cleaned = re.sub(r" {2,}", " ", cleaned).strip()
            if cleaned:
                out_lines.append(cleaned)
        else:
            out_lines.append(line)
    return "\n".join(out_lines)


def _strip_preamble_lines(text: str) -> str:
    """
    Strip leading preamble lines (Vu la loi, Le Président, etc.) line by line
    until the first Article header is encountered.
    Lines before the first Article that match preamble patterns are removed.
    Lines before the first Article that do NOT match are kept (e.g. law title).
    Once an Article header is seen, all subsequent content is kept as-is.
    """
    lines = text.splitlines()
    out_lines = []
    article_seen = False

    for line in lines:
        stripped = line.strip()
        if not article_seen:
            if _ARTICLE_HDR_RE.match(stripped):
                article_seen = True
                out_lines.append(line)
            elif _PREAMBLE_LINE_RE.match(stripped):
                # Drop this preamble line
                continue
            else:
                # Non-preamble line before first article (title, decree number, etc.) — keep
                out_lines.append(line)
        else:
            out_lines.append(line)

    return "\n".join(out_lines)


def extract_one(pdf_path: Path) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)

    text_parts = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text(x_tolerance=3, y_tolerance=3)
                if t:
                    text_parts.append(t)
    except Exception as e:
        return f"[EXTRACT-ERROR: {pdf_path.name} — {e}]\n"

    raw = "\n".join(text_parts)
    if not raw.strip():
        return f"[SCANNED: {pdf_path.name} — OCR required]\n"

    # Step 1: Filter out Arabic lines / Arabic characters from mixed lines
    text = _filter_arabic_lines(raw)

    # Step 2: Strip leading preamble lines before first Article
    text = _strip_preamble_lines(text)

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
        print("Tier 2 re-extraction — default targets (use --all for full corpus):")
        for name in DEFAULT_TARGETS:
            process(name)


if __name__ == "__main__":
    main()
