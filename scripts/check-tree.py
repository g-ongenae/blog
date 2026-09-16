#!/usr/bin/env python3
"""Catch terminal URLs that disagree with Zola's generated routes."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
stack = [json.loads((ROOT / 'static/tree.json').read_text())]
count = 0
while stack:
    node = stack.pop()
    destination = ROOT / 'public' / node['path'].strip('/') / 'index.html'
    if node.get('soon'):
        assert not destination.exists(), f'Coming-soon section was rendered: {destination}'
    else:
        assert destination.exists(), f'Terminal destination is missing: {destination}'
    stack.extend(node.get('children', []))
    stack.extend(node.get('pages', []))
    count += 1
print(f'All {count} tree destinations verified against the Zola build.')
