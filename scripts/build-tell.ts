/**
 * Generate the literature landing page (editor's picks and latest texts) and the
 * complete poem and story lists, from authored metadata, never filename dates.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENT,
  type Page,
  languageSummary,
  lastUpdated,
  linkTitle,
  readPages,
  splitFrontMatter,
  year,
} from './lib/content.ts';

const TELL = join(CONTENT, 'tell');
const FIRST_YEAR = 2007;

const KINDS = [
  { kind: 'poems', label: 'Poems', singular: 'Poem', emoji: '💌', latest: 3 },
  { kind: 'stories', label: 'Stories', singular: 'Story', emoji: '📖', latest: 1 },
] as const;

type Kind = (typeof KINDS)[number]['kind'];

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

/** Upper bounds are exclusive. Mermaid escapes a literal `<` twice; `#lt;` is its own entity. */
const BANDS = [
  { label: '#lt; 100', max: 100 },
  { label: '100–300', max: 300 },
  { label: '300–1k', max: 1000 },
  { label: '1k–3k', max: 3000 },
  { label: '3k+', max: Infinity },
] as const;

function storiesChart(stories: Page[]): string[] {
  const bands = stories.map((page) => BANDS.findIndex(({ max }) => words(page) < max));
  const counts = BANDS.map((_, i) => bands.filter((band) => band === i).length);

  const finished = BANDS.map(
    (_, i) => stories.filter((page, j) => bands[j] === i && page.extra?.state !== 'draft').length,
  );

  return [
    '  title "Story lengths"',
    `  x-axis "Words" [${BANDS.map(({ label }) => `"${label}"`).join(', ')}]`,
    `  y-axis "Stories" 0 --> ${String(Math.max(...counts))}`,
    // Mermaid draws bar series over each other: the finished bar covers the total but its drafts.
    `  bar ${list(counts)}`,
    `  bar ${list(finished)}`,
    '```',
    '',
    'Bars: stories per length band. Bright: finished. Dim top: drafts.',
  ];
}

/** A list item: the title links to the text, the subtitle (credits) follows it. */
function item(kind: Kind, page: Page): string {
  const extra = page.extra ?? {};

  const title =
    extra.suite && extra.suite !== 'none' ? `${extra.suite}: ${String(page.title)}` : page.title;

  let line = `- [${linkTitle(title)}](@/tell/${kind}/${page.file})`;

  if (extra.subtitle) {
    line += ` · _${extra.subtitle}_`;
  }

  line += (extra.state === 'draft' ? ' ✂︎' : '') + (extra.favorite ? ' ⭐' : '');

  if (kind === 'stories') {
    line += ` (${String(words(page))} words)`;
  }

  return line;
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

for (const { kind, label, singular, emoji, latest } of KINDS) {
  const pages = readPages(join(TELL, kind));
  const drafts = pages.filter((page) => page.extra?.state === 'draft').length;
  const favorites = pages.filter((page) => page.extra?.favorite).length;
  const recent = pages.slice(0, latest);

  const recentHeading =
    kind === 'stories' && recent[0]?.extra?.state === 'draft' ? 'Currently writing' : 'Latest';

  out.push(
    `## ${emoji} ${label}`,
    '',
    "### Editor's picks",
    '',
    ...pages.filter((page) => page.extra?.pick).map((page) => item(kind, page)),
    '',
    `### ${recentHeading}`,
    '',
    ...recent.map((page) => item(kind, page)),
    '',
    `[All ${String(pages.length)} ${kind} by year →](@/tell/${kind}/_index.md)`,
    '',
  );

  const index = join(TELL, kind, '_index.md');
  const { front } = splitFrontMatter(readFileSync(index, 'utf8'));

  const full = [
    `---${front}---`,
    '',
    '## Summary',
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
    `## ${singular} list`,
    '',
    '✂︎ Draft · ⭐ Favourite',
  ];

  let previous: string | undefined;

  for (const page of pages) {
    if (year(page) !== previous) {
      previous = year(page);
      full.push('', `### ${previous}`, '');
    }

    full.push(item(kind, page));
  }

  full.push('', lastUpdated(), '');
  writeFileSync(index, full.join('\n'));
}

out.push(lastUpdated(), '');
writeFileSync(join(TELL, '_index.md'), out.join('\n'));
