const mount = document.querySelector('.terminal');
const root = new URL(mount.dataset.root, location.href).href;
const button = mount.querySelector('.terminal-activate');
button.hidden = false;
let loading;
const activate = () => {
  if (!loading) loading = Promise.all([import('./terminal.js'), import('./router.js'), fetch(new URL('tree.json', root)).then(r => { if (!r.ok) throw Error(); return r.json(); })]).then(([{ createTerminal }, { createRouter }, tree]) => {
    let previous;
    try { previous = sessionStorage.getItem('blog-previous'); } catch {}
    const router = createRouter(tree, { directory: mount.dataset.directory, root, previous });
    const terminal = createTerminal({ mount, ...router });
    terminal.append(`$ cd ~/blog${mount.dataset.path === '/' ? '' : mount.dataset.path.replace(/\/$/, '')}`);
    button.hidden = true; mount.querySelector('.terminal-help').hidden = false;
    return terminal;
  }).catch(() => { loading = undefined; button.textContent = 'Retry terminal'; return null; });
  return loading;
};
try {
  const last = sessionStorage.getItem('blog-current');
  if (last && last !== location.href) sessionStorage.setItem('blog-previous', last);
  sessionStorage.setItem('blog-current', location.href);
} catch {}
button.addEventListener('click', async () => (await activate())?.focus());
button.addEventListener('focus', async () => (await activate())?.focus());
document.addEventListener('keydown', async event => {
  if (!['/', ':'].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey || matchMedia('(max-width: 560px)').matches || event.target.closest('input,textarea,select,button,a,[contenteditable]')) return;
  event.preventDefault(); (await activate())?.focus();
});
const codes = document.querySelectorAll('pre > code.language-mermaid');
if (codes.length) {
  try {
    const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
    mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { background: '#030806', primaryColor: '#0b2815', primaryTextColor: '#f0fff2', lineColor: '#9dffb0', textColor: '#b2dcb8', xyChart: { backgroundColor: '#030806', titleColor: '#f0fff2', xAxisLabelColor: '#b2dcb8', yAxisLabelColor: '#b2dcb8', xAxisTitleColor: '#b2dcb8', yAxisTitleColor: '#b2dcb8', plotColorPalette: '#5bbf6d, #9dffb0' } } });
    for (const code of codes) { const diagram = document.createElement('div'); diagram.className = 'mermaid'; diagram.textContent = code.textContent; code.parentElement.replaceWith(diagram); }
    await mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
  } catch (error) { console.warn('Diagram unavailable', error); }
}
