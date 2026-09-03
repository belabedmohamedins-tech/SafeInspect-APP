#!/usr/bin/env python3
"""
extract_pdf_text.py — W99 (updated: page-range support, seek-closed-file fix)
Batch PDF → plain-text extractor for the diff_articles.py pipeline.

Reads legal_refs/validation/paired_audit_queue.json, finds each PDF in
legal_refs/pdf/, and writes <stem>.txt alongside it.

Supports gazette PDFs via the `pdf_pages` field in the queue:
  "pdf_pages": [4, 7]  — extracts only pages 4 through 7 (1-based, inclusive)
  If omitted, the full PDF is extracted.

Usage:
  python extract_pdf_text.py                        # batch all queue entries
  python extract_pdf_text.py --pdf "decret 06-141.pdf"          # single file
  python extract_pdf_text.py --pdf "decret 06-141.pdf" --pages 4 7  # with range
  python extract_pdf_text.py --list-missing          # show status for all entries
  python extract_pdf_text.py --force                 # re-extract even if .txt exists

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
    name_lower = filename.lower()
    for f in PDF_DIR.iterdir():
        if f.name.lower() == name_lower:
            return f
    return None


def extract_text_pages(pdf_path: Path, page_range: tuple[int, int] | None = None) -> str:
    """
    Extract plain text from a PDF using pdfminer.six.
    page_range: (start, end) 1-based inclusive. None = full document.

    IMPORTANT: The file must remain open while process_page() runs because
    PDFPage objects hold references to the file handle for lazy parsing.
    Do NOT close the file before processing is complete.
    """
    try:
        from pdfminer.pdfpage import PDFPage
        from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
        from pdfminer.converter import TextConverter
        from pdfminer.layout import LAParams
        import io

        rsrcmgr = PDFResourceManager()
        output = io.StringIO()
        device = TextConverter(rsrcmgr, output, laparams=LAParams())
        interpreter = PDFPageInterpreter(rsrcmgr, device)

        # Keep file open for the entire processing loop — page objects reference
        # the file handle and will raise "seek of closed file" if it closes early.
        with open(pdf_path, "rb") as f:
            all_pages = list(PDFPage.get_pages(f))

            if page_range is not None:
                start, end = page_range
                start = max(1, start)
                end = min(len(all_pages), end)
                selected = all_pages[start - 1:end]
            else:
                selected = all_pages

            if not selected:
                device.close()
                output.close()
                return f"[EMPTY-RANGE: {pdf_path.name} — no pages in range {page_range}]\n"

            for page in selected:
                interpreter.process_page(page)

        text = output.getvalue()
        device.close()
        output.close()

        if not text or not text.strip():
            return f"[SCANNED: {pdf_path.name} — OCR required]\n"
        return text

    except ImportError:
        print("ERROR: pdfminer.six not installed. Run: pip install pdfminer.six", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        return f"[EXTRACT-ERROR: {pdf_path.name} — {e}]\n"


def write_txt(pdf_path: Path, text: str) -> Path:
    out = pdf_path.with_suffix(".txt")
    out.write_text(text, encoding="utf-8")
    return out


def load_queue() -> list[dict]:
    data = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    pairs = data if isinstance(data, list) else data.get("pairs", [])
    return pairs


def get_page_range(entry: dict) -> tuple[int, int] | None:
    """Return (start, end) from queue entry pdf_pages field, or None."""
    pr = entry.get("pdf_pages")
    if pr and isinstance(pr, list) and len(pr) == 2:
        return (int(pr[0]), int(pr[1]))
    return None


def list_missing() -> None:
    pairs = load_queue()
    missing = []
    for entry in pairs:
        pdf_name = entry.get("pdf") or entry.get("pdf_text", "")
        if not pdf_name:
            continue
        pdf_path = find_pdf(pdf_name)
        pr = get_page_range(entry)
        pr_str = f" [pages {pr[0]}–{pr[1]}]" if pr else ""
        if not pdf_path:
            missing.append(f"[NO-PDF]  {pdf_name}{pr_str}")
        elif not pdf_path.with_suffix(".txt").exists():
            missing.append(f"[NO-TXT]  {pdf_name}{pr_str}")
        else:
            missing.append(f"[OK]      {pdf_name}{pr_str}")
    for line in missing:
        print(line)
    no_pdf = sum(1 for l in missing if l.startswith("[NO-PDF]"))
    no_txt = sum(1 for l in missing if l.startswith("[NO-TXT]"))
    ok = sum(1 for l in missing if l.startswith("[OK]"))
    print(f"\nOK: {ok}  NO-TXT: {no_txt}  NO-PDF: {no_pdf}  Total: {len(missing)}")


def process_one(pdf_name: str, page_range: tuple[int, int] | None = None, force: bool = False) -> str:
    pdf_path = find_pdf(pdf_name)
    if not pdf_path:
        print(f"[NO-PDF]  {pdf_name} — not found in {PDF_DIR}")
        return "NO-PDF"
    txt_path = pdf_path.with_suffix(".txt")
    if txt_path.exists() and not force:
        pr_str = f" [pages {page_range[0]}–{page_range[1]}]" if page_range else ""
        print(f"[EXISTS]  {txt_path.name}{pr_str}  (use --force to re-extract)")
        return "EXISTS"
    text = extract_text_pages(pdf_path, page_range)
    out = write_txt(pdf_path, text)
    if text.startswith("[SCANNED") or text.startswith("[EXTRACT-ERROR") or text.startswith("[EMPTY"):
        print(f"[WARN]    {out.name} — {text[:80].strip()}")
        return "WARN"
    pr_str = f" [pages {page_range[0]}–{page_range[1]}]" if page_range else ""
    print(f"[OK]      {out.name}{pr_str}  ({len(text):,} chars)")
    return "OK"


def run_batch(force: bool = False) -> None:
    pairs = load_queue()
    counts = {"OK": 0, "EXISTS": 0, "WARN": 0, "NO-PDF": 0}
    for entry in pairs:
        pdf_name = entry.get("pdf") or entry.get("pdf_text", "")
        if not pdf_name:
            continue
        pr = get_page_range(entry)
        status = process_one(pdf_name, page_range=pr, force=force)
        counts[status] = counts.get(status, 0) + 1
    print(f"\nDone. OK={counts['OK']} EXISTS={counts['EXISTS']} WARN={counts['WARN']} NO-PDF={counts['NO-PDF']}")
    if counts["NO-PDF"]:
        print(f"  {counts['NO-PDF']} PDF(s) not found in {PDF_DIR} — copy them there first.")
    if counts["WARN"]:
        print(f"  {counts['WARN']} scanned/image PDF(s) — OCR required (see SCANNED_OCR_QUARANTINE.md).")


def main() -> None:
    p = argparse.ArgumentParser(description="Extract plain text from PDFs for diff pipeline.")
    p.add_argument("--pdf", help="Single PDF filename (from legal_refs/pdf/)")
    p.add_argument("--pages", nargs=2, type=int, metavar=("START", "END"),
                   help="Page range to extract (1-based, inclusive). E.g. --pages 4 7")
    p.add_argument("--list-missing", action="store_true", help="Show extraction status for all queue entries")
    p.add_argument("--force", action="store_true", help="Re-extract even if .txt already exists")
    args = p.parse_args()

    if args.list_missing:
        list_missing()
    elif args.pdf:
        pr = tuple(args.pages) if args.pages else None
        process_one(args.pdf, page_range=pr, force=args.force)
    else:
        run_batch(force=args.force)


if __name__ == "__main__":
    main()
