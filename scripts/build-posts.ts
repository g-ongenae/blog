/** Generate the post list of each given section, keeping its front matter. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import {
  CONTENT,
  languageSummary,
  lastUpdated,
  linkTitle,
  readPages,
  ROOT,
  splitFrontMatter,
  year,
} from './lib/content.ts';

const FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧' };

// The section page charts every post by topic, so each one needs a known topic.
const TOPICS = new Set(
  (parse(readFileSync(join(ROOT, 'data/topics.yaml'), 'utf8')) as { key: string }[]).map(
    (topic) => topic.key,
  ),
);

for (const section of process.argv.slice(2)) {
  const index = join(CONTENT, section, '_index.md');
  const { front, body } = splitFrontMatter(readFileSync(index, 'utf8'));
  // Text written above the generated summary is the section's own intro; keep it.
  const intro = body.split('## Summary')[0]?.trim();
  const pages = readPages(join(CONTENT, section));
  const untagged = pages.filter((page) => !TOPICS.has(page.extra?.topic ?? ''));

  if (untagged.length) {
    throw new Error(
      `Set extra.topic to one of ${[...TOPICS].join(', ')} (data/topics.yaml) in ${untagged
        .map((page) => `${section}/${page.file}`)
        .join(', ')}`,
    );
  }

  const aiAssisted = pages.filter((page) => page.extra?.['ai-assisted']).length;

  const out = [
    `---${front}---`,
    '',
    ...(intro ? [intro, ''] : []),
    '## Summary',
    '',
    `**Total:** ${String(pages.length)} <br>`,
    `**AI-assisted:** ${String(aiAssisted)} <br>`,
    '**Languages:**',
    '',
    ...languageSummary(pages),
    '',
    '## Post list',
  ];

  let previous: string | undefined;

  for (const page of pages) {
    if (year(page) !== previous) {
      previous = year(page);
      out.push('', `### ${previous}`, '');
    }

    const { lang, link } = page.extra ?? {};
    let line = `- ${String(page.date ?? '')} · [${linkTitle(page.title)}](@/${section}/${page.file})`;

    if (lang && FLAGS[lang]) {
      line += ` ${FLAGS[lang]}`;
    }

    if (link) {
      line += ` · [LinkedIn](${link})`;
    }

    out.push(line);
  }

  out.push('', lastUpdated(), '');
  writeFileSync(index, out.join('\n'));
}
