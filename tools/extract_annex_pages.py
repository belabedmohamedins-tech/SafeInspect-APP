#!/usr/bin/env python3
"""
extract_annex_pages.py — W98
Convert specific PDF pages to high-DPI images, then run Tesseract OCR.

Usage:
  python tools/extract_annex_pages.py <pdf_path> --pages 2 3 --dpi 300 --out legal_refs/pdf/annex_pages

Requires:
  pip install pdf2image pytesseract pillow
  Tesseract binary on PATH (https://github.com/UB-Mannheim/tesseract/wiki)
  poppler on PATH for pdf2image (https://github.com/oschwartz10612/poppler-windows/releases)
"""

import argparse
import sys
from pathlib import Path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf', help='Path to PDF file')
    ap.add_argument('--pages', nargs='+', type=int, required=True,
                    help='1-based page numbers to extract (e.g. --pages 2 3)')
    ap.add_argument('--dpi', type=int, default=300, help='Render DPI (default 300)')
    ap.add_argument('--out', default='legal_refs/pdf/annex_pages',
                    help='Output directory for images and OCR text')
    ap.add_argument('--lang', default='fra', help='Tesseract language code (default: fra)')
    args = ap.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f'ERROR: PDF not found: {pdf_path}', file=sys.stderr)
        sys.exit(1)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        from pdf2image import convert_from_path
    except ImportError:
        print('ERROR: pdf2image not installed. Run: pip install pdf2image', file=sys.stderr)
        sys.exit(1)

    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        print('ERROR: pytesseract/pillow not installed. Run: pip install pytesseract pillow', file=sys.stderr)
        sys.exit(1)

    print(f'Converting pages {args.pages} at {args.dpi} DPI ...')
    images = convert_from_path(
        str(pdf_path),
        dpi=args.dpi,
        first_page=min(args.pages),
        last_page=max(args.pages)
    )

    # convert_from_path returns pages from first_page to last_page in order
    page_range = list(range(min(args.pages), max(args.pages) + 1))

    for i, img in enumerate(images):
        page_num = page_range[i]
        if page_num not in args.pages:
            continue

        img_path = out_dir / f'page_{page_num:03d}.png'
        img.save(str(img_path), 'PNG')
        print(f'  Saved image: {img_path}')

        txt_path = out_dir / f'page_{page_num:03d}.txt'
        print(f'  Running Tesseract (lang={args.lang}) ...')
        text = pytesseract.image_to_string(img, lang=args.lang)
        txt_path.write_text(text, encoding='utf-8')
        print(f'  OCR text  : {txt_path}  ({len(text)} chars)')
        print()
        # Print first 40 lines as preview
        preview = text.splitlines()[:40]
        print(f'--- PREVIEW page {page_num} ---')
        print('\n'.join(preview))
        print(f'--- END PREVIEW ---')
        print()

    print('Done.')

if __name__ == '__main__':
    main()
