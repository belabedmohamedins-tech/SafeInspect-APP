#!/usr/bin/env python3
"""
diff_articles.py — W97-P3
Fuzzy diff two article indexes (JSON produced by index_articles.py).
Used to detect:
  - Articles present in reference but missing from repo MD
  - Articles present in repo MD but not in reference
  - Articles whose text diverges significantly

Usage:
  python tools/diff_articles.py reference.json repo.json
  python tools/diff_articles.py reference.json repo.json --threshold 0.7

Threshold: 0.0 = any difference reported, 1.0 = only missing articles
Default threshold: 0.85 (report articles with <85% similarity)
"""

import json
import sys
import argparse
import difflib
from pathlib import Path


def load(path: Path) -> dict[str, dict]:
    """Load JSON index, return dict keyed by article number."""
    data = json.loads(path.read_text(encoding='utf-8'))
    return {entry['article']: entry for entry in data}


def similarity(a: str, b: str) -> float:
    """Return SequenceMatcher ratio between two strings."""
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def diff(ref: dict, repo: dict, threshold: float) -> list[dict]:
    findings = []

    ref_keys = set(ref.keys())
    repo_keys = set(repo.keys())

    # Missing from repo
    for art in sorted(ref_keys - repo_keys, key=lambda x: int(re.sub(r'\D', '', x) or 0)):
        findings.append({
            'type': 'MISSING_IN_REPO',
            'article': art,
            'ref_title': ref[art].get('title', ''),
        })

    # Extra in repo (not in reference)
    for art in sorted(repo_keys - ref_keys, key=lambda x: int(re.sub(r'\D', '', x) or 0)):
        findings.append({
            'type': 'EXTRA_IN_REPO',
            'article': art,
            'repo_title': repo[art].get('title', ''),
        })

    # Text divergence
    for art in sorted(ref_keys & repo_keys, key=lambda x: int(re.sub(r'\D', '', x) or 0)):
        r_text = ref[art].get('text', '')
        p_text = repo[art].get('text', '')
        score = similarity(r_text, p_text)
        if score < threshold:
            findings.append({
                'type': 'TEXT_DIVERGENCE',
                'article': art,
                'similarity': round(score, 3),
                'ref_preview': r_text[:120],
                'repo_preview': p_text[:120],
            })

    return findings


import re  # needed for the sort key lambdas above


def main():
    ap = argparse.ArgumentParser(description='Fuzzy diff two article index JSON files')
    ap.add_argument('reference', help='Reference JSON (ground truth)')
    ap.add_argument('repo', help='Repo MD-derived JSON')
    ap.add_argument('--threshold', type=float, default=0.85,
                    help='Similarity threshold below which divergence is reported (default 0.85)')
    args = ap.parse_args()

    ref = load(Path(args.reference))
    repo = load(Path(args.repo))

    findings = diff(ref, repo, args.threshold)

    if not findings:
        print(f'✅  No issues found (threshold={args.threshold})')
        print(f'   {len(ref)} reference articles, {len(repo)} repo articles')
        return

    missing = [f for f in findings if f['type'] == 'MISSING_IN_REPO']
    extra   = [f for f in findings if f['type'] == 'EXTRA_IN_REPO']
    diverg  = [f for f in findings if f['type'] == 'TEXT_DIVERGENCE']

    print(f'⚠️  {len(findings)} issue(s) found:')
    print(f'   MISSING_IN_REPO:  {len(missing)}')
    print(f'   EXTRA_IN_REPO:    {len(extra)}')
    print(f'   TEXT_DIVERGENCE:  {len(diverg)}')
    print()

    for f in findings:
        if f['type'] == 'MISSING_IN_REPO':
            print(f"  [MISSING]  Art.{f['article']}  {f.get('ref_title','')}")
        elif f['type'] == 'EXTRA_IN_REPO':
            print(f"  [EXTRA]    Art.{f['article']}  {f.get('repo_title','')}")
        elif f['type'] == 'TEXT_DIVERGENCE':
            print(f"  [DIVERGE]  Art.{f['article']}  similarity={f['similarity']}")
            print(f"    REF:  {f['ref_preview']}")
            print(f"    REPO: {f['repo_preview']}")
            print()

    sys.exit(1)  # non-zero exit so CI can catch it


if __name__ == '__main__':
    main()
