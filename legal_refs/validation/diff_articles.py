#!/usr/bin/env python3
"""
diff_articles.py — W101 (article_range support over W100)
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

W100 patches (2026-09-03):
  MODE A — PDF=0 articles bug: two-column gazette layout from pdfminer merges columns
           so "Article N" appears mid-line after a long whitespace run, not at ^.
           Fix: _PDF_ART_SEP_RE / _PDF_ART_BARE_RE / _PDF_ART_SHORT_RE now also match
           after 4+ whitespace chars on the same line (gazette column separator).
           The pre-processor inserts \\n before these markers so ^ fires on them.
  MODE B — content scramble (loi-18-11 3.6%): pdfminer double-space column padding
           and \\u00a0 (non-breaking space) survive \\s+ collapse in some builds.
           Fix: _normalise() now maps all Unicode whitespace variants to ' ' explicitly
           before the regex collapse, including \\u00a0, \\u202f, \\u2009, \\u2002, \\u2003.
  MODE C — decret-11-125 77.8%: same \\u00a0 issue, same fix as MODE B.

W101 patches (2026-09-03):
  article_range — queue entries may carry {"article_range": [start, end]} (inclusive).
                  diff_document() and run_batch() now filter PDF-extracted articles
                  to the given numeric range before comparison, eliminating PDF_ONLY
                  noise from articles belonging to other split-file parties.
                  MD articles outside the range are not filtered (they would surface
                  as MD_ONLY and signal an authoring error in the MD file itself).
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
    stem = Path(pdf_filename).stem
    txt_name = stem + ".txt"
    p = Path(pdf_filename).with_suffix(".txt")
    if p.exists():
        return p
    for root in search_roots:
        candidate = root / txt_name
        if candidate.exists():
            return candidate
    return None


# ---------------------------------------------------------------------------
# Normaliser  (W100: Unicode whitespace variants added)
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
    # W100: map all Unicode whitespace variants that \\s+ may miss
    "\u00a0": " ",   # non-breaking space
    "\u202f": " ",   # narrow no-break space
    "\u2009": " ",   # thin space
    "\u2002": " ",   # en space
    "\u2003": " ",   # em space
    "\u2007": " ",   # figure space
    "\u2008": " ",   # punctuation space
    "\u200b": "",    # zero-width space — drop entirely
    "\ufeff": "",    # BOM — drop entirely
})

# mojibake sequences produced when UTF-8 é à etc. is misread as latin-1/cp1252
_MOJIBAKE = [
    ("\u00c3\u00a9", "e"),   # é
    ("\u00c3\u00a8", "e"),   # è
    ("\u00c3\u00aa", "e"),   # ê
    ("\u00c3\u00a0", "a"),   # à
    ("\u00c3\u00a2", "a"),   # â
    ("\u00c3\u00ae", "i"),   # î
    ("\u00c3\u00b4", "o"),   # ô
    ("\u00c3\u00b9", "u"),   # ù
    ("\u00c3\u00bb", "u"),   # û
    ("\u00c3\u00a7", "c"),   # ç
    ("\u00c3\u0089", "E"),   # É
    ("\u00c3\u0088", "E"),   # È
    ("\u00c2\u00b0", ""),    # ° (degree sign — drop)
    ("\u00e2\u0080\u0093", "-"),  # –
    ("\u00e2\u0080\u0094", "-"),  # —
    ("\u00e2\u0080\u0099", "'"),  # '
]


def _normalise(text: str) -> str:
    """Lowercase, strip diacritics/ligatures/mojibake/Unicode-WS, collapse whitespace."""
    for bad, good in _MOJIBAKE:
        text = text.replace(bad, good)
    text = text.translate(_LIGATURES)   # includes \u00a0 → ' ' (W100)
    text = text.lower()
    text = re.sub(r"[#*_`~>|\\]", " ", text)
    text = re.sub(r"^art(?:icle[r]?)?\s*\.?\s*\d+\w*[\s.:\u2013\u2014-]*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Ordinal key normalisation: 1er / 1ère / 2e → bare digit
# ---------------------------------------------------------------------------

def _normalise_article_key(raw: str) -> str:
    """
    Normalise article number keys so ordinal suffixes don't create duplicates.
    Examples: '1er' -> '1', '1ere' -> '1', '2e' -> '2', '3eme' -> '3'
    Pure digits are stripped of leading zeros: '01' -> '1'.
    Mixed alphanumeric like '12bis' are kept as-is (lowercased).
    """
    num = raw.lower().lstrip("0") or "0"
    cleaned = re.sub(r"^(\d+)(?:è?re?|è?me?|e)$", r"\1", num)
    if re.fullmatch(r"\d+", cleaned):
        return str(int(cleaned))
    return cleaned


# ---------------------------------------------------------------------------
# MD article extractor
# ---------------------------------------------------------------------------

_MD_ART_HEADING_RE = re.compile(
    r"^#{1,4}\s*[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\b[^\n]*\n(.*?)(?=^#{1,4}\s*[Aa]rt|\Z)",
    re.MULTILINE | re.DOTALL,
)

_MD_ART_BOLD_INLINE_RE = re.compile(
    r"(?m)^\*{1,2}[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)[^*\n]*\*{1,2}[^\n]*\n(.*?)(?=^\*{1,2}[Aa]rt|\Z)",
    re.DOTALL,
)

_MD_ART_PLAIN_RE = re.compile(
    r"(?m)^[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\s*[.:\u2013\u2014-][^\n]*\n(.*?)(?=^[Aa]rt(?:icle[r]?)?\s*\.?\s*\d|\Z)",
    re.DOTALL,
)


def extract_md_articles(md_text: str) -> dict[str, str]:
    """Return {article_number: body_text} from a Markdown file."""
    articles: dict[str, str] = {}
    for pattern in (_MD_ART_HEADING_RE, _MD_ART_BOLD_INLINE_RE, _MD_ART_PLAIN_RE):
        for m in pattern.finditer(md_text):
            num = _normalise_article_key(m.group(1))
            if num not in articles:
                articles[num] = m.group(2).strip()
    return articles


# ---------------------------------------------------------------------------
# PDF article extractor  (W100: MODE A fix — mid-line Article marker support)
# ---------------------------------------------------------------------------
#
# Two-column gazette PDFs extracted with pdfminer produce text like:
#
#   "...end of col-1 text    Article 5. — Le décret..."
#
# There is NO newline before "Article 5". The column separator is a run of
# 4+ spaces. The W100 fix: a pre-processor step (_inject_article_newlines)
# inserts \n before any "Article N" that appears mid-line after whitespace,
# so the ^ anchor in the regexes below fires correctly.
#
# This pre-processor is applied to the PDF text BEFORE extraction.
# ---------------------------------------------------------------------------

# Matches "Article N" / "Art. N" that appears mid-line after 4+ spaces
# (gazette two-column layout artefact). Capture group 1 = everything before,
# group 2 = the Article marker and everything after.
_MIDLINE_ARTICLE_RE = re.compile(
    r"([ \t]{4,})([Aa]rt(?:icle[r]?)?\s*\.?\s*\d)",
)


def _inject_article_newlines(text: str) -> str:
    """
    W100 MODE A fix: insert \\n before any Article marker that appears mid-line
    after a run of 4+ spaces (pdfminer two-column merge artefact).
    Safe to run on all PDF texts — only fires when the pattern matches.
    """
    return _MIDLINE_ARTICLE_RE.sub(r"\n\2", text)


_PDF_ART_SEP_RE = re.compile(
    r"(?mi)^[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\s*[.:\u2013\u2014\u2012\u2015 \t-]+[^\n]*\n(.*?)(?=^[Aa]rt(?:icle[r]?)?\s*\.?\s*\d|\Z)",
    re.DOTALL,
)

_PDF_ART_BARE_RE = re.compile(
    r"(?mi)^[Aa]rticle[r]?\s+(\d+\w*)\s*\n(.*?)(?=^[Aa]rticle[r]?\s+\d|\Z)",
    re.DOTALL,
)

_PDF_ART_SHORT_RE = re.compile(
    r"(?mi)^[Aa]rt\.\s*(\d+\w*)\s*[.:\u2013\u2014 \t-][^\n]*\n(.*?)(?=^[Aa]rt\.\s*\d|\Z)",
    re.DOTALL,
)


def extract_pdf_articles(pdf_text: str) -> dict[str, str]:
    """Return {article_number: body_text} from plain PDF-extracted text."""
    # W100 MODE A: inject newlines before mid-line Article markers first
    pdf_text = _inject_article_newlines(pdf_text)
    articles: dict[str, str] = {}
    for pattern in (_PDF_ART_SEP_RE, _PDF_ART_BARE_RE, _PDF_ART_SHORT_RE):
        for m in pattern.finditer(pdf_text):
            num = _normalise_article_key(m.group(1))
            if num not in articles:
                articles[num] = m.group(2).strip()
    return articles


# ---------------------------------------------------------------------------
# W101: article_range filter
# ---------------------------------------------------------------------------

def _filter_by_range(articles: dict[str, str], article_range: list | None) -> dict[str, str]:
    """
    W101: If article_range=[start, end] is provided (inclusive), drop all PDF
    articles whose numeric key falls outside [start, end]. Non-numeric keys
    (e.g. '12bis') are kept regardless — they cannot be range-checked reliably.
    Only applied to PDF-extracted articles, never to MD articles.
    """
    if not article_range or len(article_range) != 2:
        return articles
    start, end = int(article_range[0]), int(article_range[1])
    filtered = {}
    for k, v in articles.items():
        # Try to extract a leading integer from the key
        m = re.match(r"^(\d+)", k)
        if m:
            n = int(m.group(1))
            if start <= n <= end:
                filtered[k] = v
        else:
            # Non-numeric key — keep unconditionally
            filtered[k] = v
    return filtered


# ---------------------------------------------------------------------------
# Fuzzy scorer
# ---------------------------------------------------------------------------

THRESHOLD_MATCH = 0.85
THRESHOLD_PARTIAL = 0.50


def score_pair(md_body: str, pdf_body: str) -> float:
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

def diff_document(md_path: Path, pdf_text_path: Path,
                  article_range: list | None = None) -> dict:
    md_text = md_path.read_text(encoding="utf-8", errors="replace")
    pdf_text = pdf_text_path.read_text(encoding="utf-8", errors="replace")

    md_arts = extract_md_articles(md_text)
    pdf_arts = extract_pdf_articles(pdf_text)

    # W101: filter PDF articles to declared range (split-file support)
    if article_range:
        pdf_arts = _filter_by_range(pdf_arts, article_range)

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

    result = {
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
    if article_range:
        result["article_range"] = article_range
    return result


# ---------------------------------------------------------------------------
# Diagnostic
# ---------------------------------------------------------------------------

def diagnose(md_path: Path, pdf_txt_path: Path) -> None:
    md_text = md_path.read_text(encoding="utf-8", errors="replace")
    pdf_text = pdf_txt_path.read_text(encoding="utf-8", errors="replace")
    md_arts = extract_md_articles(md_text)
    pdf_arts = extract_pdf_articles(pdf_text)
    print(f"MD  articles found: {len(md_arts)}  \u2014 keys: {sorted(md_arts)[:10]}")
    print(f"PDF articles found: {len(pdf_arts)} \u2014 keys: {sorted(pdf_arts)[:10]}")
    for k, v in list(md_arts.items())[:3]:
        print(f"  MD  Art.{k}: {v[:80]!r}")
    for k, v in list(pdf_arts.items())[:3]:
        print(f"  PDF Art.{k}: {v[:80]!r}")


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
    range_note = ""
    if result.get("article_range"):
        r = result["article_range"]
        range_note = f"  \n**Article range filter:** Arts.{r[0]}–{r[1]}"
    lines = [
        f"# Diff Report: {result['md_file']}",
        "",
        f"**PDF text source:** `{result['pdf_text_file']}`  ",
        f"**Total articles compared:** {result['total_articles']}{range_note}  ",
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
        score_str = f"{art['score']*100:.1f}%" if art["score"] is not None else "\u2014"
        flag = "\u2705" if art["status"] == "MATCH" else (
            "\u26a0\ufe0f" if art["status"] == "PARTIAL" else (
            "\u274c" if art["status"] == "MISMATCH" else "\U0001f535"
        ))
        lines.append(f"### {flag} Article {art['article']} \u2014 `{art['status']}` ({score_str})")
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
    p.add_argument("--out-dir", default=".", help="Output directory for reports")
    p.add_argument("--diagnose", action="store_true",
                   help="Print extraction counts + snippets (single mode only)")
    p.add_argument("--article-range", nargs=2, type=int, metavar=("START", "END"),
                   help="Filter PDF articles to this inclusive range (single mode only)")
    return p.parse_args()


def run_single(md_path: Path, pdf_text_path: Path, out_dir: Path,
               diagnose_mode: bool = False,
               article_range: list | None = None) -> dict:
    if diagnose_mode:
        diagnose(md_path, pdf_text_path)
    result = diff_document(md_path, pdf_text_path, article_range=article_range)
    json_out = write_json(result, out_dir)
    md_out = write_md_report(result, out_dir)
    range_tag = f" [Arts.{article_range[0]}-{article_range[1]}]" if article_range else ""
    print(f"[{result['overall_status']}] {md_path.name}{range_tag}  match={result['match_rate']*100:.1f}%")
    print(f"  JSON  -> {json_out}")
    print(f"  MD    -> {md_out}")
    return result


def run_batch(queue_path: Path, out_dir: Path) -> None:
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    pairs = queue if isinstance(queue, list) else queue.get("pairs", [])

    legal_refs = queue_path.parent.parent
    md_roots = [legal_refs / "md", legal_refs, queue_path.parent]
    txt_roots = [legal_refs / "pdf", legal_refs, queue_path.parent]

    summary = []
    no_txt_count = 0

    for entry in pairs:
        md_file = entry.get("md") or entry.get("markdown")
        pdf_file = entry.get("pdf_text") or entry.get("pdf")
        # W101: read article_range from queue entry if present
        article_range = entry.get("article_range")  # e.g. [1, 164] or None
        if not md_file:
            print(f"[SKIP] Missing md field: {entry}", file=sys.stderr)
            continue

        md_path = resolve_md(md_file, md_roots)
        if not md_path:
            print(f"[SKIP] MD not found: {md_file}", file=sys.stderr)
            continue

        pdf_txt_path = resolve_pdf_txt(pdf_file, txt_roots) if pdf_file else None
        if not pdf_txt_path:
            print(f"[NO-TXT] No .txt extract for: {pdf_file or '(none)'}  \u2014 run PDF extraction first (W98)")
            no_txt_count += 1
            continue

        result = run_single(md_path, pdf_txt_path, out_dir, article_range=article_range)
        summary.append({
            "md": md_file,
            "overall_status": result["overall_status"],
            "match_rate": result["match_rate"],
            "counts": result["counts"],
        })

    summary_path = out_dir / "diff_batch_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nBatch complete. Summary -> {summary_path}")
    pass_count = sum(1 for r in summary if r["overall_status"] == "PASS")
    print(f"PASS: {pass_count}/{len(summary)}")
    if no_txt_count:
        print(f"[NO-TXT]: {no_txt_count} entries skipped \u2014 PDF plain-text extracts missing.")


def main() -> None:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.md:
        if not args.pdf_text:
            print("ERROR: --pdf-text required with --md", file=sys.stderr)
            sys.exit(1)
        md_path = Path(args.md)
        if not md_path.exists():
            candidate = Path("legal_refs") / "md" / md_path.name
            if candidate.exists():
                md_path = candidate
            else:
                print(f"ERROR: MD file not found: {args.md}", file=sys.stderr)
                sys.exit(1)
        article_range = args.article_range  # None or [start, end]
        run_single(md_path, Path(args.pdf_text), out_dir,
                   diagnose_mode=args.diagnose,
                   article_range=article_range)
    else:
        run_batch(Path(args.batch), out_dir)


if __name__ == "__main__":
    main()
