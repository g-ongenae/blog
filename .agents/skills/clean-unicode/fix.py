#!/usr/bin/env python3
"""Replace Unicode bold/italic/strikethrough with Markdown in the given files.

Body: 𝗯𝗼𝗹𝗱 → **bold**, 𝘪𝘵𝘢𝘭𝘪𝘤 → *italic*, 𝙗𝙤𝙩𝙝 → ***both***, 𝚌𝚘𝚍𝚎 → `code`,
s̶t̶r̶u̶c̶k̶ → ~~struck~~.
Front matter: styled letters become plain letters, without markup.
Spans already wrapped in the right markers are not wrapped again.
Prints each changed file; --check only lists them and exits 1 if any.
"""
import sys
import unicodedata
from pathlib import Path

# Punctuation kept inside a span when it directly follows the last styled letter.
TRAILING = '.!?…'
# Combining short and long stroke overlays.
STROKES = '\u0335\u0336'


def style(ch):
    """Markdown marker of a styled letter, '' for other styles, None if unstyled."""
    name = unicodedata.name(ch, '')
    if not name.startswith('MATHEMATICAL '):
        return None
    if 'MONOSPACE' in name:
        return '`'
    marker = ('**' if 'BOLD' in name else '') + ('*' if 'ITALIC' in name else '')
    return marker


def plain(text):
    """Styled letters to plain letters, combining accents composed (𝘢̀ → à)."""
    out = ''.join(unicodedata.normalize('NFKC', c) if style(c) is not None else c for c in unstrike(text))
    return unicodedata.normalize('NFC', out)


def unstrike(text):
    return ''.join(c for c in text if c not in STROKES)


def is_neutral(ch):
    """Characters that may sit between two styled letters of a span."""
    return unicodedata.category(ch)[0] in 'MPZ' and ch not in '*_`'


def strike(line):
    """Letters with stroke overlays (s̶t̶r̶u̶c̶k̶) to ~~struck~~."""
    clusters = []
    for ch in line:
        if clusters and unicodedata.category(ch) == 'Mn': clusters[-1] += ch
        else: clusters.append(ch)
    struck = [any(c in STROKES for c in g) for g in clusters]
    out, i = [], 0
    while i < len(clusters):
        if not struck[i]:
            out.append(clusters[i]); i += 1; continue
        end = last = i
        while end < len(clusters) and (struck[end] or is_neutral(clusters[end][0])):
            if struck[end]: last = end
            end += 1
        end = last + 1
        span = unicodedata.normalize('NFC', unstrike(''.join(clusters[i:end])))
        core = span.strip()
        lead, trail = span[:len(span) - len(span.lstrip())], span[len(span.rstrip()):]
        before, after = ''.join(out) + lead, trail + ''.join(clusters[end:])
        wrapped = not core or (before.endswith('~~') and after.startswith('~~'))
        out.append(span if wrapped else lead + '~~' + core + '~~' + trail)
        i = end
    return ''.join(out)


def convert_line(line):
    line = strike(line)
    out, i = [], 0
    while i < len(line):
        marker = style(line[i])
        if marker is None:
            out.append(line[i]); i += 1; continue
        end = last = i
        while end < len(line):
            s = style(line[end])
            if s == marker: last = end
            elif s is not None or not is_neutral(line[end]): break
            end += 1
        end = last + 1
        while end < len(line) and unicodedata.category(line[end]) == 'Mn': end += 1
        while end < len(line) and line[end] in TRAILING: end += 1
        span = plain(line[i:end])
        before, after = ''.join(out), line[end:]
        wrapped = not marker or (before.endswith(marker) and after.startswith(marker))
        out.append(span if wrapped else marker + span + marker)
        i = end
    return ''.join(out)


def convert(text):
    lines = text.split('\n')
    fence = 0 if lines[0] == '---' else 2
    for n, line in enumerate(lines):
        if line == '---' and fence < 2:
            fence += 1; continue
        lines[n] = plain(line) if fence == 1 else convert_line(line)
    return '\n'.join(lines)


def main(args):
    check = '--check' in args
    changed = []
    for name in (a for a in args if a != '--check'):
        path = Path(name)
        text = path.read_text()
        new = convert(text)
        if new != text:
            changed.append(name)
            if not check: path.write_text(new)
    print('\n'.join(changed))
    return 1 if check and changed else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
