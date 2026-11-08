/**
 * Replace Unicode bold/italic/strikethrough with Markdown in the given files.
 *
 * Body: 𝗯𝗼𝗹𝗱 → **bold**, 𝘪𝘵𝘢𝘭𝘪𝘤 → *italic*, 𝙗𝙤𝙩𝙝 → ***both***, 𝚌𝚘𝚍𝚎 → `code`,
 * s̶t̶r̶u̶c̶k̶ → ~~struck~~.
 * Front matter: styled letters become plain letters, without markup.
 * Spans already wrapped in the right markers are not wrapped again.
 * Prints each changed file; --check only lists them and exits 1 if any.
 *
 * Strings are handled as arrays of code points: styled letters are outside the BMP.
 */
/* eslint-disable @typescript-eslint/no-misused-spread -- splitting into code points is the point */
import { readFileSync, writeFileSync } from 'node:fs';

// Punctuation kept inside a span when it directly follows the last styled letter.
const TRAILING = '.!?…';
// Combining short and long stroke overlays.
const STROKES = '̵̶';

// Characters named "MATHEMATICAL …", with the Markdown marker of their style:
// '' for styles Markdown can't express (script, fraktur, double-struck, sans-serif).
const STYLES: [first: number, last: number, marker: string][] = [
  [0x27cb, 0x27cb, ''], // rising diagonal
  [0x27cd, 0x27cd, ''], // falling diagonal
  [0x27e6, 0x27ef, ''], // white square, angle and double angle brackets
  [0x1d400, 0x1d433, '**'], // bold
  [0x1d434, 0x1d467, '*'], // italic
  [0x1d468, 0x1d49b, '***'], // bold italic
  [0x1d49c, 0x1d4cf, ''], // script
  [0x1d4d0, 0x1d503, '**'], // bold script
  [0x1d504, 0x1d56b, ''], // fraktur, double-struck
  [0x1d56c, 0x1d59f, '**'], // bold fraktur
  [0x1d5a0, 0x1d5d3, ''], // sans-serif
  [0x1d5d4, 0x1d607, '**'], // sans-serif bold
  [0x1d608, 0x1d63b, '*'], // sans-serif italic
  [0x1d63c, 0x1d66f, '***'], // sans-serif bold italic
  [0x1d670, 0x1d6a3, '`'], // monospace
  [0x1d6a4, 0x1d6a5, '*'], // italic dotless i and j
  [0x1d6a8, 0x1d6e1, '**'], // bold Greek
  [0x1d6e2, 0x1d71b, '*'], // italic Greek
  [0x1d71c, 0x1d755, '***'], // bold italic Greek
  [0x1d756, 0x1d78f, '**'], // sans-serif bold Greek
  [0x1d790, 0x1d7c9, '***'], // sans-serif bold italic Greek
  [0x1d7ca, 0x1d7cb, '**'], // bold digamma
  [0x1d7ce, 0x1d7d7, '**'], // bold digits
  [0x1d7d8, 0x1d7eb, ''], // double-struck and sans-serif digits
  [0x1d7ec, 0x1d7f5, '**'], // sans-serif bold digits
  [0x1d7f6, 0x1d7ff, '`'], // monospace digits
];

const NONSPACING_MARK = /^\p{Mn}$/u;
const NEUTRAL = /^[\p{M}\p{P}\p{Z}]$/u;

/** Markdown marker of a styled letter, '' for other styles, undefined if unstyled. */
function style(ch: string | undefined): string | undefined {
  const code = ch?.codePointAt(0) ?? -1;

  return STYLES.find(([first, last]) => first <= code && code <= last)?.[2];
}

function isNonspacingMark(ch: string | undefined): boolean {
  return ch !== undefined && NONSPACING_MARK.test(ch);
}

/** Characters that may sit between two styled letters of a span. */
function isNeutral(ch: string | undefined): boolean {
  return ch !== undefined && NEUTRAL.test(ch) && !'*_`'.includes(ch);
}

function unstrike(text: string): string {
  return [...text].filter((ch) => !STROKES.includes(ch)).join('');
}

/** Styled letters to plain letters, combining accents composed (𝘢̀ → à). */
function plain(text: string): string {
  return [...unstrike(text)]
    .map((ch) => (style(ch) === undefined ? ch : ch.normalize('NFKC')))
    .join('')
    .normalize('NFC');
}

/** Letters with stroke overlays (s̶t̶r̶u̶c̶k̶) to ~~struck~~. */
function strike(line: string): string {
  const clusters: string[] = [];

  for (const ch of line) {
    const previous = clusters.at(-1);

    if (previous !== undefined && isNonspacingMark(ch)) {
      clusters[clusters.length - 1] = previous + ch;
    } else {
      clusters.push(ch);
    }
  }

  const struck = clusters.map((cluster) => [...STROKES].some((s) => cluster.includes(s)));
  const out: string[] = [];
  let i = 0;

  while (i < clusters.length) {
    if (!struck[i]) {
      out.push(clusters[i] ?? '');
      i += 1;
      continue;
    }

    let end = i;
    let last = i;

    while (end < clusters.length && (struck[end] || isNeutral([...(clusters[end] ?? '')][0]))) {
      if (struck[end]) {
        last = end;
      }

      end += 1;
    }

    end = last + 1;

    const span = unstrike(clusters.slice(i, end).join('')).normalize('NFC');
    const core = span.trim();
    const lead = span.slice(0, span.length - span.trimStart().length);
    const trail = span.slice(span.trimEnd().length);
    const before = out.join('') + lead;
    const after = trail + clusters.slice(end).join('');
    const wrapped = !core || (before.endsWith('~~') && after.startsWith('~~'));

    out.push(wrapped ? span : `${lead}~~${core}~~${trail}`);
    i = end;
  }

  return out.join('');
}

function convertLine(text: string): string {
  const line = [...strike(text)];
  const out: string[] = [];
  let i = 0;

  while (i < line.length) {
    const marker = style(line[i]);

    if (marker === undefined) {
      out.push(line[i] ?? '');
      i += 1;
      continue;
    }

    let end = i;
    let last = i;

    while (end < line.length) {
      const s = style(line[end]);

      if (s === marker) {
        last = end;
      } else if (s !== undefined || !isNeutral(line[end])) {
        break;
      }

      end += 1;
    }

    end = last + 1;

    while (end < line.length && isNonspacingMark(line[end])) {
      end += 1;
    }

    while (end < line.length && TRAILING.includes(line[end] ?? '')) {
      end += 1;
    }

    const span = plain(line.slice(i, end).join(''));
    const before = out.join('');
    const after = line.slice(end).join('');
    const wrapped = !marker || (before.endsWith(marker) && after.startsWith(marker));

    out.push(wrapped ? span : marker + span + marker);
    i = end;
  }

  return out.join('');
}

export function convert(text: string): string {
  const lines = text.split('\n');
  let fence = lines[0] === '---' ? 0 : 2;

  return lines
    .map((line) => {
      if (line === '---' && fence < 2) {
        fence += 1;

        return line;
      }

      return fence === 1 ? plain(line) : convertLine(line);
    })
    .join('\n');
}

function main(args: string[]): number {
  const check = args.includes('--check');
  const changed: string[] = [];

  for (const file of args.filter((arg) => arg !== '--check')) {
    const text = readFileSync(file, 'utf8');
    const result = convert(text);

    if (result !== text) {
      changed.push(file);

      if (!check) {
        writeFileSync(file, result);
      }
    }
  }

  if (changed.length) {
    console.log(changed.join('\n'));
  }

  return check && changed.length ? 1 : 0;
}

if (import.meta.main) {
  process.exitCode = main(process.argv.slice(2));
}
