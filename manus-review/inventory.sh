#!/usr/bin/env bash
set -euo pipefail
ROOT=/home/ubuntu/legal_compare_repo
PDFDIR=/home/ubuntu/upload
OUT="$ROOT/work"
mkdir -p "$OUT/pdf_text" "$OUT"
: > "$OUT/pdf_inventory.tsv"
printf 'pdf\tpages\ttext_chars\tfirst_line\n' > "$OUT/pdf_inventory.tsv"
find "$PDFDIR" -maxdepth 1 -type f -iname '*.pdf' -print0 | sort -z | while IFS= read -r -d '' pdf; do
  base=$(basename "$pdf")
  stem=${base%.pdf}
  safe=$(printf '%s' "$stem" | tr '/ ' '__' | tr -cd '[:alnum:]_.-')
  txt="$OUT/pdf_text/$safe.txt"
  pdftotext -layout "$pdf" "$txt" 2>"$OUT/pdf_text/$safe.err" || true
  pages=$(pdfinfo "$pdf" 2>/dev/null | awk -F: '/^Pages:/{gsub(/ /,"",$2); print $2}')
  chars=$(wc -m < "$txt")
  first=$(head -n 1 "$txt" | tr '\t\r\n' ' ' | cut -c1-160)
  printf '%s\t%s\t%s\t%s\n' "$base" "${pages:-?}" "$chars" "$first" >> "$OUT/pdf_inventory.tsv"
done
printf '%s\n' 'Markdown inventory:' > "$OUT/md_inventory.tsv"
find "$ROOT/repo/legal_refs" -type f -iname '*.md' -printf '%P\t%s bytes\n' | sort >> "$OUT/md_inventory.tsv"
printf '%s\n' 'PDF inventory:'
cat "$OUT/pdf_inventory.tsv"
printf '%s\n' 'Markdown count:'
find "$ROOT/repo/legal_refs" -type f -iname '*.md' | wc -l
