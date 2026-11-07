#!/usr/bin/env python3
"""Generate the post list of each given section, keeping its front matter."""
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import sys
import yaml
CONTENT = Path(__file__).resolve().parents[1] / 'content'
LANGS = dict(fr='French 🇫🇷', en='English 🇬🇧', und='Unspecified')
FLAGS = dict(fr='🇫🇷', en='🇬🇧')
def pages(section):
    result = []
    for path in (CONTENT / section).glob('*.md'):
        if path.name == '_index.md': continue
        _, front, _ = path.read_text().split('---', 2)
        data = yaml.safe_load(front) or {}
        if not data.get('title') or data.get('draft'): continue
        result.append(dict(data, file=path.name))
    return sorted(result, key=lambda p: (str(p.get('date', '')), p['file']), reverse=True)
def link_title(title): return str(title).replace('[', r'\[').replace(']', r'\]')
for section in sys.argv[1:]:
    index = CONTENT / section / '_index.md'
    _, front, _ = index.read_text().split('---', 2)
    entries = pages(section)
    out = ['---' + front + '---', '', '## Summary', '', f'**Total:** {len(entries)} <br>', f'**AI-assisted:** {sum(bool(p.get("extra", {}).get("ai-assisted")) for p in entries)} <br>', '**Languages:**', '']
    langs = Counter(p.get('extra', {}).get('lang', 'und') for p in entries)
    for lang, count in sorted(langs.items()): out.append(f'- {LANGS.get(lang, lang)}: {count}')
    out += ['', '## Post list']
    previous = None
    for page in entries:
        year = str(page.get('date', 'Undated'))[:4]
        if year != previous:
            previous = year; out += ['', f'### {year}', '']
        extra = page.get('extra', {})
        line = f'- {page.get("date", "")} · [{link_title(page["title"])}](@/{section}/{page["file"]})'
        if extra.get('lang') in FLAGS: line += f' {FLAGS[extra["lang"]]}'
        if extra.get('link'): line += f' · [LinkedIn]({extra["link"]})'
        out.append(line)
    out += ['', f'Last updated on {datetime.now(timezone.utc):%Y-%m-%d}', '']
    index.write_text('\n'.join(out))
