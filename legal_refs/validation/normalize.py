#!/usr/bin/env python3
"""
normalize.py — Text normalisation for SafeInspect legal article comparison.

Two separate normalisation paths:
  normalize_md(text)  — strips Markdown syntax + normalises whitespace
                        USE THIS for MD-extracted article text.
  normalize_pdf(text) — normalises whitespace only (no Markdown to strip)
                        USE THIS for PDF-extracted article text.
  normalize_text(text, source='md') — dispatcher used by the diff pipeline.

Rationale (per Claude audit 2026-09-02):
  The MD files contain **bold**, ### headings, `backticks`, etc. that do not
  appear in PDF-extracted text. Applying the same normaliser to both sides
  would leave Markdown noise on the MD side, dragging down fuzzy similarity
  scores and producing false mismatches that have nothing to do with content.
  Solution: strip Markdown only from the MD side; leave PDF text untouched.

NOTE on orphan-prefix strip (2026-09-02):
  Even after the ARTICLE_BOUNDARY_RE trailing-group fix, a safety-net strip
  is applied at the very start of each sliced article text. It targets only
  the specific artifact patterns that a stray bold/heading sequence produces:
    - Leading asterisks with no paired closer  (e.g. ** or ***)
    - Leading heading markers                   (e.g. ## or ###)
  It is NOT a generic "trim leading junk" rule. Legal text that legitimately
  starts with — (em-dash), ( (paren), or other punctuation is untouched.
  Format B (### heading) articles do not produce orphan asterisks, so the
  asterisk strip is harmless on them; the heading strip is also harmless on
  Format A articles which never start with #.
"""

import re
import unicodedata

# ---------------------------------------------------------------------------
# Markdown stripping patterns (applied to MD side only)
# ---------------------------------------------------------------------------

# Remove heading markers: ## Title → Title
_RE_HEADING = re.compile(r'^#{1,6}\s+', re.MULTILINE)

# Remove bold/italic markers: **text** → text, *text* → text, __text__ → text
_RE_BOLD_ITALIC = re.compile(r'(\*{1,3}|_{1,3})(.*?)\1', re.DOTALL)

# Remove inline code and code blocks
_RE_INLINE_CODE = re.compile(r'`+[^`]*`+')
_RE_CODE_BLOCK = re.compile(r'^```[\s\S]*?```', re.MULTILINE)

# Remove blockquote markers
_RE_BLOCKQUOTE = re.compile(r'^>+\s?', re.MULTILINE)

# Remove horizontal rules
_RE_HR = re.compile(r'^[-*_]{3,}\s*$', re.MULTILINE)

# Remove link syntax [text](url) → text
_RE_LINK = re.compile(r'\[([^\]]+)\]\([^\)]+\)')

# Remove image syntax ![alt](url)
_RE_IMAGE = re.compile(r'!\[[^\]]*\]\([^\)]+\)')

# Remove HTML tags (sometimes left by MD converters)
_RE_HTML_TAG = re.compile(r'<[^>]+>')

# Orphan-prefix patterns — safety net for boundary-match artifacts.
# Matches ONLY the specific leading sequences a stray bold/heading marker
# produces. Applied once at the very start of each sliced article string.
#   ^\*{1,3}\s*  — 1-3 leading asterisks (**, ***) not part of a pair
#   ^#{2,3}\s*   — leading ## or ### (Format B heading consumed by slice start)
# These two alternatives are anchored to ^ (start of string, not each line)
# so they only fire on the very first characters of the slice.
_RE_ORPHAN_PREFIX = re.compile(r'^(?:\*{1,3}|#{2,3})\s*')


def _strip_orphan_prefix(text: str) -> str:
    """
    Remove a leading orphan bold/heading artifact from the very start of a
    sliced article string. This is a safety net for the edge case where the
    boundary regex trailing group does not consume the full closing sequence.

    Only fires on ^** / ^*** / ^## / ^### — will not touch em-dashes,
    parentheses, Arabic text, or any other legitimate leading characters.
    """
    return _RE_ORPHAN_PREFIX.sub('', text)


def _strip_markdown(text: str) -> str:
    """Remove Markdown formatting syntax, leaving only prose content."""
    # Orphan-prefix first (before paired-bold strip, which needs paired markers)
    text = _strip_orphan_prefix(text)
    text = _RE_CODE_BLOCK.sub(' ', text)
    text = _RE_HEADING.sub('', text)
    text = _RE_BOLD_ITALIC.sub(r'\2', text)
    text = _RE_INLINE_CODE.sub(' ', text)
    text = _RE_BLOCKQUOTE.sub('', text)
    text = _RE_HR.sub('', text)
    text = _RE_IMAGE.sub('', text)
    text = _RE_LINK.sub(r'\1', text)
    text = _RE_HTML_TAG.sub(' ', text)
    return text


def _normalise_whitespace(text: str) -> str:
    """Collapse all whitespace runs to a single space and strip leading/trailing."""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _normalise_unicode(text: str) -> str:
    """NFC normalisation to handle composed vs decomposed characters."""
    return unicodedata.normalize('NFC', text)


def normalize_md(text: str) -> str:
    """
    Full normalisation for MD-extracted article text.
    Strips Markdown (including orphan-prefix safety net), normalises unicode,
    collapses whitespace. Call this PER-ARTICLE after slicing, never on the
    whole file (would blind the boundary detector to Format A markers).
    """
    text = _normalise_unicode(text)
    text = _strip_markdown(text)
    text = _normalise_whitespace(text)
    return text


def normalize_pdf(text: str) -> str:
    """
    Normalisation for PDF-extracted article text.
    Does NOT strip Markdown (there is none). Only normalises unicode + whitespace.
    """
    text = _normalise_unicode(text)
    text = _normalise_whitespace(text)
    return text


def normalize_text(text: str, source: str = 'md') -> str:
    """
    Dispatcher used by the diff pipeline.
    source: 'md' (default) or 'pdf'
    """
    if source == 'pdf':
        return normalize_pdf(text)
    return normalize_md(text)


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('Usage: python normalize.py <md|pdf> < input.txt')
        sys.exit(1)
    src = sys.argv[1] if len(sys.argv) > 1 else 'md'
    raw = sys.stdin.read()
    print(normalize_text(raw, source=src))
