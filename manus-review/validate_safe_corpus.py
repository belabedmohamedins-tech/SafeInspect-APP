from pathlib import Path
import json,re,hashlib
ROOT=Path('/home/ubuntu/legal_compare_repo')
OUT=ROOT/'safe_legal_refs'
rows=json.loads((OUT/'safe_manifest.json').read_text())
issues=[]
for r in rows:
    p=OUT/r['markdown']
    text=p.read_text(errors='replace') if p.exists() else ''
    required=['source_pdf:','quality_status:','authority:','AI SAFETY NOTICE']
    missing=[x for x in required if x not in text]
    if missing: issues.append({'file':r['markdown'],'issue':'missing markers','details':missing})
    if r['source_pdf'] and r['source_pdf_sha256']:
        pdf=Path('/home/ubuntu/upload')/r['source_pdf']
        if not pdf.exists(): issues.append({'file':r['markdown'],'issue':'source PDF missing','details':r['source_pdf']})
        else:
            h=hashlib.sha256(pdf.read_bytes()).hexdigest()
            if h!=r['source_pdf_sha256']: issues.append({'file':r['markdown'],'issue':'source hash mismatch','details':r['source_pdf']})
    if r['quality_status']=='automated-high-coverage-human-review-required' and (r['automated_pdf_word_coverage'] or 0)<0.95:
        issues.append({'file':r['markdown'],'issue':'status/coverage mismatch','details':r['automated_pdf_word_coverage']})
print(json.dumps({'files_checked':len(rows),'issues':issues,'issue_count':len(issues),'status_counts':{s:sum(x['quality_status']==s for x in rows) for s in sorted({x['quality_status'] for x in rows})}},ensure_ascii=False,indent=2))
(OUT/'VALIDATION_RESULT.json').write_text(json.dumps({'files_checked':len(rows),'issues':issues,'issue_count':len(issues)},ensure_ascii=False,indent=2))
