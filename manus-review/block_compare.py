import json, re, difflib
from pathlib import Path
from compare_legal import PAIRS, read_pdf, strip_pdf_headers, canon

ROOT=Path('/home/ubuntu/legal_compare_repo')
MD_DIR=ROOT/'repo'/'legal_refs'
OUT=ROOT/'work'/'comparison'

def md_legal_text(s):
    out=[]
    started=False
    for line in s.replace('\ufeff','').splitlines():
        t=line.strip()
        if t.startswith('## Contrôle de séquence') or t.startswith('## Intégrité du texte'):
            break
        if t.startswith('**Date de ') or t.startswith('**Journal Officiel') or t.startswith('**Source PDF') or t.startswith('**Statut de vérification') or t.startswith('**Note sur la source'):
            continue
        if t.startswith('> **AVERTISSEMENT'):
            continue
        if t.startswith('## '):
            started=True
            line=re.sub(r'^\s*##\s*','',line)
        if started:
            line=re.sub(r'\*\*([^*]+)\*\*',r'\1',line)
            line=re.sub(r'\*([^*]+)\*',r'\1',line)
            line=re.sub(r'`([^`]+)`',r'\1',line)
            out.append(line)
    return '\n'.join(out)

def words(s):
    s=canon(s)
    s=re.sub(r'(?<=\w)- (?=\w)','',s)
    return re.findall(r'[a-zàâçéèêëîïôûùüÿœæ0-9]+',s)

def main():
    rows=[]
    for pdf,md in PAIRS:
        ptxt,src=read_pdf(pdf)
        mtxt=(MD_DIR/md).read_text(errors='replace')
        pw=words(strip_pdf_headers(ptxt)); mw=words(md_legal_text(mtxt))
        sm=difflib.SequenceMatcher(None,pw,mw,autojunk=True)
        blocks=sm.get_matching_blocks()
        matched=sum(b.size for b in blocks)
        longest=max((b.size for b in blocks),default=0)
        r={'pdf':pdf,'markdown':md,'source':src,'pdf_words':len(pw),'md_words':len(mw),'matched_words':matched,'md_coverage':round(matched/len(mw),4) if mw else 0,'longest_block':longest,'longest_block_ratio':round(longest/len(mw),4) if mw else 0,'word_similarity':round(sm.ratio(),4),'likely_textually_covered':matched/len(mw)>=0.95 if mw else False}
        rows.append(r)
    (OUT/'block_results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
    print('pdf\tmarkdown\tsource\tpdf_words\tmd_words\tmatched_words\tmd_coverage\tlongest_block_ratio\tword_similarity\tlikely_covered')
    for r in rows:
        print('\t'.join(str(r[k]) for k in ['pdf','markdown','source','pdf_words','md_words','matched_words','md_coverage','longest_block_ratio','word_similarity','likely_textually_covered']))
    print('COUNTS')
    print('pairs',len(rows))
    print('likely_covered',sum(r['likely_textually_covered'] for r in rows))
    print('coverage_ge_0.90',sum(r['md_coverage']>=0.90 for r in rows))
    print('coverage_0.70_0.90',sum(0.70<=r['md_coverage']<0.90 for r in rows))
    print('coverage_lt_0.70',sum(r['md_coverage']<0.70 for r in rows))

if __name__=='__main__': main()
