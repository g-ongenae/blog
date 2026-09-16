#!/usr/bin/env python3
"""Build the terminal's cached directory tree from the same content as Zola."""
import json
import re
from pathlib import Path
import yaml
ROOT = Path(__file__).resolve().parents[1]
def metadata(path):
    text = path.read_text()
    return yaml.safe_load(text.split('---', 2)[1]) or {} if text.startswith('---\n') else {}
def section(folder):
    data = metadata(folder / '_index.md')
    relative = folder.relative_to(ROOT / 'content').as_posix()
    path = '/' if relative == '.' else '/' + relative + '/'
    node = dict(path=path, title=data.get('title', folder.name), **data.get('extra', {}), children=[], pages=[])
    for child in sorted(folder.iterdir()):
        if child.is_dir() and (child / '_index.md').exists(): node['children'].append(section(child))
        elif child.suffix == '.md' and child.name != '_index.md':
            page = metadata(child)
            if not page.get('title') or page.get('draft'): continue
            node['pages'].append(dict(path=path + page.get('slug', re.sub(r'^\d{4}-\d{2}-\d{2}-', '', child.stem)) + '/', title=page['title'], date=str(page.get('date', '')), **dict({'lang': 'und'}, **page.get('extra', {}))))
    node['pages'].sort(key=lambda p: (p['date'], p['path']), reverse=True)
    return node
(ROOT / 'static/tree.json').write_text(json.dumps(section(ROOT / 'content'), ensure_ascii=False, indent=2) + '\n')
