import json, re, difflib
from pathlib import Path
from compare_legal import PAIRS, read_pdf, strip_pdf_headers, strip_md, canon, article_seq

ROOT=Path('/home/ubuntu/legal_compare_repo')
OUT=ROOT/'work'/'comparison'

def anchor_hits(pdf, md):
    # Prefer anchors from the start and end of the legal text, not repository metadata.
    candidates=[]
    for base in (md[:1200], md[1200:4000], md[-2500:]):
        if not base: continue
        base=base.strip()
        for n in (120,100,80,60):
            if len(base)>=n:
                candidates.append(base[:n] if base is not md[-2500:] else base[-n:])
    hits=[]
    for a in candidates:
        aa=canon(a)
        if len(aa)<40: continue
        pos=pdf.find(aa)
        if pos>=0:
            hits.append((pos,len(aa),a))
    return hits

def main():
    rows=[]
    for pdf,mdfile in PAIRS:
        ptxt,source=read_pdf(pdf)
        mtxt=(ROOT/'repo'/'legal_refs'/mdfile).read_text(errors='replace')
        pc=canon(strip_pdf_headers(ptxt)); mc=canon(strip_md(mtxt))
        start_hits=anchor_hits(pc,mc)
        end_candidates=[]
        for base in (mc[-3000:],mc[-1800:],mc[-1000:]):
            for n in (120,100,80,60):
                if len(base)>=n:
                    a=base[-n:]; pos=pc.find(a)
                    if pos>=0: end_candidates.append((pos,len(a),a))
        start=min(start_hits,key=lambda x:x[0]) if start_hits else None
        end=max(end_candidates,key=lambda x:x[0]+x[1]) if end_candidates else None
        segment=None
        if start and end and end[0]>=start[0]:
            segment=pc[start[0]:end[0]+end[1]]
        elif start:
            # If only the beginning is found, compare the longest matching block as a fallback.
            sm=difflib.SequenceMatcher(None,pc.split(),mc.split(),autojunk=True)
            blocks=sm.get_matching_blocks()
            block=max(blocks,key=lambda b:b.size) if blocks else None
            if block and block.size>0:
                segment=' '.join(pc.split()[block.a:block.a+block.size])
        r={
          'pdf':pdf,'markdown':mdfile,'source':source,
          'anchor_start_found':bool(start),'anchor_end_found':bool(end),
          'segment_found':segment is not None,
          'segment_chars':len(segment or ''),'md_chars':len(mc),
          'segment_length_ratio':round(min(len(segment or ''),len(mc))/max(len(segment or ''),len(mc)),4) if segment and mc else 0,
          'segment_word_similarity':round(difflib.SequenceMatcher(None,(segment or '').split(),mc.split(),autojunk=True).ratio(),4) if segment else 0,
          'segment_exact':segment==mc if segment else False,
          'pdf_articles_in_segment':len(article_seq(segment or '')),
          'md_articles':len(article_seq(strip_md(mtxt))),
          'start_pos':start[0] if start else None,'end_pos':end[0] if end else None,
        }
        rows.append(r)
        (OUT/f'{Path(pdf).stem}__segment.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
    (OUT/'segment_results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
    print('pdf\tmarkdown\tsource\tstart\tend\tsegment\tseg_chars\tmd_chars\tlen_ratio\tword_similarity\tseg_exact\tpdf_articles\tmd_articles')
    for r in rows:
        print('\t'.join(str(r[k]) for k in ['pdf','markdown','source','segment_found','anchor_start_found','anchor_end_found','segment_chars','md_chars','segment_length_ratio','segment_word_similarity','segment_exact','pdf_articles_in_segment','md_articles']))
    print('COUNTS')
    print('pairs',len(rows))
    print('segment_found',sum(r['segment_found'] for r in rows))
    print('segment_exact',sum(r['segment_exact'] for r in rows))
    print('similarity_ge_0.90',sum(r['segment_word_similarity']>=0.90 for r in rows))

if __name__=='__main__': main()
