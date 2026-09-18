import json
import re
from pathlib import Path

def parse_articles_from_md(md_content, doc_id):
    articles = []
    
    # Try header format first
    header_pattern = re.compile(r'^#{2,3}\s*Article\s+(\d+[a-z]?|1er)\s*$', re.MULTILINE | re.IGNORECASE)
    
    if header_pattern.search(md_content):
        parts = header_pattern.split(md_content)
        for i in range(1, len(parts), 2):
            if i >= len(parts):
                break
            article_num = parts[i].strip()
            article_text = parts[i + 1].strip() if i + 1 < len(parts) else ""
            articles.append({
                'article_number': article_num,
                'text': article_text,
                'doc_id': doc_id
            })
    else:
        # Inline format
        inline_pattern = re.compile(r'(?:Article|Art\.)\s+(\d+[a-z]?|1er)\.\s*—\s*(.+?)(?=\n\s*(?:Article|Art\.)\s+\d+\.?\s*—|\Z)', re.DOTALL | re.IGNORECASE)
        matches = inline_pattern.findall(md_content)
        for article_num, article_text in matches:
            articles.append({
                'article_number': article_num,
                'text': article_text.strip(),
                'doc_id': doc_id
            })
    
    return articles

md_dir = Path('legal_refs')
all_articles = []
doc_metadata = {}

for md_file in sorted(md_dir.glob('*.md')):
    if md_file.name.startswith('_') or 'diff' in md_file.name or md_file.name in ['README.md', 'LEGAL_EXTRACTION_PROTOCOL.md']:
        continue
    
    doc_id = md_file.stem
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    articles = parse_articles_from_md(content, doc_id)
    
    if articles:
        all_articles.extend(articles)
        doc_metadata[doc_id] = {'article_count': len(articles)}
        print(f"OK {doc_id}: {len(articles)} articles")
    else:
        print(f"WARN {doc_id}: No articles found")

index = {
    'metadata': {
        'total_articles': len(all_articles),
        'total_documents': len(doc_metadata),
        'documents': doc_metadata
    },
    'articles': all_articles
}

with open('legal_refs/articles_index.json', 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

print(f"\nDone: {len(all_articles)} articles from {len(doc_metadata)} documents")
