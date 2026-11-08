---
name: clean-unicode
description: Use when a text contains Unicode bold, italic or strikethrough (𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤, s̶t̶r̶u̶c̶k̶) or when the user asks to clean up Unicode formatting.
---

# Clean Unicode

Texts pasted from platforms without rich text fake bold and italic with
Mathematical Alphanumeric Symbols, and strikethrough with a stroke overlay
(U+0336) after each letter. On the blog these letters break search, copy, screen
readers and some fonts. Accents are separate combining marks (`𝘢̀`) and often
render badly. Replace them with Markdown.

## Run

```sh
node .agents/skills/clean-unicode/fix.ts --check $(git ls-files 'content/*.md')
node .agents/skills/clean-unicode/fix.ts <files>
```

`--check` lists the affected files and changes nothing. Without it, the script
rewrites the files and prints the ones it changed. It:

- turns bold into `**…**`, italic into `*…*`, bold italic into `***…***`, monospace into backticks and strikethrough into `~~…~~`;
- turns other styles (script, fraktur, double-struck) into plain letters;
- composes accents (`𝘢̀` → `à`);
- puts spaces and punctuation between styled words inside the span. It also takes a `.`, `!`, `?` or `…` right after the last styled letter;
- doesn't wrap a span that already has the right markers (`**𝗯𝗼𝗹𝗱**`);
- in front matter, makes `title:` plain text with no markers.

Don't run it on the generated `think/_index.md` or `code/_index.md`. Regenerate
them with `node scripts/build-posts.ts think code` (run `npm ci` first if
`node_modules` is missing).

## Review

Read the diff before keeping it:

- A span with several styles splits into separate markers. Merge them if that reads better.
- The script leaves underline (U+0332) alone. Markdown has no underline, so remove the mark by hand.
- Don't touch other Unicode: emoji, `’`, `«  »` and non-breaking spaces (U+00A0, U+202F) are deliberate.

Finally run `--check` again; it should list nothing. Don't commit unless asked.
