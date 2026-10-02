// Generates the crawlable template pages, the templates index, the 404 page and sitemap.xml
// from js/captions.js and scripts/template-info.cjs. Run with: npm run build:pages
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const info = require('./template-info.cjs');

const SITE = 'https://mememaker.khurramiftikhar.com';
const AUTHOR = 'Khurram Iftikhar';
const AUTHOR_URL = 'https://khurramiftikhar.com';

// js/captions.js is a browser script that sets window.MEME_CAPTIONS.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/captions.js'), 'utf8'), sandbox);
const templates = sandbox.window.MEME_CAPTIONS.map((t) => {
  const name = t.names[0];
  const details = info[name];
  if (!details) throw new Error(`Missing description for "${name}" in scripts/template-info.cjs`);
  return { ...t, name, slug: slugify(name), boxes: t.c[0].length, ...details };
});

const slugs = new Set();
templates.forEach((t) => {
  if (slugs.has(t.slug)) throw new Error(`Duplicate slug ${t.slug}`);
  slugs.add(t.slug);
});

function slugify(name) {
  return name.toLowerCase().replace(/['’.,?]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Keep "</script>" sequences out of inline JSON-LD.
function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function layout({ title, description, canonical, body, head = '', robots = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
${robots ? `  <meta name="robots" content="${robots}">\n` : ''}${canonical ? `  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">\n` : ''}  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/style.css">
${head}</head>
<body>
  <header class="topbar">
    <p class="brand"><a href="/">Meme<span>Maker</span></a></p>
    <nav class="top-links" aria-label="Main">
      <a href="/templates/">Meme templates</a>
      <a class="btn btn-primary" href="/">Make a meme</a>
    </nav>
  </header>

  <main class="page">
${body}
  </main>

  <footer class="site-footer">
    <nav class="footer-links" aria-label="Site">
      <a href="/">Meme Maker</a>
      <a href="/templates/">Meme templates</a>
      <a href="/about">About</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Use</a>
      <a href="/contact">Contact</a>
      <a href="/impressum">Impressum</a>
    </nav>
    <p class="muted small">&copy; <span id="year">2026</span> Meme Maker. Meme templates belong to their respective owners.</p>
  </footer>
  <script src="/js/ads.js"></script>
  <script src="/js/template-page.js"></script>
</body>
</html>
`;
}

function breadcrumbs(items) {
  const html = `    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
${items.map((item, i) => (i === items.length - 1
    ? `        <li aria-current="page">${esc(item.name)}</li>`
    : `        <li><a href="${item.path}">${esc(item.name)}</a></li>`)).join('\n')}
      </ol>
    </nav>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem', position: i + 1, name: item.name, item: `${SITE}${item.path}`,
    })),
  };
  return { html, schema };
}

function templatePage(t, i) {
  const pagePath = `/templates/${t.slug}`;
  const url = `${SITE}${pagePath}`;
  const editorUrl = `/?template=${encodeURIComponent(t.name)}`;
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Meme templates', path: '/templates/' },
    { name: t.name, path: pagePath },
  ]);
  const related = Array.from({ length: 6 }, (_, k) => templates[(i + k + 1) % templates.length]);
  const boxes = `${t.boxes} text box${t.boxes === 1 ? '' : 'es'}`;
  const faq = [
    { q: `What is the ${t.name} meme?`, a: t.about },
    { q: `How do I make a ${t.name} meme?`, a: `Click "Make this meme" to open the template in Meme Maker, then click any text on the image to type your own. ${t.use}` },
    { q: `How many text boxes does the ${t.name} template have?`, a: `It has ${boxes}. You can add more text, or move, resize and rotate any of it in the editor.` },
    { q: 'Is Meme Maker free?', a: 'Yes. Meme Maker is free, needs no account, and your pictures never leave your device.' },
  ];

  const body = `${crumbs.html}

    <article class="template-article">
      <h1>${esc(t.name)} meme template</h1>
      <p class="byline">By <a href="/about#author">${AUTHOR}</a></p>

      <figure class="template-figure">
        <img class="template-hero" data-template-names="${esc(t.names.join('|'))}" alt="${esc(`${t.name} meme template, blank, with ${boxes}`)}" decoding="async">
        <figcaption class="muted small">Blank ${esc(t.name)} template with ${boxes}.</figcaption>
      </figure>
      <p><a class="btn btn-primary make-btn" href="${editorUrl}">Make this meme</a></p>

      <h2>What the ${esc(t.name)} meme means</h2>
      <p>${esc(t.about)}</p>

      <h2>How to use it</h2>
      <p>${esc(t.use)} This template has ${boxes}.</p>

      <h2>${esc(t.name)} caption ideas</h2>
      <ul class="caption-ideas">
${t.c.map((caption) => `        <li>${caption.filter(Boolean).map(esc).join(' <span class="muted">/</span> ')}</li>`).join('\n')}
      </ul>
      <p><a href="${editorUrl}">Open the ${esc(t.name)} template in the editor</a> to use one of these or write your own.</p>

      <h2>Frequently asked questions</h2>
      <dl class="faq">
${faq.map(({ q, a }) => `        <dt>${esc(q)}</dt>\n        <dd>${esc(a)}</dd>`).join('\n')}
      </dl>

      <h2>More meme templates</h2>
      <ul class="related-links">
${related.map((r) => `        <li><a href="/templates/${r.slug}">${esc(r.name)}</a></li>`).join('\n')}
      </ul>
      <p><a href="/templates/">See all meme templates</a></p>
    </article>`;

  const schemas = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${t.name} meme template`,
      url,
      author: { '@type': 'Person', name: AUTHOR, url: AUTHOR_URL },
    },
  ];

  return layout({
    title: `${t.name} Meme Template and Generator | Meme Maker`,
    description: `Make a ${t.name} meme free online: blank template, ${t.c.length} caption ideas, what the meme means and how to use it.`,
    canonical: url,
    head: `${schemas.map((s) => `  ${jsonLd(s)}`).join('\n')}\n`,
    body,
  });
}

function indexPage() {
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Meme templates', path: '/templates/' },
  ]);
  const body = `${crumbs.html}

    <h1>Popular meme templates</h1>
    <p>Pick a template to learn what it means, see caption ideas, and make your own version for free. The <a href="/">meme generator</a> also lets you search more than 500 templates or upload your own picture.</p>
    <ul class="template-index">
${templates.map((t) => `      <li><a href="/templates/${t.slug}">${esc(t.name)}</a> <span class="muted small">${t.boxes} text box${t.boxes === 1 ? '' : 'es'}</span></li>`).join('\n')}
    </ul>`;
  return layout({
    title: 'Popular Meme Templates | Meme Maker',
    description: `Browse ${templates.length} popular meme templates with their meaning, caption ideas and a free meme generator.`,
    canonical: `${SITE}/templates/`,
    head: `  ${jsonLd(crumbs.schema)}\n`,
    body,
  });
}

function notFoundPage() {
  const body = `    <h1>Page not found</h1>
    <p>Sorry, that page does not exist. It may have moved, or the link may be wrong.</p>
    <p><a class="btn btn-primary" href="/">Make a meme</a></p>
    <p>Or browse the <a href="/templates/">popular meme templates</a>.</p>`;
  return layout({ title: 'Page not found | Meme Maker', description: 'This page could not be found.', robots: 'noindex', body });
}

// The main page lists every template page so none of them are orphans.
function updateHomeLinks() {
  const file = path.join(root, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const start = '<!-- TEMPLATE-LINKS:START -->';
  const end = '<!-- TEMPLATE-LINKS:END -->';
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i < 0 || j < i) throw new Error('index.html is missing the TEMPLATE-LINKS markers');
  const links = `${start}
      <ul class="home-template-links">
${templates.map((t) => `        <li><a href="/templates/${t.slug}">${esc(t.name)}</a></li>`).join('\n')}
      </ul>
      ${end}`;
  fs.writeFileSync(file, html.slice(0, i) + links + html.slice(j + end.length));
}

function sitemap() {
  const paths = ['/', '/templates/', ...templates.map((t) => `/templates/${t.slug}`), '/about', '/privacy', '/terms', '/contact', '/impressum'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}
</urlset>
`;
}

const outDir = path.join(root, 'templates');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);
templates.forEach((t, i) => fs.writeFileSync(path.join(outDir, `${t.slug}.html`), templatePage(t, i)));
fs.writeFileSync(path.join(outDir, 'index.html'), indexPage());
fs.writeFileSync(path.join(root, '404.html'), notFoundPage());
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap());
updateHomeLinks();
console.log(`Built ${templates.length} template pages, the templates index, 404.html and sitemap.xml.`);
