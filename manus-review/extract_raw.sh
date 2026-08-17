#!/usr/bin/env bash
set -euo pipefail
ROOT=/home/ubuntu/legal_compare_repo
PDFDIR=/home/ubuntu/upload
OUT="$ROOT/work/raw_text"
mkdir -p "$OUT"
find "$PDFDIR" -maxdepth 1 -type f -iname '*.pdf' -print0 | while IFS= read -r -d '' pdf; do
  base=$(basename "$pdf")
  stem=${base%.pdf}
  safe=$(printf '%s' "$stem" | tr '/ ' '__' | tr -cd '[:alnum:]_.-')
  pdftotext -raw "$pdf" "$OUT/$safe.txt" 2>/dev/null || true
done
printf 'Raw extraction files: %s\n' "$(find "$OUT" -type f | wc -l)"
