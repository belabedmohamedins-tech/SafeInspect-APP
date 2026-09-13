#!/usr/bin/env python3
"""
diff_articles.py — W113 (canonical non-overlapping PDF article extraction)
Fuzzy diff engine: compare indexed MD articles vs PDF-extracted text.

Usage:
  python diff_articles.py --md <file.md> --pdf-text <file.txt> [--out-dir
<dir>]
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

Depends only on stdlib + optional pymupdf: difflib, re, json, pathlib, argparse.

W113 patches (2026-09-13):
  MODE Q — canonical PDF article extraction: replaces the three overlapping
           PDF article regex passes with one ordered, non-overlapping matcher.
           Accepts "Article15" (no space), "Article 15", "Article 15 —",
           "Art.15", and "Art 15" forms. Each article span ends at the next
           canonical marker or end-of-text, preventing duplicate/overlapping
           captures from competing patterns. Existing W105 inline-header-body
           preservation and W106 pdf_pages Tier-1 slicing remain unchanged.
"""

import argparse
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

try:
    import pymupdf as fitz
    _FITZ_AVAILABLE = True
except ImportError:
    try:
        import fitz
        _FITZ_AVAILABLE = True
    except ImportError:
        _FITZ_AVAILABLE = False


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


def resolve_pdf_bin(pdf_filename: str, search_roots: list[Path]) -> Path | None:
    p = Path(pdf_filename)
    if p.exists():
        return p
    name = p.name
    for root in search_roots:
        candidate = root / name
        if candidate.exists():
            return candidate
    return None


def extract_pdf_text_from_pages(pdf_path: Path, pages: list[int]) -> str | None:
    if not _FITZ_AVAILABLE:
        return None
    try:
        doc = fitz.open(str(pdf_path))
        start = int(pages[0])
        end = min(int(pages[1]), len(doc) - 1)
        parts = []
        for i in range(start, end + 1):
            parts.append(doc[i].get_text())
        doc.close()
        return "\n".join(parts)
    except Exception:
        return None


_LIGATURES = str.maketrans({
    "\u0153": "oe", "\u0152": "OE", "\u00e6": "ae", "\u00c6": "AE",
    "\u00df": "ss", "\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"',
    "\u2013": "-", "\u2014": "-", "\u00ab": '"', "\u00bb": '"',
    "\u00e9": "e", "\u00e8": "e", "\u00ea": "e", "\u00eb": "e",
    "\u00e0": "a", "\u00e2": "a", "\u00e4": "a", "\u00ee": "i", "\u00ef": "i",
    "\u00f4": "o", "\u00f6": "o", "\u00f9": "u", "\u00fb": "u", "\u00fc": "u",
    "\u00e7": "c", "\u00c9": "E", "\u00c8": "E", "\u00ca": "E", "\u00c0": "A",
    "\u00c2": "A", "\u00ce": "I", "\u00d4": "O", "\u00d9": "U", "\u00db": "U",
    "\u00dc": "U", "\u00c7": "C", "\u00a0": " ", "\u202f": " ", "\u2009": " ",
    "\u2002": " ", "\u2003": " ", "\u2007": " ", "\u2008": " ", "\u200b": "", "\ufeff": "",
})

_MOJIBAKE = [
    ("\u00c3\u00a9", "e"), ("\u00c3\u00a8", "e"), ("\u00c3\u00aa", "e"), ("\u00c3\u00a0", "a"),
    ("\u00c3\u00a2", "a"), ("\u00c3\u00ae", "i"), ("\u00c3\u00b4", "o"), ("\u00c3\u00b9", "u"),
    ("\u00c3\u00bb", "u"), ("\u00c3\u00a7", "c"), ("\u00c3\u0089", "E"), ("\u00c3\u0088", "E"),
    ("\u00c2\u00b0", ""), ("\u00e2\u0080\u0093", "-"), ("\u00e2\u0080\u0094", "-"), ("\u00e2\u0080\u0099", "'"),
]
_SPACE_BEFORE_PUNCT_RE = re.compile(r'\s+([,;:.])')


def _normalise(text: str) -> str:
    for bad, good in _MOJIBAKE:
        text = text.replace(bad, good)
    text = text.translate(_LIGATURES).lower()
    text = re.sub(r"[#*_`~>|\\]", " ", text)
    text = re.sub(r"^art(?:icle[r]?)?\s*\.?\s*\d+\w*[\s.:\u2013\u2014-]*", "", text, flags=re.IGNORECASE)
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return _SPACE_BEFORE_PUNCT_RE.sub(r'\1', text)


def _normalise_article_key(raw: str) -> str:
    num = raw.lower().lstrip("0") or "0"
    cleaned = re.sub(r"^(\d+)(?:è?re?|è?me?|e)$", r"\1", num)
    if re.fullmatch(r"\d+", cleaned):
        return str(int(cleaned))
    return cleaned


_OCR_LER_RE = re.compile(r'\b(Art(?:icle)?\s*\.?\s*)ler\b', re.IGNORECASE)
_OCR_IL_RE = re.compile(r'\bArt\.\s*Il\b', re.IGNORECASE)
_OCR_AIT_RE = re.compile(r'\bA(?:[\xef\u00ef]|\u00c3\u00af)t\.', re.IGNORECASE)
_OCR_AIT2_RE = re.compile(r'\bA[iî]t\.', re.IGNORECASE)


def _ocr_normalise_article_markers(text: str) -> str:
    text = _OCR_AIT_RE.sub('Art.', text)
    text = _OCR_AIT2_RE.sub('Art.', text)
    text = _OCR_IL_RE.sub('Art. 11', text)
    return _OCR_LER_RE.sub(r'\g<1>1er', text)


_HIJRI_MONTHS = (r"moharram|safar|rabie?\s+el?\s*awal|rabie?\s+eth?a?ni|joumada\s+el?\s*oula|joumada\s+eth?a?ni|rajeb|chaa?bane?|ramadhan?|chawwal|dhou\s+el\s+ka[ae]da|dhou\s+el\s+hidja")
_TRAILER_LINE_RE = re.compile(r"^\s*(?:\d+\s+(?:" + _HIJRI_MONTHS + r")\s+\d{4}|(?:\d+\s+)?(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}|jour(?:nal)?\s*(?:officiel)?|officiel\b|n[°o]\s*\d+|page\s+\d+)\s*$", re.IGNORECASE)


def _strip_pdf_trailer(text: str) -> str:
    lines = text.splitlines()
    cut = len(lines)
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i]
        if line.strip() == "":
            cut = i
            continue
        if _TRAILER_LINE_RE.match(line):
            cut = i
            continue
        break
    return "\n".join(lines[:cut])


_MD_ART_HEADING_RE = re.compile(r"^#{1,4}\s*[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\b[^\n]*\n(.*?)(?=^#{1,4}\s*[Aa]rt|\Z)", re.MULTILINE | re.DOTALL | re.IGNORECASE)
_MD_ART_BOLD_INLINE_RE = re.compile(r"(?m)^\*{1,2}[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)[^*\n]*\*{1,2}[^\n]*?(?:[-\u2013\u2014]\s*)([^\n]*)\n(.*?)(?=^\*{1,2}[Aa]rt|^[-*_]{3,}\s*$|\Z)", re.DOTALL | re.IGNORECASE)
_MD_ART_BOLD_STANDALONE_RE = re.compile(r"(?m)^\*{1,2}[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\*{1,2}\s*\n(.*?)(?=^\*{1,2}[Aa]rt|^#{1,4}\s*[Aa]rt|^[-*_]{3,}\s*$|\Z)", re.DOTALL | re.IGNORECASE)
_MD_ART_PLAIN_RE = re.compile(r"(?m)^[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\s*[.:\u2013\u2014-][^\n]*\n(.*?)(?=^[Aa]rt(?:icle[r]?)?\s*\.?\s*\d|^[-*_]{3,}\s*$|\Z)", re.DOTALL | re.IGNORECASE)


def extract_md_articles(md_text: str) -> dict[str, str]:
    articles: dict[str, str] = {}
    for m in _MD_ART_HEADING_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()
    for m in _MD_ART_BOLD_INLINE_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            inline, rest = m.group(2).strip(), m.group(3).strip()
            articles[num] = ((inline + "\n" + rest) if inline else rest).strip()
    for m in _MD_ART_BOLD_STANDALONE_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()
    for m in _MD_ART_PLAIN_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()
    return articles


# W113 MODE Q: one canonical marker, with no required whitespace after Article.
# The lookahead prevents spans from overlapping; the marker alternatives are ordered
# from the more specific "Article" form to the shorter "Art." form.
_PDF_CANONICAL_ARTICLE_RE = re.compile(
    r"(?mi)^[ \t]*(?:Article|Art\.)[ \t]*\.?[ \t]*(\d+\w*)"
    r"(?=[ \t]*(?:[.:\u2013\u2014\u2012\u2015-]|$))"
    r"[ \t]*[^\n]*\n(.*?)"
    r"(?=^[ \t]*(?:Article|Art\.)[ \t]*\.?[ \t]*\d+\w*(?=[ \t]*(?:[.:\u2013\u2014\u2012\u2015-]|$))|\Z)",
    re.DOTALL,
)


def extract_pdf_articles(pdf_text: str) -> dict[str, str]:
    pdf_text = _strip_pdf_trailer(pdf_text)
    pdf_text = _ocr_normalise_article_markers(pdf_text)
    articles: dict[str, str] = {}
    pdf_text = re.sub(r"(?mi)(?<!^)\b(Article|Art\.)[ \t]*\.?[ \t]*\d+\w*(?=[ \t]*(?:[.:\u2013\u2014\u2012\u2015-]|$))", r"\n\g<1>\g<0>", pdf_text)
    for m in _PDF_CANONICAL_ARTICLE_RE.finditer(pdf_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()
    return articles


# W101 article-range filter
def _filter_by_range(articles: dict[str, str], article_range: list | None) -> dict[str, str]:
    if not article_range or len(article_range) != 2:
        return articles
    start, end = int(article_range[0]), int(article_range[1])
    filtered = {}
    for k, v in articles.items():
        m = re.match(r"^(\d+)", k)
        if m and start <= int(m.group(1)) <= end:
            filtered[k] = v
        elif not m:
            filtered[k] = v
    return filtered


THRESHOLD_MATCH = 0.85
THRESHOLD_PARTIAL = 0.50
_JACCARD_MIN_WORDS = 6


def _jaccard_word_ratio(a: str, b: str) -> float:
    wa, wb = set(a.split()), set(b.split())
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


def score_pair(md_body: str, pdf_body: str) -> float:
    a, b = _normalise(md_body), _normalise(pdf_body)
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    seq_score = SequenceMatcher(None, a, b).ratio()
    if len(a.split()) >= _JACCARD_MIN_WORDS and len(b.split()) >= _JACCARD_MIN_WORDS:
        return max(seq_score, _jaccard_word_ratio(a, b))
    return seq_score


def classify(score: float) -> str:
    if score >= THRESHOLD_MATCH:
        return "MATCH"
    if score >= THRESHOLD_PARTIAL:
        return "PARTIAL"
    return "MISMATCH"


def diff_document(md_path: Path, pdf_text_path: Path, article_range: list | None = None, pdf_pages_text: str | None = None) -> dict:
    md_text = md_path.read_text(encoding="utf-8", errors="replace")
    pdf_text = pdf_pages_text if pdf_pages_text is not None else pdf_text_path.read_text(encoding="utf-8", errors="replace")
    md_arts = extract_md_articles(md_text)
    pdf_arts = extract_pdf_articles(pdf_text)
    if article_range:
        pdf_arts = _filter_by_range(pdf_arts, article_range)
    all_nums = sorted(set(md_arts) | set(pdf_arts), key=lambda x: (int(re.sub(r"\D", "", x) or 0), x))
    results = []
    counts = {"MATCH": 0, "PARTIAL": 0, "MISMATCH": 0, "MD_ONLY": 0, "PDF_ONLY": 0}
    for num in all_nums:
        in_md, in_pdf = num in md_arts, num in pdf_arts
        if in_md and in_pdf:
            score = score_pair(md_arts[num], pdf_arts[num])
            status = classify(score)
        elif in_md:
            score, status = None, "MD_ONLY"
        else:
            score, status = None, "PDF_ONLY"
        counts[status] += 1
        entry = {"article": num, "status": status, "score": round(score, 4) if score is not None else None, "in_md": in_md, "in_pdf": in_pdf}
        if status in ("PARTIAL", "MISMATCH"):
            entry["md_snippet"] = md_arts.get(num, "")[:200]
            entry["pdf_snippet"] = pdf_arts.get(num, "")[:200]
        results.append(entry)
    total = len(all_nums)
    match_rate = round(counts["MATCH"] / total, 4) if total else 0.0
    result = {"md_file": md_path.name, "pdf_text_file": pdf_text_path.name, "total_articles": total, "counts": counts, "match_rate": match_rate, "overall_status": ("PASS" if match_rate >= THRESHOLD_MATCH and counts["MISMATCH"] == 0 else "REVIEW_REQUIRED"), "articles": results}
    if article_range:
        result["article_range"] = article_range
    return result


def diagnose(md_path: Path, pdf_txt_path: Path) -> None:
    md_text = md_path.read_text(encoding="utf-8", errors="replace")
    pdf_text = pdf_txt_path.read_text(encoding="utf-8", errors="replace")
    md_arts = extract_md_articles(md_text)
    pdf_arts = extract_pdf_articles(pdf_text)
    print(f"MD  articles found: {len(md_arts)}  — keys: {sorted(md_arts)[:10]}")
    print(f"PDF articles found: {len(pdf_arts)} — keys: {sorted(pdf_arts)[:10]}")
    for k, v in list(md_arts.items())[:3]:
        print(f"  MD  Art.{k}: {v[:80]!r}")
    for k, v in list(pdf_arts.items())[:3]:
        print(f"  PDF Art.{k}: {v[:80]!r}")


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
    lines = [f"# Diff Report: {result['md_file']}", "", f"**PDF text source:** `{result['pdf_text_file']}`  ", f"**Total articles compared:** {result['total_articles']}{range_note}  ", f"**Match rate:** {result['match_rate']*100:.1f}%  ", f"**Overall status:** `{result['overall_status']}`", "", "## Summary", "", "| Status | Count |", "|--------|-------|"]
    for k, v in result["counts"].items():
        lines.append(f"| {k} | {v} |")
    lines += ["", "## Per-Article Results", ""]
    for art in result["articles"]:
        score_str = f"{art['score']*100:.1f}%" if art["score"] is not None else "—"
        flag = "✅" if art["status"] == "MATCH" else ("⚠️" if art["status"] == "PARTIAL" else ("❌" if art["status"] == "MISMATCH" else "🔵"))
        lines.append(f"### {flag} Article {art['article']} — `{art['status']}` ({score_str})")
        if art["status"] in ("PARTIAL", "MISMATCH"):
            lines += ["", f"**MD snippet:** {art.get('md_snippet', '')}", "", f"**PDF snippet:** {art.get('pdf_snippet', '')}", ""]
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Fuzzy diff MD articles vs PDF text extract.")
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--md", help="Path to Markdown file")
    mode.add_argument("--batch", help="Path to paired_audit_queue.json (batch mode)")
    p.add_argument("--pdf-text", help="Path to PDF plain-text extract (single mode)")
    p.add_argument("--out-dir", default=".", help="Output directory for reports")
    p.add_argument("--diagnose", action="store_true")
    p.add_argument("--article-range", nargs=2, type=int, metavar=("START", "END"))
    return p.parse_args()


def run_single(md_path: Path, pdf_text_path: Path, out_dir: Path, diagnose_mode: bool = False, article_range: list | None = None, pdf_pages_text: str | None = None, txt_override: bool = False) -> dict:
    if diagnose_mode:
        diagnose(md_path, pdf_text_path)
    result = diff_document(md_path, pdf_text_path, article_range=article_range, pdf_pages_text=pdf_pages_text)
    json_out = write_json(result, out_dir)
    md_out = write_md_report(result, out_dir)
    range_tag = f" [Arts.{article_range[0]}-{article_range[1]}]" if article_range else ""
    if txt_override:
        src_tag = " [txt_override]"
    elif pdf_pages_text is not None:
        src_tag = " [pdf_pages]"
    else:
        src_tag = ""
    print(f"[{result['overall_status']}] {md_path.name}{range_tag}{src_tag}  match={result['match_rate']*100:.1f}%")
    print(f"  JSON  -> {json_out}")
    print(f"  MD    -> {md_out}")
    return result


def run_batch(queue_path: Path, out_dir: Path) -> None:
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    pairs = queue if isinstance(queue, list) else queue.get("pairs", [])
    legal_refs = queue_path.parent.parent
    md_roots = [legal_refs / "md", legal_refs, queue_path.parent]
    txt_roots = [legal_refs / "pdf", legal_refs, queue_path.parent]
    pdf_bin_roots = [legal_refs / "pdf", legal_refs, queue_path.parent]
    summary = []
    no_txt_count = 0
    for entry in pairs:
        md_file = entry.get("md") or entry.get("markdown")
        pdf_file = entry.get("pdf_text") or entry.get("pdf")
        article_range = entry.get("article_range")
        pdf_pages = entry.get("pdf_pages")
        pdf_bin_file = entry.get("pdf")
        use_txt = entry.get("use_txt", False)
        if not md_file:
            print(f"[SKIP] Missing md field: {entry}", file=sys.stderr)
            continue
        md_path = resolve_md(md_file, md_roots)
        if not md_path:
            print(f"[SKIP] MD not found: {md_file}", file=sys.stderr)
            continue
        pdf_pages_text = None
        txt_override = False
        if use_txt:
            txt_override = True
        elif pdf_pages and _FITZ_AVAILABLE and pdf_bin_file:
            pdf_bin_path = resolve_pdf_bin(pdf_bin_file, pdf_bin_roots)
            if pdf_bin_path:
                pdf_pages_text = extract_pdf_text_from_pages(pdf_bin_path, pdf_pages)
        pdf_txt_path = resolve_pdf_txt(pdf_file, txt_roots) if pdf_file else None
        if pdf_pages_text is None and not pdf_txt_path:
            print(f"[NO-TXT] No .txt extract for: {pdf_file or '(none)'}  — run PDF extraction first (W98)")
            no_txt_count += 1
            continue
        if pdf_txt_path is None and pdf_pages_text is not None:
            pdf_txt_path = Path(pdf_bin_file if pdf_bin_file else (pdf_file or "unknown.pdf"))
        result = run_single(md_path, pdf_txt_path, out_dir, article_range=article_range, pdf_pages_text=pdf_pages_text, txt_override=txt_override)
        summary.append({"md": md_file, "overall_status": result["overall_status"], "match_rate": result["match_rate"], "counts": result["counts"]})
    summary_path = out_dir / "diff_batch_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nBatch complete. Summary -> {summary_path}")
    pass_count = sum(1 for r in summary if r["overall_status"] == "PASS")
    print(f"PASS: {pass_count}/{len(summary)}")
    if no_txt_count:
        print(f"[NO-TXT]: {no_txt_count} entries skipped — PDF plain-text extracts missing.")


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
        run_single(md_path, Path(args.pdf_text), out_dir, diagnose_mode=args.diagnose, article_range=args.article_range)
    else:
        run_batch(Path(args.batch), out_dir)


if __name__ == "__main__":
    main()
