/** Generate the literature index from authored metadata, never filename dates. */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENT,
  type Page,
  languageSummary,
  lastUpdated,
  linkTitle,
  readPages,
  year,
} from './lib/content.ts';

const TELL = join(CONTENT, 'tell');
const FIRST_YEAR = 2007;

const KINDS = [
  { kind: 'poems', label: 'Poems', singular: 'Poem', emoji: '💌' },
  { kind: 'stories', label: 'Stories', singular: 'Story', emoji: '📖' },
] as const;

function words(page: Page): number {
  return page.body.split(/\s+/).filter(Boolean).length;
}

function list(values: number[]): string {
  return `[${values.join(', ')}]`;
}

function poemsChart(poems: Page[]): string[] {
  const lastYear = new Date().getUTCFullYear();
  const years = Array.from({ length: lastYear - FIRST_YEAR + 1 }, (_, i) => String(FIRST_YEAR + i));
  const counts = years.map((y) => poems.filter((page) => year(page) === y).length);

  const favorites = years.map(
    (y) => poems.filter((page) => year(page) === y && page.extra?.favorite).length,
  );

  return [
    '  title "Poems per year"',
    `  x-axis "Year" ${String(FIRST_YEAR)} --> ${String(lastYear)}`,
    `  y-axis "Poems" 0 --> ${String(Math.max(...counts))}`,
    `  bar ${list(counts)}`,
    `  line ${list(favorites)}`,
    '```',
    '',
    'Bars: poems per year. Line: favourites per year.',
  ];
}

function storiesChart(stories: Page[]): string[] {
  const lengths = stories.map(words);

  return [
    '  title "Story lengths (in words)"',
    `  x-axis "Story (list order)" 1 --> ${String(stories.length)}`,
    `  y-axis "Words" 0 --> ${String(Math.max(...lengths))}`,
    `  line ${list(lengths)}`,
    '```',
  ];
}

const out = [
  '---',
  'title: Literature',
  'weight: 3',
  'description: Poems and stories by Guillaume Ongenae, in French and English.',
  'extra:',
  '  emoji: 🖋️',
  '---',
  '',
];

for (const { kind, label, singular, emoji } of KINDS) {
  const pages = readPages(join(TELL, kind));
  const drafts = pages.filter((page) => page.extra?.state === 'draft').length;
  const favorites = pages.filter((page) => page.extra?.favorite).length;

  out.push(
    `## ${emoji} ${label}`,
    '',
    `[Browse all ${kind}](@/tell/${kind}/_index.md)`,
    '',
    '### Summary',
    '',
    `**Total:** ${String(pages.length)} <br>`,
    `**Drafts:** ${String(drafts)} <br>`,
    `**Favourites:** ${String(favorites)} <br>`,
    '**Languages:**',
    '',
    ...languageSummary(pages),
    '',
    '```mermaid',
    'xychart-beta',
    ...(kind === 'poems' ? poemsChart(pages) : storiesChart(pages)),
    '',
    `### ${singular} list`,
    '',
    '✂︎ Draft · ⭐ Favourite',
    '',
  );

  let previous: string | undefined;

  for (const page of pages) {
    if (year(page) !== previous) {
      previous = year(page);
      out.push('', `#### ${previous}`, '');
    }

    const extra = page.extra ?? {};

    const title =
      extra.suite && extra.suite !== 'none' ? `${extra.suite}: ${String(page.title)}` : page.title;

    let badges = (extra.state === 'draft' ? ' ✂︎' : '') + (extra.favorite ? ' ⭐' : '');

    if (kind === 'stories') {
      badges += ` (${String(words(page))} words)`;
    }

    out.push(`- [${linkTitle(title)}](@/tell/${kind}/${page.file})${badges}`);
  }

  out.push('');
}

out.push(lastUpdated(), '');
writeFileSync(join(TELL, '_index.md'), out.join('\n'));
