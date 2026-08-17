from pathlib import Path
import hashlib,json,re,subprocess,unicodedata
ROOT=Path('/home/ubuntu/legal_compare_repo'); OUT=ROOT/'safe_legal_refs'; PDFDIR=Path('/home/ubuntu/upload')
PDFS=['20sep831.pdf','20sep832.pdf','Arrêtéintermin.du31août1983(équipementvéhiculesGPLC).pdf','Arrêtéinterministérieldu20septembre1983(stationsdistributionGPL).pdf','loi18-09fr.pdf','manuel-installation-gpl-web(1).pdf']
def safe(stem):
    s=stem.encode('ascii','ignore').decode('ascii'); return ''.join(c for c in s if c.isalnum() or c in '_.-')
def sha(p):
    h=hashlib.sha256(); h.update(p.read_bytes()); return h.hexdigest()
def pages(p):
    try:
        x=subprocess.check_output(['pdfinfo',str(p)],text=True,stderr=subprocess.DEVNULL); m=re.search(r'^Pages:\s*(\d+)',x,re.M); return int(m.group(1))
    except Exception:return None
def safe_md_name(pdf):
    s=Path(pdf).stem.encode('ascii','ignore').decode('ascii').lower(); s=re.sub(r'[^a-z0-9]+','-',s).strip('-'); return 'source-only-'+s+'.md'
def extract_pages(pdf):
    ocr=ROOT/'work'/'ocr_text'/f'{safe(Path(pdf).stem)}.txt'; raw=ROOT/'work'/'raw_text'/f'{safe(Path(pdf).stem)}.txt'; layout=ROOT/'work'/'pdf_text'/f'{safe(Path(pdf).stem)}.txt'
    if ocr.exists():
        parts=re.split(r'===== PAGE [^=]+ =====',ocr.read_text(errors='replace')); return [x.strip() for x in parts if x.strip()], 'OCR'
    src=raw if raw.exists() else layout
    if not src.exists(): return [], 'unavailable'
    return [x.strip() for x in src.read_text(errors='replace').split('\f')], 'native'
rows=[]
for pdf in PDFS:
    p=PDFDIR/pdf; name=safe_md_name(pdf); pages_text,mode=extract_pages(pdf)
    meta={'document_type':'unmatched-source-reference','source_pdf':pdf,'source_pdf_sha256':sha(p),'source_pdf_pages':pages(p),'source_repository_commit':'1cd6cb9db4c0dbf81e0329bd3116f9704f936df1','conversion_method':mode+' page-preserving extraction; no instrument mapping available','quality_status':'unmatched-source-ocr-review-required' if mode=='OCR' else 'unmatched-source-review-required','authority':'source PDF or official Journal Officiel; this Markdown is derived','known_limitation':'No matching legal Markdown was found in the audited repository; do not infer the instrument identity or legal scope from this file alone'}
    text='---\n'+''.join(f'{k}: {json.dumps(v,ensure_ascii=False)}\n' for k,v in meta.items())+'---\n\n> **AI SAFETY NOTICE:** This is a source-only extraction with no validated Markdown counterpart. It is for discovery only. Verify all content against the source PDF before quoting or relying on it.\n\n# Source-only extraction: '+pdf+'\n\n'
    for i,page in enumerate(pages_text,1): text+=f'<!-- source_pdf: {pdf}; source_page: {i}; mapping: source-only -->\n## PDF page {i}\n\n{page}\n\n'
    (OUT/name).write_text(text,encoding='utf-8'); rows.append({**meta,'markdown':name,'extracted_pages':len(pages_text)})
(Path(OUT/'UNMATCHED_SOURCE_MANIFEST.json')).write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print(json.dumps(rows,ensure_ascii=False,indent=2))
