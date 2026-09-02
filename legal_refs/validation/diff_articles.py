#!/usr/bin/env python3
"""
diff_articles.py — W97 Phase 3 (path-resolution fix W98-prep)
Fuzzy diff engine: compare indexed MD articles vs PDF-extracted text.

Usage:
  python diff_articles.py --md <file.md> --pdf-text <file.txt> [--out-dir <dir>]
  python diff_articles.py --batch <paired_audit_queue.json> [--out-dir <dir>]

Path resolution (batch mode):
  MD files  — searched in order: bare path → legal_refs/md/ → legal_refs/ → queue dir
  PDF texts — searched as <stem>.txt in: bare path → legal_refs/pdf/ → queue dir
              If no .txt found, entry is SKIPPED with "[NO-TXT]" — extract PDF first.

Outputs (per document):
  <stem>_diff.json   — machine-readable per-article scores
  <stem>_diff.md     — human-readable Markdown report

Scoring thresholds:
  MATCH   >= 0.85   article text closely matches PDF
  PARTIAL >= 0.50   meaningful overlap, manual review advised
  MISMATCH < 0.50   significant divergence
  MD_ONLY           article present in MD, absent from PDF extract
  PDF_ONLY          article detected in PDF extract, absent from MD

Depends only on stdlib: difflib, re, json, pathlib, argparse.
"""

import argparse
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

# ---------------------------------------------------------------------------
# Path resolver
# ---------------------------------------------------------------------------

def resolve_md(filename: str, search_roots: list[Path]) -> Path | None:
    """Find an MD file by searching multiple root directories."""
    p = Path(filename)
    if p.exists():
        return p
    name = p.name
    for root in search_roots:
        candidate = root / name
        if candidate.exists():
            return candidate
    return None


def resolve_pdf_txt(pdf_filename: str, search_roots: list[Path]) -> Path | None:
    """
    Find a plain-text extract for a PDF.
    Looks for <stem>.txt alongside expected PDF locations.
    Returns None if not found — caller should print [NO-TXT] and skip.
    """
    stem = Path(pdf_filename).stem
    txt_name = stem + ".txt"
    # 1. bare path with .txt extension
    p = Path(pdf_filename).with_suffix(".txt")
    if p.exists():
        return p
    # 2. search roots
    for root in search_roots:
        candidate = root / txt_name
        if candidate.exists():
            return candidate
    return None


# ---------------------------------------------------------------------------
# Shared normaliser (mirrors normalize.py logic, kept self-contained)
# ---------------------------------------------------------------------------

_LIGATURES = str.maketrans({
    "\u0153": "oe", "\u0152": "OE",
    "\u00e6": "ae", "\u00c6": "AE",
    "\u00df": "ss",
    "\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"',
    "\u2013": "-", "\u2014": "-",
    "\u00ab": '"', "\u00bb": '"',
    "\u00e9": "e", "\u00e8": "e", "\u00ea": "e", "\u00eb": "e",
    "\u00e0": "a", "\u00e2": "a", "\u00e4": "a",
    "\u00ee": "i", "\u00ef": "i",
    "\u00f4": "o", "\u00f6": "o",
    "\u00f9": "u", "\u00fb": "u", "\u00fc": "u",
    "\u00e7": "c",
    "\u00c9": "E", "\u00c8": "E", "\u00ca": "E",
    "\u00c0": "A", "\u00c2": "A",
    "\u00ce": "I", "\u00d4": "O",
    "\u00d9": "U", "\u00db": "U", "\u00dc": "U",
    "\u00c7": "C",
})


def _normalise(text: str) -> str:
    """Lowercase, strip diacritics/ligatures, collapse whitespace."""
    text = text.translate(_LIGATURES)
    text = text.lower()
    text = re.sub(r"[#*_`~>|\\]", " ", text)
    text = re.sub(r"^article\s+\d+\w*[\s.:–-]*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Article extractor for MD files
# ---------------------------------------------------------------------------

_MD_ART_RE = re.compile(
    r"^#{1,4}\s*[Aa]rticle[r]?\s*(\d+\w*)\b[^\n]*\n(.*?)(?=^#{1,4}\s*[Aa]rticle|\Z)",
    re.MULTILINE | re.DOTALL,
)

_MD_ART_BOLD_RE = re.compile(
    r"(?m)^\*{1,2}[Aa]rticle[r]?\s*(\d+\w*)\b\*{1,2}[^\n]*\n(.*?)(?=^\*{1,2}[Aa]rticle|\Z)",
    re.DOTALL,
)

_MD_ART_PLAIN_RE = re.compile(
    r"(?m)^[Aa]rticle[r]?\s+(\d+\w*)\s*[.:\u2013\u2014-][^\n]*\n(.*?)(?=^[Aa]rticle[r]?\s+\d|\Z)",
    re.DOTALL,
)


def extract_md_articles(md_text: str) -> dict[str, str]:
    """Return {article_number: body_text} from a Markdown file."""
    articles: dict[str, str] = {}
    for pattern in (_MD_ART_RE, _MD_ART_BOLD_RE, _MD_ART_PLAIN_RE):
        for m in pattern.finditer(md_text):
            num = m.group(1).lower().lstrip("0") or "0"
            if num not in articles:
                articles[num] = m.group(2).strip()
    return articles


# ---------------------------------------------------------------------------
# Article extractor for plain PDF-extracted text
# ---------------------------------------------------------------------------

_PDF_ART_RE = re.compile(
    r"(?mi)^[Aa]rticle[r]?\s+(\d+\w*)\s*[.:\u2013\u2014\u2012 \t-][^\n]*\n(.*?)(?=^[Aa]rticle[r]?\s+\d|\Z)",
    re.DOTALL,
)

_PDF_ART_SHORT_RE = re.compile(
    r"(?mi)^[Aa]rt\.\s*(\d+\w*)\s*[.:\u2013\u2014 \t-][^\n]*\n(.*?)(?=^[Aa]rt\.\s*\d|\Z)",
    re.DOTALL,
)


def extract_pdf_articles(pdf_text: str) -> dict[str, str]:
    """Return {article_number: body_text} from plain PDF-extracted text."""
    articles: dict[str, str] = {}
    for pattern in (_PDF_ART_RE, _PDF_ART_SHORT_RE):
        for m in pattern.finditer(pdf_text):
            num = m.group(1).lower().lstrip("0") or "0"
            if num not in articles:
                articles[num] = m.group(2).strip()
    return articles


# ---------------------------------------------------------------------------
# Fuzzy scorer
# ---------------------------------------------------------------------------

THRESHOLD_MATCH = 0.85
THRESHOLD_PARTIAL = 0.50


def score_pair(md_body: str, pdf_body: str) -> float:
    """Return SequenceMatcher ratio on normalised texts."""
    a = _normalise(md_body)
    b = _normalise(pdf_body)
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def classify(score: float) -> str:
    if score >= THRESHOLD_MATCH:
        return "MATCH"
    if score >= THRESHOLD_PARTIAL:
        return "PARTIAL"
    return "MISMATCH"


# ---------------------------------------------------------------------------
# Diff engine
# ---------------------------------------------------------------------------

def diff_document(md_path: Path, pdf_text_path: Path) -> dict:
    """Compare one MD file against its PDF text extract. Return result dict."""
    md_text = md_path.read_text(encoding="utf-8", errors="replace")
    pdf_text = pdf_text_path.read_text(encoding="utf-8", errors="replace")

    md_arts = extract_md_articles(md_text)
    pdf_arts = extract_pdf_articles(pdf_text)

    all_nums = sorted(
        set(md_arts) | set(pdf_arts),
        key=lambda x: (int(re.sub(r"\D", "", x) or 0), x),
    )

    results = []
    counts = {"MATCH": 0, "PARTIAL": 0, "MISMATCH": 0, "MD_ONLY": 0, "PDF_ONLY": 0}

    for num in all_nums:
        in_md = num in md_arts
        in_pdf = num in pdf_arts

        if in_md and in_pdf:
            score = score_pair(md_arts[num], pdf_arts[num])
            status = classify(score)
        elif in_md:
            score = None
            status = "MD_ONLY"
        else:
            score = None
            status = "PDF_ONLY"

        counts[status] += 1
        entry = {
            "article": num,
            "status": status,
            "score": round(score, 4) if score is not None else None,
            "in_md": in_md,
            "in_pdf": in_pdf,
        }
        if status in ("PARTIAL", "MISMATCH"):
            entry["md_snippet"] = md_arts.get(num, "")[:200]
            entry["pdf_snippet"] = pdf_arts.get(num, "")[:200]
        results.append(entry)

    total = len(all_nums)
    match_rate = round(counts["MATCH"] / total, 4) if total else 0.0

    return {
        "md_file": md_path.name,
        "pdf_text_file": pdf_text_path.name,
        "total_articles": total,
        "counts": counts,
        "match_rate": match_rate,
        "overall_status": (
            "PASS" if match_rate >= THRESHOLD_MATCH and counts["MISMATCH"] == 0
            else "REVIEW_REQUIRED"
        ),
        "articles": results,
    }


# ---------------------------------------------------------------------------
# Report writers
# ---------------------------------------------------------------------------

def write_json(result: dict, out_dir: Path) -> Path:
    stem = Path(result["md_file"]).stem
    out = out_dir / f"{stem}_diff.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def write_md_report(result: dict, out_dir: Path) -> Path:
    stem = Path(result["md_file"]).stem
    out = out_dir / f"{stem}_diff.md"

    lines = [
        f"# Diff Report: {result['md_file']}",
        "",
        f"**PDF text source:** `{result['pdf_text_file']}`  ",
        f"**Total articles compared:** {result['total_articles']}  ",
        f"**Match rate:** {result['match_rate']*100:.1f}%  ",
        f"**Overall status:** `{result['overall_status']}`",
        "",
        "## Summary",
        "",
        "| Status | Count |",
        "|--------|-------|",
    ]
    for k, v in result["counts"].items():
        lines.append(f"| {k} | {v} |")

    lines += ["", "## Per-Article Results", ""]

    for art in result["articles"]:
        score_str = f"{art['score']*100:.1f}%" if art["score"] is not None else "—"
        flag = "✅" if art["status"] == "MATCH" else (
            "⚠️" if art["status"] == "PARTIAL" else (
            "❌" if art["status"] == "MISMATCH" else "🔵"
        ))
        lines.append(f"### {flag} Article {art['article']} — `{art['status']}` ({score_str})")
        if art["status"] in ("PARTIAL", "MISMATCH"):
            lines += [
                "",
                f"**MD snippet:** {art.get('md_snippet', '')}",
                "",
                f"**PDF snippet:** {art.get('pdf_snippet', '')}",
                "",
            ]

    out.write_text("\n".join(lines), encoding="utf-8")
    return out


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Fuzzy diff MD articles vs PDF text extract.")
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--md", help="Path to Markdown file")
    mode.add_argument("--batch", help="Path to paired_audit_queue.json (batch mode)")
    p.add_argument("--pdf-text", help="Path to PDF plain-text extract (single mode)")
    p.add_argument(
        "--out-dir",
        default=".",
        help="Output directory for reports (default: current dir)",
    )
    return p.parse_args()


def run_single(md_path: Path, pdf_text_path: Path, out_dir: Path) -> dict:
    result = diff_document(md_path, pdf_text_path)
    json_out = write_json(result, out_dir)
    md_out = write_md_report(result, out_dir)
    print(f"[{result['overall_status']}] {md_path.name}  match={result['match_rate']*100:.1f}%")
    print(f"  JSON  -> {json_out}")
    print(f"  MD    -> {md_out}")
    return result


def run_batch(queue_path: Path, out_dir: Path) -> None:
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    pairs = queue if isinstance(queue, list) else queue.get("pairs", [])

    # Search roots for MD and PDF txt files
    repo_root = queue_path.parent.parent.parent  # legal_refs/validation -> repo root
    legal_refs = queue_path.parent.parent         # legal_refs/
    md_roots = [legal_refs / "md", legal_refs, queue_path.parent]
    txt_roots = [legal_refs / "pdf", legal_refs, queue_path.parent]

    summary = []
    no_txt_count = 0

    for entry in pairs:
        md_file = entry.get("md") or entry.get("markdown")
        pdf_file = entry.get("pdf_text") or entry.get("pdf")
        if not md_file:
            print(f"[SKIP] Missing md field: {entry}", file=sys.stderr)
            continue

        # Resolve MD path
        md_path = resolve_md(md_file, md_roots)
        if not md_path:
            print(f"[SKIP] MD not found in legal_refs/md/ or legal_refs/: {md_file}", file=sys.stderr)
            continue

        # Resolve PDF txt path — skip gracefully if not extracted yet
        pdf_txt_path = None
        if pdf_file:
            pdf_txt_path = resolve_pdf_txt(pdf_file, txt_roots)
        if not pdf_txt_path:
            print(f"[NO-TXT] No .txt extract for: {pdf_file or '(none)'}  — run PDF extraction first (W98)")
            no_txt_count += 1
            continue

        result = run_single(md_path, pdf_txt_path, out_dir)
        summary.append({
            "md": md_file,
            "overall_status": result["overall_status"],
            "match_rate": result["match_rate"],
            "counts": result["counts"],
        })

    # Write batch summary
    summary_path = out_dir / "diff_batch_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nBatch complete. Summary -> {summary_path}")
    pass_count = sum(1 for r in summary if r["overall_status"] == "PASS")
    print(f"PASS: {pass_count}/{len(summary)}")
    if no_txt_count:
        print(f"[NO-TXT]: {no_txt_count} entries skipped — PDF plain-text extracts missing.")
        print("  To generate: use pdfminer / pypdf / pdfplumber to extract each PDF to .txt")
        print("  Place .txt files alongside PDFs in legal_refs/pdf/ then rerun.")


def main() -> None:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.md:
        if not args.pdf_text:
            print("ERROR: --pdf-text is required with --md", file=sys.stderr)
            sys.exit(1)
        md_path = Path(args.md)
        if not md_path.exists():
            # Try legal_refs/md/ relative to CWD
            candidate = Path("legal_refs") / "md" / md_path.name
            if candidate.exists():
                md_path = candidate
            else:
                print(f"ERROR: MD file not found: {args.md}", file=sys.stderr)
                print(f"  Tried: {args.md}, legal_refs/md/{md_path.name}", file=sys.stderr)
                sys.exit(1)
        run_single(md_path, Path(args.pdf_text), out_dir)
    else:
        run_batch(Path(args.batch), out_dir)


if __name__ == "__main__":
    main()
