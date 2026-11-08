/** Catch terminal URLs that disagree with Zola's generated routes. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/content.ts';

interface Node {
  path: string;
  soon?: boolean;
  children?: Node[];
  pages?: Node[];
}

const stack = [JSON.parse(readFileSync(join(ROOT, 'static/tree.json'), 'utf8')) as Node];
let count = 0;

for (let node = stack.pop(); node; node = stack.pop()) {
  const destination = join(ROOT, 'public', node.path, 'index.html');

  if (node.soon) {
    assert.ok(!existsSync(destination), `Coming-soon section was rendered: ${destination}`);
  } else {
    assert.ok(existsSync(destination), `Terminal destination is missing: ${destination}`);
  }

  stack.push(...(node.children ?? []), ...(node.pages ?? []));
  count += 1;
}

console.log(`All ${String(count)} tree destinations verified against the Zola build.`);
