from __future__ import annotations
import difflib, hashlib, json, re, unicodedata
from pathlib import Path

ROOT = Path('/home/ubuntu/legal_compare_repo')
PDF_TEXT = ROOT / 'work' / 'pdf_text'
RAW_TEXT = ROOT / 'work' / 'raw_text'
OCR_TEXT = ROOT / 'work' / 'ocr_text'
MD_DIR = ROOT / 'repo' / 'legal_refs'
OUT = ROOT / 'work' / 'comparison'
OUT.mkdir(parents=True, exist_ok=True)

PAIRS = [
('06-138JO.pdf','decret-06-138-emissions-atmospheriques.md'),
('21-430.pdf','decret-21-430-gpl-carburant.md'),
('22-167.pdf','decret-22-167-etablissements-classes-modification.md'),
('Arrêtéinterministérieldu21novembre1999.pdf','arrete-interministeriel-1999-11-21-conservation-aliments.md'),
('Arrêtéinterministérieldu2Moharram1438correspondantau4octobre2016fixantlescritèresmicrobiologiquesdesdenréesalimentaires.pdf','arrete-interministeriel-2016-10-04-criteres-microbiologiques.md'),
('Arrêtéinterministérieldu9DhouElKaâda1446correspondantau7mai2025fixantlesconditionsparticulièresd’hygièneetdesalubritéapplicablesdanslesétablissementsderestauration.pdf','arrete-interministeriel-2025-05-07-hygiene-restauration.md'),
('Decret06-198.pdf','decret-06-198-etablissements-classes.md'),
('Decret17-140.pdf','decret-17-140-hygiene-alimentaire.md'),
('Décret02-427.pdf','decret-02-427-prevention-risques-professionnels.md'),
('Décret04-82.pdf','decret-04-82-agrement-sanitaire-animaux.md'),
('Décret06-138.pdf','decret-06-138-emissions-atmospheriques.md'),
('Décret07-144.pdf','decret-07-144-nomenclature-installations-classees.md'),
('Décret09-335.pdf','decret-09-335-plans-internes-intervention.md'),
('Décret76-35.pdf','decret-76-35-igh-incendie.md'),
('Décret83-496.pdf','decret-83-496-gpl-carburant.md'),
('Décret90-245du18août1990(appareilsàpressiondegaz).pdf','decret-90-245-appareils-pression-gaz.md'),
('LOI04-08.pdf','loi-04-08-activites-commerciales.md'),
('LOI90-11.pdf','loi-90-11-relations-travail.md'),
('Loi-03-10.pdf','loi-03-10-protection-environnement.md'),
('Loi01-19.pdf','loi-01-19-gestion-dechets.md'),
('Loi04-20.pdf','loi-04-20-risques-majeurs.md'),
('Loi09-03_frarticle.pdf','loi-09-03-protection-consommateur.md'),
('arrete-interministeriel-2011-02-06-permis-construire-energie.pdf','arrete-interministeriel-2011-02-06-permis-construire-energie.md'),
('dec21-261.pdf','decret-21-261-esp-equipements-hydrocarbures.md'),
('decret-25-63-plans-intervention-catastrophes.pdf','decret-25-63-plans-intervention-catastrophes.md'),
('decret06-141.pdf','decret-06-141-rejets-effluents-liquides.md'),
('decret09-19.pdf','decret-09-19.md'),
('decret11-125.pdf','decret-11-125-eau-consommation-humaine.md'),
('decret21-319.pdf','decret-21-319-autorisation-exploitation-hydrocarbures.md'),
('decret24-196.pdf','decret-24-196-etablissements-classes-modification.md'),
('decret91-05.pdf','decret-91-05-hygiene-securite-milieu-travail.md'),
('decret93-120.pdf','decret-93-120-medecine-du-travail.md'),
('loi05-12.pdf','loi-05-12-ressources-en-eau.md'),
('loi09-03.pdf','loi-09-03-protection-consommateur.md'),
('loi18-11.pdf','loi-18-11-sante.md'),
('loi19-02.pdf','loi-19-02-incendie-panique.md'),
('loi90-29.pdf','loi-90-29-urbanisme.md'),
]

OCR_PDFS = {'Décret76-35.pdf','Décret83-496.pdf','Décret90-245du18août1990(appareilsàpressiondegaz).pdf','decret91-05.pdf','decret93-120.pdf','loi90-29.pdf'}

def safe_stem(name: str) -> str:
    stem = Path(name).stem
    s = stem.encode('ascii','ignore').decode('ascii')
    return ''.join(c for c in s if c.isalnum() or c in '_.-')

def read_pdf(pdf: str) -> tuple[str,str]:
    s = safe_stem(pdf)
    if pdf in OCR_PDFS and (OCR_TEXT / f'{s}.txt').exists():
        return (OCR_TEXT / f'{s}.txt').read_text(errors='replace'), 'OCR'
    raw = RAW_TEXT / f'{s}.txt'
    src = raw if raw.exists() else (PDF_TEXT / f'{s}.txt')
    return src.read_text(errors='replace'), 'native'

def strip_md(s: str) -> str:
    lines=[]
    for line in s.replace('\ufeff','').splitlines():
        if line.startswith('---') and lines and any('Contrôle de séquence' in x for x in lines[-3:]):
            break
        if line.startswith('**Date de') or line.startswith('**Journal Officiel') or line.startswith('**Source PDF') or line.startswith('**Date de conversion') or line.startswith('**Statut de vérification'):
            continue
        if line.startswith('> **AVERTISSEMENT') or line.startswith('> **NOTE'):
            continue
        if line.startswith('## Contrôle de séquence') or line.startswith('## Intégrité du texte'):
            break
        line = re.sub(r'^\s*#{1,6}\s*', '', line)
        line = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
        line = re.sub(r'\*([^*]+)\*', r'\1', line)
        line = re.sub(r'`([^`]+)`', r'\1', line)
        line = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', line)
        if line.strip() in {'---','***'}:
            continue
        lines.append(line)
    return '\n'.join(lines)

def strip_pdf_headers(s: str) -> str:
    out=[]
    for line in s.replace('\x0c','\n').splitlines():
        t=line.strip()
        if not t:
            out.append(''); continue
        if 'JOURNAL OFFICIEL DE LA REPUBLIQUE ALGERIENNE' in t or 'JOURNAL OFFICIEL' in t:
            continue
        if re.fullmatch(r'N[°oº]?\s*\d+\s*', t):
            continue
        if re.fullmatch(r'\d+\s*', t):
            continue
        out.append(line)
    return '\n'.join(out)

def canon(s: str) -> str:
    s = unicodedata.normalize('NFKC', s).replace('\u00a0',' ')
    s = s.replace('œ','oe').replace('Œ','OE').replace('’',"'").replace('–','-').replace('—','-')
    s = re.sub(r'\s+', ' ', s).strip().lower()
    # PDF/OCR line-break hyphenation and common article-label variants.
    s = re.sub(r'(?<=\w)- (?=\w)', '', s)
    s = re.sub(r'\barticles?\s+(\d+)\s*er\b', r'article \1', s)
    s = re.sub(r'\bart\.\s*(\d+)\s*er\b', r'art. \1', s)
    return s

def article_seq(s: str):
    seq=[]
    for line in s.replace('\x0c','\n').splitlines():
        t=line.strip().lower()
        m=re.match(r'^\s*(?:\*\*)?(?:article|art\.?)\s+(\d+)(?:er|e)?\s*[.\-—:]?', t)
        if m:
            seq.append(int(m.group(1)))
    return seq

def ratio(a: str,b: str) -> float:
    aw=a.split(); bw=b.split()
    if not aw or not bw: return 0.0
    return difflib.SequenceMatcher(None, aw, bw, autojunk=True).ratio()

def main():
    results=[]
    for pdf,md in PAIRS:
        ptxt,source=read_pdf(pdf)
        mtxt=MD_DIR.joinpath(md).read_text(errors='replace')
        pbody=strip_pdf_headers(ptxt)
        mbody=strip_md(mtxt)
        pc=canon(pbody); mc=canon(mbody)
        pa=article_seq(pbody); ma=article_seq(mbody)
        r={
            'pdf':pdf,'markdown':md,'pdf_source':source,
            'pdf_chars':len(pc),'md_chars':len(mc),
            'char_length_ratio':round(min(len(pc),len(mc))/max(len(pc),len(mc)),4) if pc and mc else 0,
            'word_similarity':round(ratio(pc,mc),4),
            'normalized_exact':pc==mc,
            'pdf_article_count':len(pa),'md_article_count':len(ma),
            'article_sequence_equal':pa==ma,
            'pdf_articles':pa[:1000],'md_articles':ma[:1000],
        }
        if not r['article_sequence_equal']:
            r['first_article_mismatch_index']=next((i for i,(x,y) in enumerate(zip(pa,ma)) if x!=y), min(len(pa),len(ma)))
        results.append(r)
        safe=safe_stem(pdf)
        (OUT/f'{safe}__vs__{Path(md).stem}.diff.txt').write_text('\n'.join(difflib.unified_diff(pc.split(),mc.split(),fromfile=pdf,tofile=md,n=3))[:200000])
    (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(json.dumps([{k:r[k] for k in ('pdf','markdown','pdf_source','pdf_chars','md_chars','char_length_ratio','word_similarity','normalized_exact','pdf_article_count','md_article_count','article_sequence_equal')} for r in results],ensure_ascii=False,indent=2))

if __name__=='__main__': main()
