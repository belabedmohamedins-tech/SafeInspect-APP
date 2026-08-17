from pathlib import Path
import json, subprocess
ROOT=Path('/home/ubuntu/legal_compare_repo/repo'); LEGAL=ROOT/'legal_refs'
issues=[]
md=list(LEGAL.glob('*.md'))
for p in md:
    t=p.read_text(errors='replace')
    if p.name not in {'GAP_FILL_REPORT.md','AI_AGENT_RULES.md','AI_SAFETY_POLICY.md','SAFE_INDEX.md','UNMATCHED_PDFS.md','VERIFICATION_REPORT.md'}:
        if not t.startswith('---\n') or 'quality_status:' not in t or 'AI SAFETY NOTICE' not in t:
            issues.append({'file':p.name,'issue':'missing provenance or safety wrapper'})
# Manual source correction checks.
p=LEGAL/'decret-21-261-esp-equipements-hydrocarbures.md'; t=p.read_text(errors='replace')
t_norm=t.replace('’',"'").replace('–','-').replace('—','-')
checks=[('Article 50 source scope',"Sont soumis au présent décret, qu'ils soient fabriqués localement ou importés de l'étranger"),('Article 51 source exclusions',"Ne sont pas soumis aux dispositions du présent décret"),('Article 56 restored',"L'étude de dimensionnement des systèmes de protection cathodique"),('Article 57 dossier',"Le maître de l'ouvrage doit transmettre à l'ARH pour approbation, un dossier technique des systèmes de protection cathodique"),('Typo correction',"certificats de tarage et/ou d'étalonnage")]
for label,s in checks:
    if s not in t_norm: issues.append({'file':p.name,'issue':label})
source_only=sorted(x.name for x in LEGAL.glob('source-only-*.md'))
if len(source_only)!=6: issues.append({'issue':'source-only count','expected':6,'actual':len(source_only)})
try:
    out=subprocess.run(['git','diff','--check'],cwd=ROOT,text=True,capture_output=True)
    if out.returncode: issues.append({'issue':'git diff --check','details':out.stdout+out.stderr})
except Exception as e: issues.append({'issue':'git diff check failed','details':str(e)})
result={'markdown_files':len(md),'source_only_files':len(source_only),'issues':issues,'issue_count':len(issues)}
(LEGAL/'GAP_FILL_VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False,indent=2))
