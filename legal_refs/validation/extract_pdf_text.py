#!/usr/bin/env python3
"""
extract_pdf_text.py — W98
Batch PDF → plain-text extractor for the diff_articles.py pipeline.

Reads legal_refs/validation/paired_audit_queue.json, finds each PDF in
legal_refs/pdf/, and writes <stem>.txt alongside it.

Usage:
  python extract_pdf_text.py                        # batch all queue entries
  python extract_pdf_text.py --pdf "Décret 06-141.pdf"  # single file
  python extract_pdf_text.py --list-missing          # show which PDFs lack .txt

Dependencies (install once):
  pip install pdfminer.six

Fallback: if pdfminer fails (scanned/image PDF), the .txt will contain
  [SCANNED: <filename> — OCR required]
so diff_articles.py can report it as NO-TXT rather than crash.

Output: legal_refs/pdf/<stem>.txt
"""

import argparse
import json
import sys
from pathlib import Path

QUEUE_PATH = Path("legal_refs/validation/paired_audit_queue.json")
PDF_DIR = Path("legal_refs/pdf")


def find_pdf(filename: str) -> Path | None:
    """Locate a PDF by exact name in legal_refs/pdf/."""
    p = PDF_DIR / filename
    if p.exists():
        return p
    # Case-insensitive fallback (Windows filenames may differ in accent encoding)
    name_lower = filename.lower()
    for f in PDF_DIR.iterdir():
        if f.name.lower() == name_lower:
            return f
    return None


def extract_text(pdf_path: Path) -> str:
    """Extract plain text from a PDF using pdfminer.six."""
    try:
        from pdfminer.high_level import extract_text as _extract
        text = _extract(str(pdf_path))
        if not text or not text.strip():
            return f"[SCANNED: {pdf_path.name} \u2014 OCR required]\n"
        return text
    except ImportError:
        print("ERROR: pdfminer.six not installed. Run: pip install pdfminer.six", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        return f"[EXTRACT-ERROR: {pdf_path.name} \u2014 {e}]\n"


def write_txt(pdf_path: Path, text: str) -> Path:
    out = pdf_path.with_suffix(".txt")
    out.write_text(text, encoding="utf-8")
    return out


def load_queue() -> list[str]:
    data = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    pairs = data if isinstance(data, list) else data.get("pairs", [])
    return [e.get("pdf") or e.get("pdf_text", "") for e in pairs if e.get("pdf") or e.get("pdf_text")]


def list_missing() -> None:
    pdfs = load_queue()
    missing = []
    for pdf_name in pdfs:
        pdf_path = find_pdf(pdf_name)
        if not pdf_path:
            missing.append(f"[NO-PDF]  {pdf_name}")
        elif not pdf_path.with_suffix(".txt").exists():
            missing.append(f"[NO-TXT]  {pdf_name}")
        else:
            missing.append(f"[OK]      {pdf_name}")
    for line in missing:
        print(line)
    no_pdf = sum(1 for l in missing if l.startswith("[NO-PDF]"))
    no_txt = sum(1 for l in missing if l.startswith("[NO-TXT]"))
    ok = sum(1 for l in missing if l.startswith("[OK]"))
    print(f"\nOK: {ok}  NO-TXT: {no_txt}  NO-PDF: {no_pdf}  Total: {len(missing)}")


def process_one(pdf_name: str) -> str:
    pdf_path = find_pdf(pdf_name)
    if not pdf_path:
        print(f"[NO-PDF]  {pdf_name} \u2014 not found in {PDF_DIR}")
        return "NO-PDF"
    txt_path = pdf_path.with_suffix(".txt")
    if txt_path.exists():
        print(f"[EXISTS]  {txt_path.name}")
        return "EXISTS"
    text = extract_text(pdf_path)
    out = write_txt(pdf_path, text)
    if text.startswith("[SCANNED") or text.startswith("[EXTRACT-ERROR"):
        print(f"[WARN]    {out.name} \u2014 {text[:80].strip()}")
        return "WARN"
    print(f"[OK]      {out.name}  ({len(text):,} chars)")
    return "OK"


def run_batch() -> None:
    pdfs = load_queue()
    counts = {"OK": 0, "EXISTS": 0, "WARN": 0, "NO-PDF": 0}
    for pdf_name in pdfs:
        status = process_one(pdf_name)
        counts[status] = counts.get(status, 0) + 1
    print(f"\nDone. OK={counts['OK']} EXISTS={counts['EXISTS']} WARN={counts['WARN']} NO-PDF={counts['NO-PDF']}")
    if counts["NO-PDF"]:
        print(f"  {counts['NO-PDF']} PDF(s) not found in {PDF_DIR} \u2014 copy them there first.")
    if counts["WARN"]:
        print(f"  {counts['WARN']} scanned/image PDF(s) \u2014 OCR required (see SCANNED_OCR_QUARANTINE.md).")


def main() -> None:
    p = argparse.ArgumentParser(description="Extract plain text from PDFs for diff pipeline.")
    p.add_argument("--pdf", help="Single PDF filename (from legal_refs/pdf/)")
    p.add_argument("--list-missing", action="store_true", help="Show extraction status for all queue entries")
    args = p.parse_args()

    if args.list_missing:
        list_missing()
    elif args.pdf:
        process_one(args.pdf)
    else:
        run_batch()


if __name__ == "__main__":
    main()
