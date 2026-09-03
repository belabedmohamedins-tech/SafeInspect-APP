#!/usr/bin/env python3
"""
extract_pdfplumber.py — Tier 2 PDF extractor using pdfplumber.

Use for two-column gazette PDFs where pdfminer (Tier 1) produces
column-scrambled text (article bodies contain fragments from adjacent columns).

pdfplumber uses bbox-ordered extraction which respects column boundaries,
yielding clean left-to-right, top-to-bottom text per page.

Usage (PowerShell):
    python legal_refs/validation/extract_pdfplumber.py
        → re-extracts the two known failing files:
          legal_refs/pdf/Loi 01-19.pdf
          legal_refs/pdf/loi 18-11.pdf

    python legal_refs/validation/extract_pdfplumber.py --pdf "Loi 04-20.pdf"
        → single file

    python legal_refs/validation/extract_pdfplumber.py --all
        → re-extracts every PDF in legal_refs/pdf/ (skips SCANNED marker files)

Dependencies:
    pip install pdfplumber   (already satisfied per session log)

Output: legal_refs/pdf/<stem>.txt  (always overwrites)
"""

import argparse
import sys
from pathlib import Path

PDF_DIR = Path("legal_refs/pdf")

# Default targets — the two confirmed two-column gazette failures
DEFAULT_TARGETS = [
    "Loi 01-19.pdf",
    "loi 18-11.pdf",
]


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

    text = "\n".join(text_parts)
    if not text.strip():
        return f"[SCANNED: {pdf_path.name} — OCR required]\n"
    return text


def process(pdf_name: str) -> None:
    # Try exact name first, then case-insensitive
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
        description="Tier 2 pdfplumber extractor for two-column gazette PDFs."
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
        # Default: the two known failing files
        print("Tier 2 re-extraction — default targets (use --all for full corpus):")
        for name in DEFAULT_TARGETS:
            process(name)


if __name__ == "__main__":
    main()
