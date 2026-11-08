# Blog

Source of [g-ongenae.github.io/blog](https://g-ongenae.github.io/blog), a static
site built with [Zola](https://www.getzola.org/). Build scripts are TypeScript run
directly by Node.

## Getting started

Requirements:

- **Zola 0.21.0**: `make install` downloads it into `/usr/local/bin` (uses `sudo`).
- **Node.js 22.18 or later**: `make` runs `npm ci` on first use.

```sh
make serve   # generate the lists, then serve on http://localhost:1111 (and the LAN)
make build   # generate the lists, then build the site into public/
```

## Commands

| Command              | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `make generate`      | Regenerates the literature index, the `think`, `code` and `speak` post lists and `static/tree.json`. Run it after changing content. |
| `make build`         | `make generate`, then `zola build` into `public/`.                          |
| `make serve`         | `make generate`, then `zola serve` on all interfaces, port 1111.            |
| `make sync-terminal` | Copies the shared terminal module from the about-me repository.             |
| `npm test`           | Checks the router and the tree against the Zola build.                      |
| `npm run check`      | Types, ESLint and Prettier.                                                 |
| `npm run format`     | Formats the code (posts and templates are left alone).                      |
| `zola check`         | Checks the site, including external links.                                  |

`public/` and `static/tree.json` are generated and not committed.

## Writing content

### Sections

Each folder in `content/` is a section. Its title and emoji live in the
`_index.md` front matter:

- `extra.soon: true` and `render: false` mark a section as unavailable (hidden
  from the homepage).
- `extra.wip: true` shows a _wip_ badge on its homepage card.

In the `think`, `code` and `speak` sections, the text above `## Summary` in
`_index.md` is kept as an intro; everything below is regenerated.

### Page front matter

Keep `date` and `title` at the top level, and keep credits out of the title.
Everything else goes under `extra`:

```yaml
---
date: 2026-11-08
title: On counting
extra:
  topic: linguistics
  lang: en
---
```

| Field         | Meaning                                                           |
| ------------- | ----------------------------------------------------------------- |
| `lang`        | Language of the text.                                             |
| `topic`       | **Required** in `think`, `code` and `speak`: a key from `data/topics.yaml`. `make generate` fails otherwise. |
| `ai-assisted` | Flags the post as AI-assisted in the summary and the timeline. Means edited with the help of AI, not written by it. All posts are proofread by AI. |
| `state`       | Writing state (`draft` marks a work in progress).                 |
| `location`    | Where the text was written.                                       |
| `favorite`    | Marks a favourite.                                                |
| `pick`        | Editor's pick, listed on the literature page. Chosen by AI (Claude). |
| `suite`       | Series the text belongs to.                                       |
| `subtitle`    | Credits, shown in italics under the title.                        |

Pages without a title are planning drafts and are not listed. The literature
index groups texts by their authored `date`, never by file name.

### Topics and the timeline

The timeline at the top of the `think`, `code` and `speak` pages is computed by
Zola from each post's date, topic, word count and `ai-assisted` flag, so it
updates on the next build.

To add a topic, append it to `data/topics.yaml`. Its position in the file fixes
its colour; `static/style.css` defines four.

## The terminal

The site has a terminal, loaded on first interaction. Type `help` for commands,
and `find` to search titles. On desktop, `/` or `:` focuses it and Escape
closes its history. Ordinary links and breadcrumbs work without JavaScript.

Its source is shared with the about-me site, at
`../g-ongenae.github.io/src/terminal.js`. After editing it there, run
`make sync-terminal` and commit the copy in `static/terminal.js`. Changes that
span both sites (such as the blog link and cross-site routing) need both
repositories published.

## Validation and deployment

Before pushing, run:

```sh
make build && npm test && npm run check && zola check
```

`zola check` also checks external sites, which may be temporarily unavailable.

On GitHub, the _Validate_ workflow runs the same checks on every push and pull
request to `main`, and the _Publish_ workflow deploys `main` to GitHub Pages.

## Licence

The code (templates, scripts, styles and configuration) is under the [MIT licence](LICENSE).

The texts in `content/` are under [CC BY-NC 4.0](LICENSE-CONTENT): they may be shared and adapted for
non-commercial purposes with credit.
