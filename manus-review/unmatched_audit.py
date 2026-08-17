import json, re, difflib
from pathlib import Path
from compare_legal import PAIRS, read_pdf, strip_pdf_headers, canon
from block_compare import md_legal_text, words
ROOT=Path('/home/ubuntu/legal_compare_repo')
MD_DIR=ROOT/'repo'/'legal_refs'
OUT=ROOT/'work'/'comparison'
rows=[]
for pdf,md in PAIRS:
    ptxt,src=read_pdf(pdf)
    mtxt=(MD_DIR/md).read_text(errors='replace')
    pw=words(strip_pdf_headers(ptxt)); mw=words(md_legal_text(mtxt))
    sm=difflib.SequenceMatcher(None,pw,mw,autojunk=True)
    matched=sum(b.size for b in sm.get_matching_blocks())
    coverage=matched/len(mw) if mw else 0
    if coverage < 0.90: continue
    chunks=[]
    for tag,ia,ib,ja,jb in sm.get_opcodes():
        if tag in ('insert','replace') and (jb-ja)>=5:
            chunks.append({'tag':tag,'md_start':ja,'md_end':jb,'text':' '.join(mw[ja:jb])[:1000]})
    rows.append({'pdf':pdf,'markdown':md,'source':src,'coverage':round(coverage,4),'chunks':chunks[:40]})
(OUT/'unmatched_audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
for r in rows:
    print('\n===',r['pdf'],'=>',r['markdown'],'coverage',r['coverage'],'===')
    for c in r['chunks'][:10]: print(c['tag'],c['md_start'],c['md_end'],c['text'])
