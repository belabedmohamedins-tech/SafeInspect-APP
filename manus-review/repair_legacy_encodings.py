from pathlib import Path
import hashlib, subprocess, json, re
ROOT=Path('/home/ubuntu/legal_compare_repo/repo'); PDFDIR=Path('/home/ubuntu/upload')
items={
 'arrete-interministeriel-2016-10-04-criteres-microbiologiques.md':('Arrêtéinterministérieldu2Moharram1438correspondantau4octobre2016fixantlescritèresmicrobiologiquesdesdenréesalimentaires.pdf','native',0.3047),
 'arrete-interministeriel-2025-05-07-hygiene-restauration.md':('Arrêtéinterministérieldu9DhouElKaâda1446correspondantau7mai2025fixantlesconditionsparticulièresd’hygièneetdesalubritéapplicablesdanslesétablissementsderestauration.pdf','native',0.6123),
 'decret-90-245-appareils-pression-gaz.md':('Décret90-245du18août1990(appareilsàpressiondegaz).pdf','OCR',0.3456),
}
def sha(p):
 h=hashlib.sha256(); h.update(p.read_bytes()); return h.hexdigest()
def pages(p):
 x=subprocess.check_output(['pdfinfo',str(p)],text=True,stderr=subprocess.DEVNULL); m=re.search(r'^Pages:\s*(\d+)',x,re.M); return int(m.group(1)) if m else None
for md,(pdf,mode,cov) in items.items():
    # Restore the repository version as bytes and decode its original extended-ASCII encoding.
    original=subprocess.check_output(['git','show',f'HEAD:legal_refs/{md}'],cwd=ROOT)
    body=original.decode('cp1252')
    # Remove an existing wrapper if this script is rerun.
    if body.startswith('\ufeff'): body=body.lstrip('\ufeff')
    p=PDFDIR/pdf
    front='---\n'+''.join([
      'document_type: "legal-reference"\n',f'source_pdf: {json.dumps(pdf,ensure_ascii=False)}\n',f'source_pdf_sha256: "{sha(p)}"\n',f'source_pdf_pages: {pages(p)}\n','source_repository_commit: "1cd6cb9db4c0dbf81e0329bd3116f9704f936df1"\n',f'conversion_method: "repository-Markdown preserved; source encoding decoded as cp1252; {mode} source comparison"\n',f'quality_status: "low-coverage-review-required"\n',f'automated_pdf_word_coverage: {cov}\n',f'automated_source_mode: "{mode}"\n','authority: "source PDF or official Journal Officiel; this Markdown is derived"\n','high_risk_rule: "verify exact quotations, numbers, units, dates, penalties, exceptions, tables, annexes, amendments, and OCR passages"\n','---\n\n', '> **AI SAFETY NOTICE:** This is a derived Markdown reference. The source PDF or official Journal Officiel remains authoritative. Verify high-risk claims against the cited PDF page.\n\n'])
    body='\n'.join(line.rstrip() for line in body.lstrip('\ufeff').splitlines())+'\n'
    (ROOT/'legal_refs'/md).write_text(front+body,encoding='utf-8')
print('repaired',len(items),'legacy-encoded files')
