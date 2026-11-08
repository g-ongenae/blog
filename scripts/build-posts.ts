/** Generate the post list of each given section, keeping its front matter. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENT,
  languageSummary,
  lastUpdated,
  linkTitle,
  readPages,
  splitFrontMatter,
  year,
} from './lib/content.ts';

const FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧' };

for (const section of process.argv.slice(2)) {
  const index = join(CONTENT, section, '_index.md');
  const { front } = splitFrontMatter(readFileSync(index, 'utf8'));
  const pages = readPages(join(CONTENT, section));
  const aiAssisted = pages.filter((page) => page.extra?.['ai-assisted']).length;

  const out = [
    `---${front}---`,
    '',
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
