from __future__ import annotations
import hashlib, json, re, shutil, subprocess, unicodedata
from collections import defaultdict
from pathlib import Path

ROOT=Path('/home/ubuntu/legal_compare_repo')
REPO=ROOT/'repo'/'legal_refs'
PDFDIR=Path('/home/ubuntu/upload')
OUT=ROOT/'safe_legal_refs'
OUT.mkdir(parents=True, exist_ok=True)

PAIRS=[
('06-138JO.pdf','decret-06-138-emissions-atmospheriques.md'),('21-430.pdf','decret-21-430-gpl-carburant.md'),('22-167.pdf','decret-22-167-etablissements-classes-modification.md'),('Arrêtéinterministérieldu21novembre1999.pdf','arrete-interministeriel-1999-11-21-conservation-aliments.md'),('Arrêtéinterministérieldu2Moharram1438correspondantau4octobre2016fixantlescritèresmicrobiologiquesdesdenréesalimentaires.pdf','arrete-interministeriel-2016-10-04-criteres-microbiologiques.md'),('Arrêtéinterministérieldu9DhouElKaâda1446correspondantau7mai2025fixantlesconditionsparticulièresd’hygièneetdesalubritéapplicablesdanslesétablissementsderestauration.pdf','arrete-interministeriel-2025-05-07-hygiene-restauration.md'),('Decret06-198.pdf','decret-06-198-etablissements-classes.md'),('Decret17-140.pdf','decret-17-140-hygiene-alimentaire.md'),('Décret02-427.pdf','decret-02-427-prevention-risques-professionnels.md'),('Décret04-82.pdf','decret-04-82-agrement-sanitaire-animaux.md'),('Décret06-138.pdf','decret-06-138-emissions-atmospheriques.md'),('Décret07-144.pdf','decret-07-144-nomenclature-installations-classees.md'),('Décret09-335.pdf','decret-09-335-plans-internes-intervention.md'),('Décret76-35.pdf','decret-76-35-igh-incendie.md'),('Décret83-496.pdf','decret-83-496-gpl-carburant.md'),('Décret90-245du18août1990(appareilsàpressiondegaz).pdf','decret-90-245-appareils-pression-gaz.md'),('LOI04-08.pdf','loi-04-08-activites-commerciales.md'),('LOI90-11.pdf','loi-90-11-relations-travail.md'),('Loi-03-10.pdf','loi-03-10-protection-environnement.md'),('Loi01-19.pdf','loi-01-19-gestion-dechets.md'),('Loi04-20.pdf','loi-04-20-risques-majeurs.md'),('Loi09-03_frarticle.pdf','loi-09-03-protection-consommateur.md'),('arrete-interministeriel-2011-02-06-permis-construire-energie.pdf','arrete-interministeriel-2011-02-06-permis-construire-energie.md'),('dec21-261.pdf','decret-21-261-esp-equipements-hydrocarbures.md'),('decret-25-63-plans-intervention-catastrophes.pdf','decret-25-63-plans-intervention-catastrophes.md'),('decret06-141.pdf','decret-06-141-rejets-effluents-liquides.md'),('decret09-19.pdf','decret-09-19.md'),('decret11-125.pdf','decret-11-125-eau-consommation-humaine.md'),('decret21-319.pdf','decret-21-319-autorisation-exploitation-hydrocarbures.md'),('decret24-196.pdf','decret-24-196-etablissements-classes-modification.md'),('decret91-05.pdf','decret-91-05-hygiene-securite-milieu-travail.md'),('decret93-120.pdf','decret-93-120-medecine-du-travail.md'),('loi05-12.pdf','loi-05-12-ressources-en-eau.md'),('loi09-03.pdf','loi-09-03-protection-consommateur.md'),('loi18-11.pdf','loi-18-11-sante.md'),('loi19-02.pdf','loi-19-02-incendie-panique.md'),('loi90-29.pdf','loi-90-29-urbanisme.md')]

# Prefer the direct/cleaner PDF where duplicate sources exist.
PREFERRED={
 'decret-06-138-emissions-atmospheriques.md':'Décret06-138.pdf',
 'loi-09-03-protection-consommateur.md':'loi09-03.pdf',
 'loi-18-11-sante.md':'loi18-11.pdf',
}
OCR={'Décret76-35.pdf','Décret83-496.pdf','Décret90-245du18août1990(appareilsàpressiondegaz).pdf','decret91-05.pdf','decret93-120.pdf','loi90-29.pdf'}
UNMATCHED_PDFS=['20sep831.pdf','20sep832.pdf','Arrêtéintermin.du31août1983(équipementvéhiculesGPLC).pdf','Arrêtéinterministérieldu20septembre1983(stationsdistributionGPL).pdf','loi18-09fr.pdf','manuel-installation-gpl-web(1).pdf']

try:
    block_rows={r['markdown']:r for r in json.loads((ROOT/'work'/'comparison'/'block_results.json').read_text())}
except Exception:
    block_rows={}


def sha256(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()

def pages(path):
    try:
        out=subprocess.check_output(['pdfinfo',str(path)],text=True,stderr=subprocess.DEVNULL)
        m=re.search(r'^Pages:\s*(\d+)',out,re.M); return int(m.group(1)) if m else None
    except Exception: return None

def safe_name(stem):
    s=stem.encode('ascii','ignore').decode('ascii')
    return ''.join(c for c in s if c.isalnum() or c in '_.-')

def canon(s):
    s=unicodedata.normalize('NFKC',s).lower().replace('\u00a0',' ')
    s=s.replace('’',"'").replace('–','-').replace('—','-')
    return re.sub(r'\s+',' ',s).strip()

def page_texts(pdf):
    raw=ROOT/'work'/'raw_text'/f'{safe_name(Path(pdf).stem)}.txt'
    layout=ROOT/'work'/'pdf_text'/f'{safe_name(Path(pdf).stem)}.txt'
    ocr=ROOT/'work'/'ocr_text'/f'{safe_name(Path(pdf).stem)}.txt'
    if pdf in OCR and ocr.exists():
        text=ocr.read_text(errors='replace')
        parts=re.split(r'===== PAGE [^=]+ =====',text)
        return [p for p in parts if p.strip()]
    src=raw if raw.exists() else layout
    if not src.exists(): return []
    return src.read_text(errors='replace').split('\f')

def article_numbers(text):
    nums=[]
    for line in text.splitlines():
        m=re.match(r'^\s*(?:\*\*)?(?:article|art\.?)[\s]+(\d+)(?:er|e)?\b',line.lower())
        if m: nums.append(int(m.group(1)))
    return nums

def article_pages(pdf):
    result=defaultdict(list)
    for idx,page in enumerate(page_texts(pdf),1):
        for n in article_numbers(page):
            if idx not in result[n]: result[n].append(idx)
    return result

def status_for(md):
    row=block_rows.get(md)
    pdf=PREFERRED.get(md)
    if not pdf:
        for p,m in PAIRS:
            if m==md: pdf=p; break
    if not pdf or not row:
        return 'unmatched-source', row
    if row['source']=='OCR': return 'ocr-review-required', row
    cov=row.get('md_coverage',0)
    if cov>=0.95: return 'automated-high-coverage-human-review-required', row
    if cov>=0.70: return 'partial-review-required', row
    return 'low-coverage-review-required', row

def choose_pdf(md):
    if md in PREFERRED: return PREFERRED[md]
    for p,m in PAIRS:
        if m==md: return p
    if md in {'loi-18-11-sante-partie1-arts1-164.md','loi-18-11-sante-partie2-arts165-264.md','loi-18-11-sante-partie3-arts265-450.md'}: return 'loi18-11.pdf'
    return None

def add_article_markers(body,pdf):
    if not pdf or not (PDFDIR/pdf).exists(): return body,0
    amap=article_pages(pdf)
    counts=defaultdict(int); marked=0; out=[]
    for line in body.splitlines():
        m=re.match(r'^(\s*)(\*\*(?:Article|Art\.?)\s+(\d+)(?:er|e)?\b.*)$',line,re.I)
        if m:
            n=int(m.group(3)); counts[n]+=1
            pp=amap.get(n,[])
            page=pp[counts[n]-1] if counts[n]-1<len(pp) else (pp[-1] if pp else None)
            if page:
                out.append(f'<!-- source_pdf: {pdf}; source_page: {page}; article: {n}; page_mapping: automated -->')
                marked+=1
            else:
                out.append(f'<!-- source_pdf: {pdf}; source_page: unverified; article: {n}; page_mapping: unavailable -->')
            out.append(m.group(1)+m.group(2))
        else: out.append(line)
    return '\n'.join(out)+'\n',marked

def main():
    if OUT.exists():
        for p in OUT.glob('*.md'): p.unlink()
    rows=[]
    for mdpath in sorted(REPO.glob('*.md')):
        md=mdpath.name
        source_pdf=choose_pdf(md)
        status,row=status_for(md)
        is_repo_doc=md in {'README.md','CLEANUP_LOG.md'}
        if is_repo_doc:
            status='repository-document'; source_pdf=None
        if md=='projet-arrete-gpl-installations-securite.md': status='project-no-official-source'
        body=mdpath.read_text(errors='replace')
        mapped_body,markers=add_article_markers(body,source_pdf)
        pdfpath=PDFDIR/source_pdf if source_pdf else None
        meta={
          'document_type':'legal-reference' if not is_repo_doc else 'repository-document',
          'source_pdf':source_pdf or None,
          'source_pdf_sha256':sha256(pdfpath) if pdfpath and pdfpath.exists() else None,
          'source_pdf_pages':pages(pdfpath) if pdfpath and pdfpath.exists() else None,
          'source_repository_commit':'1cd6cb9db4c0dbf81e0329bd3116f9704f936df1',
          'conversion_method':'repository-markdown-preserved; page markers added automatically',
          'quality_status':status,
          'automated_pdf_word_coverage':row.get('md_coverage') if row else None,
          'automated_source_mode':row.get('source') if row else None,
          'article_page_markers_added':markers,
          'authority':'source PDF or official Journal Officiel; this Markdown is derived',
          'high_risk_rule':'verify exact quotations, numbers, units, dates, penalties, exceptions, tables, annexes, amendments, and OCR passages against the source PDF',
        }
        front='---\n'+''.join(f'{k}: {json.dumps(v,ensure_ascii=False)}\n' for k,v in meta.items())+'---\n\n'
        banner='> **AI SAFETY NOTICE:** This is a derived Markdown reference. The source PDF or official Journal Officiel remains authoritative. Verify high-risk claims against the cited PDF page.\n\n'
        (OUT/md).write_text(front+banner+mapped_body,encoding='utf-8')
        rows.append({**meta,'markdown':md})
    # Manifest.
    lines=['# Safe Legal Markdown Corpus','', '> These files are AI-ready derived references. They are not replacements for the source PDFs as legal authority.','', '| Markdown | Status | Source PDF | PDF pages | Coverage | Article page markers |','|---|---|---|---:|---:|---:|']
    for r in rows:
        lines.append(f"| `{r['markdown']}` | `{r['quality_status']}` | `{r['source_pdf'] or 'none'}` | {r['source_pdf_pages'] or '—'} | {r['automated_pdf_word_coverage'] if r['automated_pdf_word_coverage'] is not None else '—'} | {r['article_page_markers_added']} |")
    (OUT/'SAFE_INDEX.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    # Unmatched PDF catalog with hashes and pages.
    pl=['# Unmatched PDF Sources','', 'These PDFs were supplied but have no direct Markdown counterpart in the audited repository. They must not be silently omitted from an AI corpus.','', '| PDF | SHA-256 | Pages | Required action |','|---|---|---:|---|']
    for name in UNMATCHED_PDFS:
        p=PDFDIR/name
        pl.append(f"| `{name}` | `{sha256(p) if p.exists() else 'missing'}` | {pages(p) if p.exists() else '—'} | Create and review a matching Markdown transcription. |")
    (OUT/'UNMATCHED_PDFS.md').write_text('\n'.join(pl)+'\n',encoding='utf-8')
    (OUT/'safe_manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'output_dir':str(OUT),'markdown_files':len(rows),'statuses':{s:sum(r['quality_status']==s for r in rows) for s in sorted(set(r['quality_status'] for r in rows))}},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
