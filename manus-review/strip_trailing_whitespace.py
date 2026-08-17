from pathlib import Path
root=Path('/home/ubuntu/legal_compare_repo/repo')
files=sorted(root.glob('legal_refs/*.md'))
for p in files:
    text=p.read_text(errors='replace').lstrip('\ufeff')
    p.write_text('\n'.join(line.rstrip() for line in text.splitlines())+'\n',encoding='utf-8')
print(f'cleaned {len(files)} files')
