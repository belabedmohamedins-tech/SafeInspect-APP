import json,re,difflib
from pathlib import Path
from compare_legal import PAIRS, read_pdf, strip_pdf_headers, canon
from block_compare import md_legal_text, words
ROOT=Path('/home/ubuntu/legal_compare_repo'); MD_DIR=ROOT/'repo'/'legal_refs'; OUT=ROOT/'work'/'comparison'
def clean_body(s):
    s=re.sub(r'^---\n.*?\n---\n','',s,flags=re.S)
    s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    s=re.sub(r'^> \*\*AI SAFETY NOTICE:\*\*.*?\n\s*','',s,flags=re.M)
    s=re.sub(r'^> \*\*Source:.*?\n\s*','',s,flags=re.M)
    return s
def md_text(s): return md_legal_text(clean_body(s))
rows=[]
for pdf,md in PAIRS:
    ptxt,src=read_pdf(pdf); mtxt=(MD_DIR/md).read_text(errors='replace')
    pw=words(strip_pdf_headers(ptxt)); mw=words(md_text(mtxt)); sm=difflib.SequenceMatcher(None,pw,mw,autojunk=True)
    matched=sum(b.size for b in sm.get_matching_blocks()); cov=matched/len(mw) if mw else 0
    rows.append({'pdf':pdf,'markdown':md,'source':src,'pdf_words':len(pw),'md_words':len(mw),'matched_words':matched,'md_coverage':round(cov,4),'similarity':round(sm.ratio(),4),'high_coverage':cov>=0.95})
(OUT/'body_results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print('pdf\tmarkdown\tcoverage\tsimilarity\thigh_coverage')
for r in rows: print('\t'.join(str(r[k]) for k in ['pdf','markdown','md_coverage','similarity','high_coverage']))
print('COUNTS',json.dumps({'pairs':len(rows),'high_coverage':sum(r['high_coverage'] for r in rows)},ensure_ascii=False))
