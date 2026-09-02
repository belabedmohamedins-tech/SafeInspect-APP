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


def _strip_markdown(text: str) -> str:
    """Remove Markdown formatting syntax, leaving only prose content."""
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
    # Collapse runs of spaces/tabs on the same line
    text = re.sub(r'[ \t]+', ' ', text)
    # Collapse multiple blank lines to one
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _normalise_unicode(text: str) -> str:
    """NFC normalisation to handle composed vs decomposed characters."""
    return unicodedata.normalize('NFC', text)


def normalize_md(text: str) -> str:
    """
    Full normalisation for MD-extracted article text.
    Strips Markdown, normalises unicode, collapses whitespace.
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
