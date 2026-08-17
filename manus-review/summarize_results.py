import json
from pathlib import Path
p=Path('/home/ubuntu/legal_compare_repo/work/comparison/results.json')
rows=json.loads(p.read_text())
print('pdf\tmarkdown\tsource\tpdf_chars\tmd_chars\tlen_ratio\tword_similarity\tpdf_articles\tmd_articles\tarticle_equal\texact')
for r in rows:
    print('\t'.join(str(r[k]) for k in ['pdf','markdown','pdf_source','pdf_chars','md_chars','char_length_ratio','word_similarity','pdf_article_count','md_article_count','article_sequence_equal','normalized_exact']))
print('\nCOUNTS')
print('pairs',len(rows))
print('native',sum(r['pdf_source']=='native' for r in rows))
print('ocr',sum(r['pdf_source']=='OCR' for r in rows))
print('article_equal',sum(r['article_sequence_equal'] for r in rows))
print('exact',sum(r['normalized_exact'] for r in rows))
print('high_similarity_ge_0.90',sum(r['word_similarity']>=0.90 for r in rows))
print('medium_similarity_0.70_0.90',sum(0.70<=r['word_similarity']<0.90 for r in rows))
print('low_similarity_lt_0.70',sum(r['word_similarity']<0.70 for r in rows))
