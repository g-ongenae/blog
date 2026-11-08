# Blog

Install Zola 0.19.1 (`make install`) and Node.js 22.18 or later (the scripts are
TypeScript run directly by Node). `make` installs the npm dependencies on first use.

```sh
make build
make serve
```

`make build` regenerates the literature index, the `think` and `code` post lists
and `static/tree.json`, then builds
Zola into `public/`. Run `make generate` after changing content during development.
The tree and build output are generated files and are not committed.

Section titles and emoji live in front matter; `extra.soon: true` and
`render: false` mark an unavailable section. Page language, state, location,
favourite and suite belong under `extra`. Keep `date` and `title` at the top level.
Untitled planning pages are drafts. The index groups texts by their authored dates.

The terminal loads its module and tree on interaction. Use `help` for commands;
`/` or `:` focuses it on desktop, and Escape closes its history. Ordinary links
and breadcrumbs work without JavaScript. `find` searches titles.

The shared terminal source lives at `../g-ongenae.github.io/src/terminal.js`.
After editing that module, run `make sync-terminal` and commit its blog copy.
The about-me repository also contains the blog link and cross-site routing change.
Both repositories need publishing for the complete hand-off.

Validation: `make build`, `npm test` (the router and the tree against the Zola
build), `npm run check` (types, ESLint and Prettier), and `zola check` (the last
also checks external sites, which may be temporarily unavailable). `npm run format`
formats the code; posts and templates are left alone.
