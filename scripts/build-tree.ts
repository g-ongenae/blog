/** Build the terminal's cached directory tree from the same content as Zola. */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import {
  CONTENT,
  type FrontMatter,
  ROOT,
  compare,
  isPublished,
  parseFrontMatter,
  splitFrontMatter,
} from './lib/content.ts';

interface TreePage {
  [key: string]: unknown;
  path: string;
  title: string | number;
  date: string;
}

interface TreeSection {
  [key: string]: unknown;
  path: string;
  children: TreeSection[];
  pages: TreePage[];
}

function metadata(file: string): FrontMatter {
  const text = readFileSync(file, 'utf8');

  return text.startsWith('---\n') ? parseFrontMatter(splitFrontMatter(text).front) : {};
}

function section(folder: string): TreeSection {
  const data = metadata(join(folder, '_index.md'));
  const folderPath = relative(CONTENT, folder);
  const path = folderPath ? `/${folderPath}/` : '/';

  const node: TreeSection = {
    path,
    title: data.title ?? basename(folder),
    ...data.extra,
    children: [],
    pages: [],
  };

  for (const name of readdirSync(folder).sort(compare)) {
    const child = join(folder, name);

    if (statSync(child).isDirectory()) {
      if (existsSync(join(child, '_index.md'))) {
        node.children.push(section(child));
      }

      continue;
    }

    if (!name.endsWith('.md') || name === '_index.md') {
      continue;
    }

    const page = metadata(child);

    if (!isPublished(page)) {
      continue;
    }

    const slug = page.slug ?? basename(name, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');

    node.pages.push({
      path: `${path}${slug}/`,
      title: page.title,
      date: String(page.date ?? ''),
      lang: 'und',
      ...page.extra,
    });
  }

  node.pages.sort((a, b) => compare(b.date, a.date) || compare(b.path, a.path));

  return node;
}

const tree = section(CONTENT);

writeFileSync(join(ROOT, 'static/tree.json'), `${JSON.stringify(tree, null, 2)}\n`);
