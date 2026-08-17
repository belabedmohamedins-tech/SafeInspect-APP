from pathlib import Path
import json
OUT=Path('/home/ubuntu/legal_compare_repo/safe_legal_refs')
rows=json.loads((OUT/'safe_manifest.json').read_text())
extra=json.loads((OUT/'UNMATCHED_SOURCE_MANIFEST.json').read_text())
rows.extend(extra)
(OUT/'safe_manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
lines=['# Safe Legal Markdown Corpus','', '> These files are AI-ready derived references. They are not replacements for the source PDFs as legal authority.','', '| Markdown | Status | Source PDF | PDF pages | Coverage | Article/page markers |','|---|---|---|---:|---:|---:|']
for r in sorted(rows,key=lambda x:x['markdown']):
    cov=r.get('automated_pdf_word_coverage')
    markers=r.get('article_page_markers_added',r.get('extracted_pages','—'))
    lines.append(f"| `{r['markdown']}` | `{r['quality_status']}` | `{r.get('source_pdf') or 'none'}` | {r.get('source_pdf_pages') or '—'} | {cov if cov is not None else '—'} | {markers} |")
(OUT/'SAFE_INDEX.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'files':len(rows),'status_counts':{s:sum(r['quality_status']==s for r in rows) for s in sorted({r['quality_status'] for r in rows})}},ensure_ascii=False,indent=2))
