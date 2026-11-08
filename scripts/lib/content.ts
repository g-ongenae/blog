import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export const ROOT = join(import.meta.dirname, '../..');
export const CONTENT = join(ROOT, 'content');

export const LANGUAGES: Record<string, string> = {
  fr: 'French 🇫🇷',
  en: 'English 🇬🇧',
  und: 'Unspecified',
};

export interface Extra {
  [key: string]: unknown;
  lang?: string;
  state?: string;
  suite?: string;
  subtitle?: string;
  pick?: boolean;
  link?: string;
  favorite?: boolean;
  soon?: boolean;
  'ai-assisted'?: boolean;
}

export interface FrontMatter {
  [key: string]: unknown;
  title?: string | number;
  date?: string | number;
  draft?: boolean;
  slug?: string;
  extra?: Extra;
}

export interface Page extends FrontMatter {
  title: string | number;
  file: string;
  body: string;
}

/** Split a file on its first two `---`: the raw front matter and the body after it. */
export function splitFrontMatter(text: string): { front: string; body: string } {
  const [, front = '', ...body] = text.split('---');

  return { front, body: body.join('---') };
}

export function parseFrontMatter(front: string): FrontMatter {
  return (parse(front) as FrontMatter | null) ?? {};
}

export function isPublished(data: FrontMatter): data is FrontMatter & { title: string | number } {
  return Boolean(data.title) && !data.draft;
}

/** Published pages of a folder, newest first. */
export function readPages(folder: string): Page[] {
  const pages: Page[] = [];

  for (const file of readdirSync(folder)) {
    if (!file.endsWith('.md') || file === '_index.md') {
      continue;
    }

    const { front, body } = splitFrontMatter(readFileSync(join(folder, file), 'utf8'));
    const data = parseFrontMatter(front);

    if (isPublished(data)) {
      pages.push({ ...data, file, body });
    }
  }

  return pages.sort(
    (a, b) => compare(String(b.date ?? ''), String(a.date ?? '')) || compare(b.file, a.file),
  );
}

/** Plain string order, not locale-aware, so the lists stay stable across machines. */
export function compare(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function year(page: Page): string {
  return String(page.date ?? 'Undated').slice(0, 4);
}

export function linkTitle(title: string | number): string {
  return String(title).replaceAll('[', '\\[').replaceAll(']', '\\]');
}

export function languageSummary(pages: Page[]): string[] {
  const counts = new Map<string, number>();

  for (const page of pages) {
    const lang = page.extra?.lang ?? 'und';

    counts.set(lang, (counts.get(lang) ?? 0) + 1);
  }

  return [...counts]
    .sort(([a], [b]) => compare(a, b))
    .map(([lang, count]) => `- ${LANGUAGES[lang] ?? lang}: ${String(count)}`);
}

export function lastUpdated(): string {
  return `Last updated on ${new Date().toISOString().slice(0, 10)}`;
}
