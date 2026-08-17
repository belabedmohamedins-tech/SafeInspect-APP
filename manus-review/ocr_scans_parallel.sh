#!/usr/bin/env bash
set -euo pipefail
ROOT=/home/ubuntu/legal_compare_repo
PDFDIR=/home/ubuntu/upload
OUT="$ROOT/work"
mkdir -p "$OUT/ocr_text" "$OUT/ocr_images"
process_pdf() {
  local pdf="$1"
  local input="$PDFDIR/$pdf"
  local stem="${pdf%.pdf}"
  local safe
  safe=$(printf '%s' "$stem" | tr '/ ' '__' | tr -cd '[:alnum:]_.-')
  local imgdir="$OUT/ocr_images/$safe"
  rm -rf "$imgdir"; mkdir -p "$imgdir"
  pdftoppm -r 100 -png -f 1 -l 999 "$input" "$imgdir/page" >/dev/null 2>&1
  local out="$OUT/ocr_text/$safe.txt"
  : > "$out"
  for img in "$imgdir"/page-*.png; do
    printf '\n\n===== PAGE %s =====\n' "$(basename "$img")" >> "$out"
    OMP_THREAD_LIMIT=1 tesseract "$img" stdout -l fra --psm 6 2>/dev/null >> "$out" || true
  done
  printf 'done %s\n' "$pdf"
}
export ROOT PDFDIR OUT
export -f process_pdf
printf '%s\n' 'Décret76-35.pdf' 'Décret83-496.pdf' 'Décret90-245du18août1990(appareilsàpressiondegaz).pdf' 'decret91-05.pdf' 'decret93-120.pdf' 'loi90-29.pdf' | xargs -P 4 -I{} bash -c 'process_pdf "$1"' _ {}
printf 'OCR complete: %s documents\n' "$(find "$OUT/ocr_text" -type f | wc -l)"
