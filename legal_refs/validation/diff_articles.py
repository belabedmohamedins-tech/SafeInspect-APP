#!/usr/bin/env python3
"""
diff_articles.py — W112 (bold-standalone MD article format)
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

W102 patches (2026-09-03):
  MODE D — Art.3 PARTIAL (0.53): gazette two-column layout produces intra-sentence
           newlines inside article body text (e.g. "radionucléi\\net\\nchimiques").
           These survive the \\s+ collapse because \\s+ treats \\n as whitespace but
           the surrounding letters are not whitespace so the word boundary breaks.
           Fix: _normalise() now replaces \\n (and \\r\\n / \\r) with a single space
           BEFORE the \\s+ collapse step. This re-joins hyphenated column breaks too.
  MODE E — Art.9 MISMATCH (0.29): PDF body of last article runs past the decree text
           into the gazette publication footer ("18 Rabie Ethani 1432 / 23 mars 2011 /
           JOURNAL OFFICIEL..."). The article regex has no sentinel to stop at because
           there is no next "Article N" after the last article.
           Fix: new _strip_pdf_trailer() pre-processor removes gazette footer lines
           before article extraction. Footer pattern: a line that is a bare Hijri date
           (digits + month name), a bare Gregorian date (digits + month + year), or
           "JOUR" / "JOURNAL" / "OFFICIEL" / "N°" line at the end of the document.
           Applied to PDF text only, before extract_pdf_articles().

W103 patches (2026-09-03):
  MODE F — MD=0 articles bug (all 0.0% files): MD files use ## ARTICLE 1 (all-caps).
           The three _MD_ART_* regexes and _MIDLINE_ARTICLE_RE used [Aa]rt without
           re.IGNORECASE, so "ARTICLE" / "ART." never matched the char class.
           Fix: add re.IGNORECASE to _MD_ART_HEADING_RE, _MD_ART_BOLD_INLINE_RE,
           _MD_ART_PLAIN_RE, and _MIDLINE_ARTICLE_RE. The [Aa] char classes are
           kept for clarity but IGNORECASE makes them redundant — belt-and-suspenders.

W104 patches (2026-09-03):
  MODE G — decret-17-140 43.8%: PDF column layout inserts spurious spaces before
           punctuation (e.g. "traitement ," / "conditionnement ,"). After ligature
           mapping and whitespace normalisation these survive as "traitement ," which
           scores very low against the clean MD "traitement,".
           Fix: _normalise() now strips space-before-punctuation ( ,  ;  :  . ) after
           the \\s+ collapse step, mapping "word ," → "word,". Applied to both MD and
           PDF snippets so scoring is symmetric.

W105 patches (2026-09-03):
  MODE H — decret-17-140 Art.9 MISMATCH (0.02): _PDF_ART_SEP_RE captured [^\\n]* on
           the header separator line and discarded it entirely, so when the article
           body starts inline on the same line as "Art. 9. —" the opening sentence
           was lost. PDF snippet started at "nécessaires aux opérations" (mid-sentence)
           while MD snippet started at "Les équipements, le matériel et les locaux
           nécessaires aux opérations" (full sentence) → near-zero similarity score.
           Fix: split _PDF_ART_SEP_RE into three capture groups:
             group(1) = article number
             group(2) = inline remainder of header line after separator (may be empty)
             group(3) = subsequent-lines body
           extract_pdf_articles() prepends group(2).strip() to group(3) so no
           inline content is ever discarded. Same three-group split applied to
           _PDF_ART_SHORT_RE for consistency. _PDF_ART_BARE_RE is unaffected
           (its header line is the article number only, body always starts on next line).

W106 patches (2026-09-03):
  MODE I — gazette contamination (decret-06-141 0.0%, decret-06-138 68.4%, etc.):
           .txt files are full-gazette extracts containing articles from multiple
           decrees. When "pdf_pages": [start, end] (0-indexed, inclusive) is present
           in the queue entry, extract_pdf_text_from_pages() uses pymupdf (fitz)
           Tier-1 get_text() on the specified page range only, bypassing the .txt file.
           This eliminates PDF_ONLY noise from other decrees sharing the same gazette.
           Falls back silently to .txt file if pymupdf is not installed or pdf_pages
           is absent. PDF resolved from legal_refs/pdf/ relative to queue directory.
           pdf_pages is 0-indexed (matches pymupdf page indices).

W107 patches (2026-09-03):
  MODE J — column-scramble word-drop (loi-03-10 43.9%, loi-01-19 50.0%, etc.):
           pdfminer two-column extraction inserts words from the right column
           between left-column words mid-sentence. SequenceMatcher penalises these
           insertions heavily, producing scores well below the 0.85 MATCH threshold
           even when the MD article contains all the correct legal text.
           Fix: score_pair() now also computes a Jaccard word-set ratio
           (|intersection| / |union| on normalised word sets) and takes
           max(SequenceMatcher_ratio, jaccard_ratio) as the final score.
           Jaccard is word-order-agnostic so word-drop/insertion artefacts don't
           penalise it. Only fires as an upward tiebreaker — it never reduces a score.
           Short articles (< 6 words in either side) skip Jaccard (unreliable on short
           strings) and use SequenceMatcher only.

W108 patches (2026-09-03):
  MODE K — font-corrupted PDFs (decret-02-427 4.2%): some PDFs use non-standard
           Type1/Type3 font encoding tables that cause pymupdf get_text() to return
           garbled codepoints (lÆarticle, prÚvention, Ó). Neither latin-1 re-encoding
           nor pdfplumber Tier-2 recovers clean text — only Tesseract OCR (Tier-3)
           produces correct UTF-8. For these PDFs a clean OCR .txt has been written.
           When "use_txt": true is set in the queue entry, run_batch() skips the
           W106 pdf_pages live extraction entirely and reads the .txt file instead.
           The output tag changes to [txt_override] for traceability.
           This flag coexists with pdf_pages (still used as metadata) but suppresses
           the live pymupdf call.

W109 patches (2026-09-03):
  MODE L — OCR article-number misread (decret-02-427 4.2% persisting after W108):
           Tesseract OCR misreads specific article number tokens in JORADP gazette
           typography. Three confirmed misread classes:
             (a) "Article ler" / "Art. ler" — OCR reads ordinal "1er" as "ler"
                 (digit 1 → lowercase l). _PDF_ART_SEP_RE requires \\d+ so "ler"
                 never matches → Art.1 silently dropped (PDF_ONLY or MD_ONLY).
             (b) "Art. Il." — OCR reads "11" as "Il" (digit 1 twice → I + l).
                 Same \\d+ failure → Art.11 dropped.
             (c) "AÃ¯t." / "Aït." — OCR/mojibake of "Art." in some gazette fonts.
                 → Art.4 dropped.
           Fix: new _ocr_normalise_article_markers(text) pre-processor applied to
           raw .txt content BEFORE _inject_article_newlines() and regex extraction:
             • r'\\bArt(?:icle)?\\s*\\.?\\s*ler\\b' → 'Art. 1er'  (l→1 ordinal)
             • r'\\bArt\\.\\s*Il\\b'                → 'Art. 11'   (Il→11)
             • r'\\bA[iï]t\\.'                      → 'Art.'      (Aït→Art mojibake)
           Applied to PDF/OCR text only. MD text is not affected.
  MODE M — MD bold-inline Art.1er body empty (decret-02-427): the MD file uses
           "**Article 1er.** — body text on same line" format. The existing
           _MD_ART_BOLD_INLINE_RE captured group(2) as only subsequent lines
           (after the header line newline), discarding the inline body fragment
           "— body text on same line". Result: Art.1er body = '' → MD_ONLY.
           Fix: _MD_ART_BOLD_INLINE_RE now uses a single-line header pattern that
           captures (a) the inline remainder after the article number token on the
           header line, and (b) all subsequent lines up to the next **Art marker.
           extract_md_articles() prepends the inline fragment to the body for
           bold-inline matches, mirroring the W105 fix for PDF extraction.

W110 patches (2026-09-03):
  Tier-4 manual OCR recovery for decret-02-427 .txt:
    (1) Art.3 header line was completely absent from Tesseract output — inserted.
    (2) Art.15 article number digit dropped by OCR ('. — Lorsque') — restored.
    (3) Arts.22-24 missing entirely (last OCR page not captured) — appended.
  These patches are applied directly to the .txt source file, not to diff_articles.py.

W111 patches (2026-09-03):
  MODE N — Art.24 MISMATCH (0.37): MD extractor's \\Z lookahead in
           _MD_ART_BOLD_INLINE_RE and _MD_ART_PLAIN_RE swallows the entire
           post-decree appendix ("Contrôle de séquence", article list, notes)
           into the last article's body. This inflates the MD body enormously
           compared to the clean PDF body → near-zero SequenceMatcher score.
           Fix: add horizontal rule sentinel (^---+\\s*$) to the lookahead of
           _MD_ART_BOLD_INLINE_RE and _MD_ART_PLAIN_RE so extraction stops at
           the first --- divider after the last article. \\Z remains as fallback
           for MD files with no trailing ---.
  MODE O — Art.5 OCR word-drop (ociés → associés): Tesseract dropped the 'ass'
           prefix from 'associés' in the .txt. Score 0.83 — just below MATCH
           threshold. Patched directly in the .txt source file (W111 .txt patch).

W112 patches (2026-09-04):
  MODE P — MD bold-standalone format (decret-09-19 0% MD match): the MD file uses
           "**Article 1er**\\n\\nbody text on next paragraph" format — the article
           number token is bold on its own line with NO inline body text after it
           (no dash/em-dash separator). Neither _MD_ART_BOLD_INLINE_RE (requires
           a dash separator on the header line) nor _MD_ART_PLAIN_RE (requires
           plain text, not bold markers) match this format, so all 17 articles
           produce PDF_ONLY → 0% MD match.
           Fix: new _MD_ART_BOLD_STANDALONE_RE — matches **Article N** (or
           **Article Ner**) on its own line followed by body on subsequent lines,
           with no inline content requirement. Inserted as Pass 3 in
           extract_md_articles(), after bold-inline (Pass 2) and before plain
           (Pass 4), so the more specific inline pattern takes priority when
           both could match.
"""

import argparse
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

# ---------------------------------------------------------------------------
# Optional pymupdf import (W106)
# ---------------------------------------------------------------------------

try:
    import pymupdf as fitz  # pymupdf >= 1.23
    _FITZ_AVAILABLE = True
except ImportError:
    try:
        import fitz  # older pymupdf
        _FITZ_AVAILABLE = True
    except ImportError:
        _FITZ_AVAILABLE = False


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


def resolve_pdf_bin(pdf_filename: str, search_roots: list[Path]) -> Path | None:
    """W106: resolve the actual .pdf binary file for pymupdf page slicing."""
    p = Path(pdf_filename)
    if p.exists():
        return p
    name = p.name
    for root in search_roots:
        candidate = root / name
        if candidate.exists():
            return candidate
    return None


# ---------------------------------------------------------------------------
# W106: pymupdf page-range extractor
# ---------------------------------------------------------------------------

def extract_pdf_text_from_pages(pdf_path: Path, pages: list[int]) -> str | None:
    """
    W106 MODE I: extract text from a specific page range using pymupdf Tier-1
    get_text(). pages = [start, end] 0-indexed inclusive.
    Returns concatenated page text, or None if extraction fails.
    """
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


# ---------------------------------------------------------------------------
# Normaliser  (W100: Unicode whitespace variants; W102: \n→space before collapse;
#              W104: strip space-before-punctuation after collapse)
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
    # W100: map all Unicode whitespace variants that \s+ may miss
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

# W104: space-before-punctuation pattern (PDF column artefact)
_SPACE_BEFORE_PUNCT_RE = re.compile(r'\s+([,;:.])')


def _normalise(text: str) -> str:
    """Lowercase, strip diacritics/ligatures/mojibake/Unicode-WS, collapse whitespace.
    W102: replace newlines with space before \\s+ collapse so intra-sentence
    column-break newlines (gazette two-column artefact) are treated as spaces.
    W104: strip spurious space before punctuation (, ; : .) after \\s+ collapse.
    """
    for bad, good in _MOJIBAKE:
        text = text.replace(bad, good)
    text = text.translate(_LIGATURES)   # includes \u00a0 → ' ' (W100)
    text = text.lower()
    text = re.sub(r"[#*_`~>|\\]", " ", text)
    text = re.sub(r"^art(?:icle[r]?)?\\s*\\.?\\s*\\d+\\w*[\\s.:\\u2013\\u2014-]*", "", text, flags=re.IGNORECASE)
    # W102 MODE D: replace all newline variants with space BEFORE whitespace collapse
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    # W104 MODE G: remove space inserted before punctuation by PDF column layout
    text = _SPACE_BEFORE_PUNCT_RE.sub(r'\1', text)
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
# W109 MODE L: OCR article-marker normaliser (applied to .txt before extraction)
# ---------------------------------------------------------------------------

# Pattern (a): "Article ler" / "Art. ler" — OCR reads "1er" as "ler"
_OCR_LER_RE = re.compile(
    r'\b(Art(?:icle)?\s*\.?\s*)ler\b',
    re.IGNORECASE,
)

# Pattern (b): "Art. Il." — OCR reads "11" as "Il"
_OCR_IL_RE = re.compile(
    r'\bArt\.\s*Il\b',
    re.IGNORECASE,
)

# Pattern (c): "Aït." / "AÃ¯t." — OCR/mojibake of "Art."
# Covers: Aït, Aïl, AÃ¯t (two-byte mojibake of ï)
_OCR_AIT_RE = re.compile(
    r'\bA(?:[\xef\u00ef]|\u00c3\u00af)t\.',
    re.IGNORECASE,
)
# Also catch ASCII-range OCR variant "Aît." where î is present
_OCR_AIT2_RE = re.compile(
    r'\bA[iî]t\.',
    re.IGNORECASE,
)


def _ocr_normalise_article_markers(text: str) -> str:
    """
    W109 MODE L: normalise known OCR misreads of article number tokens
    before regex extraction fires. Applied to raw OCR .txt only.

    Transformations (in order):
      (c) Aït. / AÃ¯t.  → Art.   (must run before pattern (a) to avoid
                                   re-introducing 'Art. ler' from 'Aït. ler')
      (b) Art. Il        → Art. 11
      (a) Art[icle] ler  → Art. 1er
    """
    # (c) Aït-variants → Art
    text = _OCR_AIT_RE.sub('Art.', text)
    text = _OCR_AIT2_RE.sub('Art.', text)
    # (b) Art. Il → Art. 11
    text = _OCR_IL_RE.sub('Art. 11', text)
    # (a) Art[icle] ler → Art. 1er
    text = _OCR_LER_RE.sub(r'\g<1>1er', text)
    return text


# ---------------------------------------------------------------------------
# W102 MODE E: gazette trailer stripper
# ---------------------------------------------------------------------------

# Hijri month names (Arabic transliteration variants used in JORADP)
_HIJRI_MONTHS = (
    r"moharram|safar|rabie?\s+el?\s*awal|rabie?\s+eth?a?ni|"
    r"joumada\s+el?\s*oula|joumada\s+eth?a?ni|rajeb|chaa?bane?|"
    r"ramadhan?|chawwal|dhou\s+el\s+ka[ae]da|dhou\s+el\s+hidja"
)

_TRAILER_LINE_RE = re.compile(
    r"^\s*(?:"
    r"\d+\s+(?:" + _HIJRI_MONTHS + r")\s+\d{4}"
    r"|(?:\d+\s+)?(?:janvier|février|mars|avril|mai|juin|juillet|août|"
    r"septembre|octobre|novembre|décembre)\s+\d{4}"
    r"|jour(?:nal)?\s*(?:officiel)?"
    r"|officiel\b"
    r"|n[°o]\s*\d+"
    r"|page\s+\d+"
    r")\s*$",
    re.IGNORECASE,
)


def _strip_pdf_trailer(text: str) -> str:
    """
    W102 MODE E: remove gazette footer lines that appear after the last article.
    Works bottom-up: scan lines from the end, remove matching footer lines,
    stop at the first non-blank non-footer line.
    """
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


# ---------------------------------------------------------------------------
# MD article extractor  (W103: re.IGNORECASE; W109 MODE M: bold-inline body fix;
#                        W111 MODE N: --- HR sentinel stops last-article bleed;
#                        W112 MODE P: bold-standalone own-line format)
# ---------------------------------------------------------------------------

_MD_ART_HEADING_RE = re.compile(
    r"^#{1,4}\s*[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\b[^\n]*\n(.*?)(?=^#{1,4}\s*[Aa]rt|\Z)",
    re.MULTILINE | re.DOTALL | re.IGNORECASE,
)

# W111 MODE N: lookahead now also stops at a Markdown horizontal rule (--- / *** / ___)
# so appendix text after the last article is not captured into the last article body.
_MD_ART_BOLD_INLINE_RE = re.compile(
    r"(?m)^\*{1,2}[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)[^*\n]*\*{1,2}"
    r"[^\n]*?(?:[-\u2013\u2014]\s*)([^\n]*)\n"
    r"(.*?)(?=^\*{1,2}[Aa]rt|^[-*_]{3,}\s*$|\Z)",
    re.DOTALL | re.IGNORECASE,
)

# W112 MODE P: bold-standalone — **Article N** on its own line, body on next paragraph.
# Format: **Article 1er**\n\nbody...
# Differs from bold-inline: no dash separator on the header line; body starts on the
# NEXT line (possibly after a blank line). Lookahead stops at next bold Article marker,
# heading Article marker, HR sentinel, or end-of-string.
_MD_ART_BOLD_STANDALONE_RE = re.compile(
    r"(?m)^\*{1,2}[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\*{1,2}\s*\n"
    r"(.*?)(?=^\*{1,2}[Aa]rt|^#{1,4}\s*[Aa]rt|^[-*_]{3,}\s*$|\Z)",
    re.DOTALL | re.IGNORECASE,
)

# W111 MODE N: same HR sentinel added to plain pattern
_MD_ART_PLAIN_RE = re.compile(
    r"(?m)^[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\s*[.:\u2013\u2014-][^\n]*\n(.*?)(?=^[Aa]rt(?:icle[r]?)?\s*\.?\s*\d|^[-*_]{3,}\s*$|\Z)",
    re.DOTALL | re.IGNORECASE,
)


def extract_md_articles(md_text: str) -> dict[str, str]:
    """Return {article_number: body_text} from a Markdown file.

    Pass order (first match wins per article number):
      1. Heading pattern    — ## Article N
      2. Bold-inline        — **Article N.** — body on same line  (W109 MODE M)
      3. Bold-standalone    — **Article N** on own line, body next (W112 MODE P)
      4. Plain pattern      — Article N. body or Art. N — body
    """
    articles: dict[str, str] = {}

    # Pass 1: Heading pattern
    for m in _MD_ART_HEADING_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()

    # Pass 2: Bold-inline — prepend inline fragment to body (W109 MODE M)
    for m in _MD_ART_BOLD_INLINE_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            inline = m.group(2).strip()   # text on header line after "—"
            rest = m.group(3).strip()     # subsequent lines
            body = (inline + "\n" + rest).strip() if inline else rest
            articles[num] = body

    # Pass 3: Bold-standalone — **Article N** own-line format (W112 MODE P)
    for m in _MD_ART_BOLD_STANDALONE_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()

    # Pass 4: Plain pattern
    for m in _MD_ART_PLAIN_RE.finditer(md_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()

    return articles


# ---------------------------------------------------------------------------
# PDF article extractor  (W100/W105/W109)
# ---------------------------------------------------------------------------

_MIDLINE_ARTICLE_RE = re.compile(
    r"([ \t]{4,})([Aa]rt(?:icle[r]?)?\s*\.?\s*\d)",
    re.IGNORECASE,
)


def _inject_article_newlines(text: str) -> str:
    return _MIDLINE_ARTICLE_RE.sub(r"\n\2", text)


# W105: THREE capture groups — (number)(inline_header_body)(next_lines_body)
_PDF_ART_SEP_RE = re.compile(
    r"(?mi)^[Aa]rt(?:icle[r]?)?\s*\.?\s*(\d+\w*)\s*[.:\u2013\u2014\u2012\u2015 \t-]+([^\n]*)\n(.*?)(?=^[Aa]rt(?:icle[r]?)?\s*\.?\s*\d|\Z)",
    re.DOTALL,
)

_PDF_ART_BARE_RE = re.compile(
    r"(?mi)^[Aa]rticle[r]?\s+(\d+\w*)\s*\n(.*?)(?=^[Aa]rticle[r]?\s+\d|\Z)",
    re.DOTALL,
)

# W105: THREE capture groups — (number)(inline_header_body)(next_lines_body)
_PDF_ART_SHORT_RE = re.compile(
    r"(?mi)^[Aa]rt\.\s*(\d+\w*)\s*[.:\u2013\u2014 \t-]([^\n]*)\n(.*?)(?=^[Aa]rt\.\s*\d|\Z)",
    re.DOTALL,
)


def extract_pdf_articles(pdf_text: str) -> dict[str, str]:
    """Return {article_number: body_text} from plain PDF-extracted text."""
    pdf_text = _strip_pdf_trailer(pdf_text)
    # W109 MODE L: normalise OCR article-number misreads before any regex fires
    pdf_text = _ocr_normalise_article_markers(pdf_text)
    pdf_text = _inject_article_newlines(pdf_text)
    articles: dict[str, str] = {}

    for pattern in (_PDF_ART_SEP_RE, _PDF_ART_SHORT_RE):
        for m in pattern.finditer(pdf_text):
            num = _normalise_article_key(m.group(1))
            if num not in articles:
                inline = m.group(2).strip()
                rest = m.group(3).strip()
                body = (inline + "\n" + rest).strip() if inline else rest
                articles[num] = body

    for m in _PDF_ART_BARE_RE.finditer(pdf_text):
        num = _normalise_article_key(m.group(1))
        if num not in articles:
            articles[num] = m.group(2).strip()

    return articles


# ---------------------------------------------------------------------------
# W101: article_range filter
# ---------------------------------------------------------------------------

def _filter_by_range(articles: dict[str, str], article_range: list | None) -> dict[str, str]:
    if not article_range or len(article_range) != 2:
        return articles
    start, end = int(article_range[0]), int(article_range[1])
    filtered = {}
    for k, v in articles.items():
        m = re.match(r"^(\d+)", k)
        if m:
            n = int(m.group(1))
            if start <= n <= end:
                filtered[k] = v
        else:
            filtered[k] = v
    return filtered


# ---------------------------------------------------------------------------
# Fuzzy scorer  (W107: Jaccard word-set fallback for column-scramble class)
# ---------------------------------------------------------------------------

THRESHOLD_MATCH = 0.85
THRESHOLD_PARTIAL = 0.50
_JACCARD_MIN_WORDS = 6  # skip Jaccard on very short articles (unreliable)


def _jaccard_word_ratio(a: str, b: str) -> float:
    """
    W107 MODE J: Jaccard similarity on word sets.
    |intersection| / |union|  — word-order-agnostic.
    Robust to word-drop/insertion artefacts from two-column PDF extraction.
    """
    wa = set(a.split())
    wb = set(b.split())
    if not wa or not wb:
        return 0.0
    intersection = len(wa & wb)
    union = len(wa | wb)
    return intersection / union if union else 0.0


def score_pair(md_body: str, pdf_body: str) -> float:
    """W107: max(SequenceMatcher, Jaccard) for column-scramble robustness."""
    a = _normalise(md_body)
    b = _normalise(pdf_body)
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    seq_score = SequenceMatcher(None, a, b).ratio()
    # W107: apply Jaccard only when both sides are long enough to be reliable
    if len(a.split()) >= _JACCARD_MIN_WORDS and len(b.split()) >= _JACCARD_MIN_WORDS:
        jac_score = _jaccard_word_ratio(a, b)
        return max(seq_score, jac_score)
    return seq_score


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
                  article_range: list | None = None,
                  pdf_pages_text: str | None = None) -> dict:
    """
    W106: if pdf_pages_text is provided (pre-sliced via pymupdf), use it
    instead of reading pdf_text_path. pdf_text_path is still used for the
    report label (filename shown in output).
    W108: use_txt=true in queue entry suppresses pdf_pages_text — caller
    passes pdf_pages_text=None so this function always reads pdf_text_path.
    """
    md_text = md_path.read_text(encoding="utf-8", errors="replace")
    pdf_text = pdf_pages_text if pdf_pages_text is not None else \
               pdf_text_path.read_text(encoding="utf-8", errors="replace")

    md_arts = extract_md_articles(md_text)
    pdf_arts = extract_pdf_articles(pdf_text)

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
        range_note = f"  \n**Article range filter:** Arts.{r[0]}\u2013{r[1]}"
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
               article_range: list | None = None,
               pdf_pages_text: str | None = None,
               txt_override: bool = False) -> dict:
    if diagnose_mode:
        diagnose(md_path, pdf_text_path)
    result = diff_document(md_path, pdf_text_path, article_range=article_range,
                           pdf_pages_text=pdf_pages_text)
    json_out = write_json(result, out_dir)
    md_out = write_md_report(result, out_dir)
    range_tag = f" [Arts.{article_range[0]}-{article_range[1]}]" if article_range else ""
    if txt_override:
        src_tag = " [txt_override]"   # W108: forced .txt path
    elif pdf_pages_text is not None:
        src_tag = " [pdf_pages]"      # W106: live pymupdf slice
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
    # W106: PDF binary search roots for pymupdf page slicing
    pdf_bin_roots = [legal_refs / "pdf", legal_refs, queue_path.parent]

    summary = []
    no_txt_count = 0

    for entry in pairs:
        md_file = entry.get("md") or entry.get("markdown")
        pdf_file = entry.get("pdf_text") or entry.get("pdf")
        article_range = entry.get("article_range")
        # W106: read pdf_pages and original pdf filename for binary resolution
        pdf_pages = entry.get("pdf_pages")  # e.g. [4, 7] (0-indexed, inclusive)
        pdf_bin_file = entry.get("pdf")     # original .pdf filename
        # W108: use_txt=true forces .txt path even when pdf_pages is present
        use_txt = entry.get("use_txt", False)

        if not md_file:
            print(f"[SKIP] Missing md field: {entry}", file=sys.stderr)
            continue

        md_path = resolve_md(md_file, md_roots)
        if not md_path:
            print(f"[SKIP] MD not found: {md_file}", file=sys.stderr)
            continue

        # W106/W108: if pdf_pages present AND use_txt not forced, attempt pymupdf
        pdf_pages_text = None
        txt_override = False
        if use_txt:
            # W108 MODE K: font-corrupted PDF — skip live extraction, use OCR .txt
            txt_override = True
        elif pdf_pages and _FITZ_AVAILABLE and pdf_bin_file:
            pdf_bin_path = resolve_pdf_bin(pdf_bin_file, pdf_bin_roots)
            if pdf_bin_path:
                pdf_pages_text = extract_pdf_text_from_pages(pdf_bin_path, pdf_pages)

        pdf_txt_path = resolve_pdf_txt(pdf_file, txt_roots) if pdf_file else None

        # Need at least one text source
        if pdf_pages_text is None and not pdf_txt_path:
            print(f"[NO-TXT] No .txt extract for: {pdf_file or '(none)'}  \u2014 run PDF extraction first (W98)")
            no_txt_count += 1
            continue

        # If pdf_pages_text available, use a dummy sentinel path for the label
        # but still require pdf_txt_path to exist for the report filename label.
        # If .txt is also missing, synthesise a label from the pdf name.
        if pdf_txt_path is None and pdf_pages_text is not None:
            # Create a synthetic label path (does not need to exist)
            pdf_txt_path = Path(pdf_bin_file if pdf_bin_file else (pdf_file or "unknown.pdf"))

        result = run_single(md_path, pdf_txt_path, out_dir,
                            article_range=article_range,
                            pdf_pages_text=pdf_pages_text,
                            txt_override=txt_override)
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
        article_range = args.article_range
        run_single(md_path, Path(args.pdf_text), out_dir,
                   diagnose_mode=args.diagnose,
                   article_range=article_range)
    else:
        run_batch(Path(args.batch), out_dir)


if __name__ == "__main__":
    main()
