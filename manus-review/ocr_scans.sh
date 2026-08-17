#!/usr/bin/env bash
set -euo pipefail
ROOT=/home/ubuntu/legal_compare_repo
PDFDIR=/home/ubuntu/upload
OUT="$ROOT/work"
mkdir -p "$OUT/ocr_text" "$OUT/ocr_images"
for pdf in \
  'Décret76-35.pdf' \
  'Décret83-496.pdf' \
  'Décret90-245du18août1990(appareilsàpressiondegaz).pdf' \
  'decret91-05.pdf' \
  'decret93-120.pdf' \
  'loi90-29.pdf'; do
  input="$PDFDIR/$pdf"
  stem=${pdf%.pdf}
  safe=$(printf '%s' "$stem" | tr '/ ' '__' | tr -cd '[:alnum:]_.-')
  imgdir="$OUT/ocr_images/$safe"
  rm -rf "$imgdir"; mkdir -p "$imgdir"
  pdftoppm -r 160 -png -f 1 -l 999 "$input" "$imgdir/page" >/dev/null 2>&1
  out="$OUT/ocr_text/$safe.txt"
  : > "$out"
  for img in "$imgdir"/page-*.png; do
    printf '\n\n===== PAGE %s =====\n' "$(basename "$img")" >> "$out"
    tesseract "$img" stdout -l fra+eng+ara --psm 6 2>/dev/null >> "$out" || true
  done
done
printf 'OCR complete: %s documents\n' "$(find "$OUT/ocr_text" -type f | wc -l)"
