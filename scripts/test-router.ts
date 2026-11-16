import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRouter } from '../static/router.js';
import { ROOT } from './lib/content.ts';

interface TreeNode {
  path: string;
  state?: string;
  favorite?: boolean;
  children?: TreeNode[];
  pages?: TreeNode[];
}

const tree = JSON.parse(readFileSync(join(ROOT, 'static/tree.json'), 'utf8')) as TreeNode;

// Derive expectations from the generated tree so adding content never breaks the checks.
const findNode = (node: TreeNode, path: string): TreeNode | undefined =>
  node.path === path ? node : node.children?.map((child) => findNode(child, path)).find(Boolean);

const pagesUnder = (node: TreeNode): TreeNode[] => [
  ...(node.pages ?? []),
  ...(node.children ?? []).flatMap(pagesUnder),
];

const plural = (n: number, word: string) => `${String(n)} ${word}${n === 1 ? '' : 's'}`;

const poemsNode = findNode(tree, '/tell/poems/');

assert.ok(poemsNode, 'tree.json has no /tell/poems/ section');

const poemPages = pagesUnder(poemsNode);

const expectedPoemStat = [
  plural(poemPages.length, 'page'),
  plural(poemPages.filter((p) => p.state === 'draft').length, 'draft'),
  plural(poemPages.filter((p) => p.favorite).length, 'favourite'),
].join(' · ');

assert.ok(poemPages.length > 10, 'expected more than 10 poems for head/tail checks');

let destination: string | undefined;

const options = {
  root: 'https://example.com/blog/',
  navigate: (url: string) => {
    destination = url;
  },
};

const root = createRouter(tree, options);

type Row = ReturnType<typeof root.commands>[number] | undefined;
const text = (row: Row) => (typeof row === 'string' ? row : (row?.text ?? ''));
const href = (row: Row) => (typeof row === 'string' ? undefined : row?.href);

root.commands('cd tell/poems');
assert.equal(destination, 'https://example.com/blog/tell/poems/');
assert.deepEqual(root.commands('cd listen'), ['fatal: coming soon']);
assert.deepEqual(root.complete('cd li'), []);

const datedPoem = root.commands('find Joie de la découverte')[0];

assert.equal(href(datedPoem), 'https://example.com/blog/tell/poems/joie-de-la-decouverte/');
assert.deepEqual(root.complete('cd tell/po'), ['cd tell/poems/']);

const poems = createRouter(tree, { ...options, directory: '/tell/poems/' });

poems.commands('cat euphonie');
assert.match(destination, /2025-euphonie\/$/);
poems.commands('cd ..');
assert.equal(destination, 'https://example.com/blog/tell/');
poems.commands('cd ~');
assert.equal(destination, 'https://example.com/blog/');
assert.ok(poems.commands('find découverte').some((row) => text(row) === 'Joie de la découverte'));
assert.deepEqual(poems.commands('stat'), [expectedPoemStat]);
assert.equal(poems.commands('head').length, 10);
assert.equal(poems.commands('tail').length, 10);
poems.commands('random');
assert.match(destination, /\/tell\/poems\/[^/]+\/$/);

root.commands('cd ..');
assert.equal(destination, 'https://g-ongenae.github.io/');
assert.match(text(root.commands('cat tell')[0]), /Is a directory/);
assert.match(text(root.commands('cd nowhere')[0]), /no such file/);
const rootEntries = (tree.children?.length ?? 0) + (tree.pages?.length ?? 0);

assert.equal(root.commands('ls -la').length, rootEntries);
assert.ok(root.commands('tree').length > rootEntries);

const single = createRouter(
  {
    path: '/',
    title: 'blog',
    children: [],
    pages: [{ path: '/one/', title: 'One', date: '2026-01-01', state: 'draft', favorite: true }],
  },
  options,
);

assert.deepEqual(single.commands('stat'), ['1 page · 1 draft · 1 favourite']);

console.log('Router checks passed.');
