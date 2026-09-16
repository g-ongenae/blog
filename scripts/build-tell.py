#!/usr/bin/env python3
"""Generate the literature index from authored metadata, never filename dates."""
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import yaml
ROOT = Path(__file__).resolve().parents[1] / 'content/tell'
def pages(kind):
    result = []
    for path in (ROOT / kind).glob('*.md'):
        if path.name == '_index.md': continue
        _, front, body = path.read_text().split('---', 2)
        data = yaml.safe_load(front) or {}
        if not data.get('title') or data.get('draft'): continue
        result.append(dict(data, file=path.name, words=len(body.split())))
    return sorted(result, key=lambda p: (str(p.get('date', '')), p['file']), reverse=True)
def year(page): return str(page.get('date', 'Undated'))[:4]
def link_title(title): return str(title).replace('[', r'\[').replace(']', r'\]')
out = ['---', 'title: Literature', 'weight: 3', 'description: Poems and stories by Guillaume Ongenae, in French and English.', 'extra:', '  emoji: 🖋️', '---', '']
for kind, label, emoji in [('poems', 'Poems', '💌'), ('stories', 'Stories', '📖')]:
    entries = pages(kind)
    out += [f'## {emoji} {label}', '', f'[Browse all {kind}](@/tell/{kind}/_index.md)', '', '### Summary', '', f'**Total:** {len(entries)} <br>', f'**Drafts:** {sum(p.get("extra", {}).get("state") == "draft" for p in entries)} <br>', f'**Favorites:** {sum(bool(p.get("extra", {}).get("favorite")) for p in entries)} <br>', '**Languages:**', '']
    langs = Counter(p.get('extra', {}).get('lang', 'und') for p in entries)
    for lang, count in sorted(langs.items()): out.append(f'- {dict(fr="French 🇫🇷", en="English 🇬🇧", und="Unspecified").get(lang, lang)}: {count}')
    out += ['', '```mermaid', 'xychart-beta']
    if kind == 'poems':
        years = list(range(2007, datetime.now(timezone.utc).year + 1))
        counts = [sum(year(p) == str(y) for p in entries) for y in years]
        favorites = [sum(year(p) == str(y) and bool(p.get('extra', {}).get('favorite')) for p in entries) for y in years]
        out += ['  title "Poems per year"', f'  x-axis "Year" 2007 --> {years[-1]}', f'  y-axis "Poems" 0 --> {max(counts)}', f'  bar {counts}', f'  line {favorites}', '```', '', 'Bars: poems per year. Line: favourites per year.']
    else:
        lengths = [p['words'] for p in entries]
        out += ['  title "Story lengths (in words)"', f'  x-axis "Story (list order)" 1 --> {len(entries)}', f'  y-axis "Words" 0 --> {max(lengths)}', f'  line {lengths}', '```']
    out += ['', f'### {"Poem" if kind == "poems" else "Story"} list', '', '✂︎ Draft · ⭐ Favourite', '']
    previous = None
    for page in entries:
        if year(page) != previous:
            previous = year(page); out += ['', f'#### {previous}', '']
        extra = page.get('extra', {})
        title = page['title']
        if extra.get('suite') and extra['suite'] != 'none': title = f'{extra["suite"]}: {title}'
        badges = (' ✂︎' if extra.get('state') == 'draft' else '') + (' ⭐' if extra.get('favorite') else '')
        if kind == 'stories': badges += f' ({page["words"]} words)'
        out.append(f'- [{link_title(title)}](@/tell/{kind}/{page["file"]}){badges}')
    out.append('')
out += [f'Last updated on {datetime.now(timezone.utc):%Y-%m-%d}', '']
(ROOT / '_index.md').write_text('\n'.join(out))
