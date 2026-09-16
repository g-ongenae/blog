export function createRouter(tree, { directory = '/', root, navigate = url => location.assign(url), previous } = {}) {
  const nodes = [];
  const walk = node => { nodes.push(node); node.children?.forEach(walk); node.pages?.forEach(page => nodes.push(page)); };
  walk(tree);
  const current = nodes.find(n => n.path === directory) || tree;
  const fold = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const url = node => new URL(node.path.slice(1), root).href;
  const row = (node, long = false) => ({ text: `${long ? `${node.date || '----------'} ${node.lang || '--'} ${node.state || ''} ` : ''}${node.title}${node.children ? '/' : ''}${node.soon ? ' (soon)' : ''}`, ...(node.soon ? {} : { href: url(node) }) });
  const resolve = target => {
    const parts = (target.startsWith('~') ? target.replace(/^~\/?/, '') : directory + target).split('/');
    const clean = [];
    for (const p of parts) { if (p === '..') clean.pop(); else if (p && p !== '.') clean.push(p); }
    return nodes.find(n => n.path === '/' + clean.join('/') + (clean.length ? '/' : ''));
  };
  const descendants = node => nodes.filter(n => !n.children && n.path.startsWith(node.path));
  const go = node => { if (node.soon) return ['fatal: coming soon']; navigate(url(node)); return []; };
  const commands = raw => {
    const [verb, ...args] = raw.split(' '); const target = args.filter(a => !a.startsWith('-')).join(' '); const node = target ? resolve(target) : current;
    if (verb === 'help') return ['pwd · ls [path] [-la] · cd <path> · cat/open <page>', 'find/grep <title> · tree [path] · head · tail · random/shuf · stat', 'whoami · ps [-laux] · ping · ssh · clear · exit/logout', 'Paths are relative; ~ is the blog root. Tab completes.'];
    if (verb === 'pwd') return [`~/blog${directory === '/' ? '' : directory.replace(/\/$/, '')}`];
    if (['exit', 'logout'].includes(verb) || verb === 'cd' && (['/', '~/..'].includes(target) || target === '..' && directory === '/')) { navigate('https://g-ongenae.github.io/'); return []; }
    if (verb === 'cd') {
      if (args[0] === '-') { if (previous) { navigate(previous); return []; } return ['cd: no previous page']; }
      const destination = target ? node : tree;
      return !destination ? [`cd: no such file or directory: ${target}`] : !destination.children ? [`cd: not a directory: ${target}`] : go(destination);
    }
    if (['cat', 'open'].includes(verb)) {
      const matches = node ? [node] : nodes.filter(n => !n.soon && (fold(n.title).includes(fold(target)) || fold(n.path).includes(fold(target))));
      if (!target || !matches.length) return [`${verb}: no such file: ${target}`];
      if (matches.length > 1) return matches.map(n => row(n));
      return matches[0].children ? [`${verb}: ${target}: Is a directory`] : go(matches[0]);
    }
    if (verb === 'ls' || verb === 'tree') {
      if (!node) return [`${verb}: no such file or directory: ${target}`];
      if (node.soon) return ['fatal: coming soon'];
      if (!node.children) return [row(node, true)];
      const entries = [...node.children, ...node.pages];
      if (verb === 'ls') return entries.map(n => row(n, args.some(a => /^-[al]*l[al]*$/.test(a))));
      return entries.flatMap(n => [row(n), ...(n.children ? [...n.children, ...n.pages].map(c => ({ ...row(c), text: `  └ ${row(c).text}` })) : [])]);
    }
    if (['find', 'grep'].includes(verb)) { const matches = nodes.filter(n => !n.soon && fold(n.title).includes(fold(target))); return matches.length ? matches.map(n => row(n)) : ['No matching titles.']; }
    const pages = descendants(current).sort((a,b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path));
    if (verb === 'head') return pages.slice(0, 10).map(n => row(n, true));
    if (verb === 'tail') return pages.slice(-10).reverse().map(n => row(n, true));
    if (['random', 'shuf'].includes(verb)) return pages.length ? go(pages[Math.floor(Math.random() * pages.length)]) : ['No pages in this directory.'];
    if (verb === 'stat') return [`${pages.length} pages · ${pages.filter(p => p.state === 'draft').length} drafts · ${pages.filter(p => p.favorite).length} favourites`];
    if (verb === 'whoami') return ['Guillaume Ongenae'];
    if (verb === 'ssh') return ['online'];
    if (verb === 'ps') return args.some(a => a.includes('l')) ? ['grounding - Laying foundations at my work (Algoan).', 'vibing - Creating apps, dancing, travelling, writing, playing music and learning languages.', 'telling - Taking notes on my blog and on LinkedIn.'] : ['Grounding.', 'Vibing.', 'Telling.'];
    if (verb === 'ping') { const address = atob('Z3VpbGxhdW1lLm9uZ2VuYWVAZ21haWwuY29t'); navigate(`mailto:${address}`); return [{ text: `PING ${address}`, href: `mailto:${address}` }, '64 bytes from Paris: opening your mail client...']; }
    return [`${verb}: command not found (try "help")`];
  };
  const complete = value => {
    const match = value.match(/^(cd|cat|open|ls|tree)\s+(.*)$/); if (!match) return [];
    const [, verb, prefix] = match;
    const slash = prefix.lastIndexOf('/'); const base = prefix.slice(0, slash + 1); const partial = prefix.slice(slash + 1);
    const parent = resolve(base || '.'); if (!parent?.children) return [];
    return [...parent.children, ...(verb === 'cd' ? [] : parent.pages)].filter(n => !n.soon && n.path.split('/').at(-2).startsWith(partial)).map(n => `${verb} ${base}${n.path.split('/').at(-2)}${n.children ? '/' : ''}`);
  };
  return { commands, complete };
}
