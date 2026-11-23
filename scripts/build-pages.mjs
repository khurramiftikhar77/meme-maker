// Generates the crawlable template pages, the templates index, the /work-memes/ pages, the 404
// page and sitemap.xml from js/captions.js, scripts/template-info.cjs and scripts/audience-info.cjs.
// Run with: npm run build:pages
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const info = require('./template-info.cjs');
const audienceInfo = require('./audience-info.cjs');

const SITE = 'https://mememaker.khurramiftikhar.com';
const AUTHOR = 'Khurram Iftikhar';
const AUTHOR_URL = 'https://khurramiftikhar.com';

// js/captions.js is a browser script that sets window.MEME_CAPTIONS.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/captions.js'), 'utf8'), sandbox);
// Hand-picked templates (js/featured.js) carry their own image link, written straight into the page.
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/featured.js'), 'utf8'), sandbox);
const featuredKey = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
const featuredImages = new Map((sandbox.window.MEME_FEATURED || []).map((f) => [featuredKey(f.name), f.url]));
const templates = sandbox.window.MEME_CAPTIONS.map((t) => {
  const name = t.names[0];
  const details = info[name];
  if (!details) throw new Error(`Missing description for "${name}" in scripts/template-info.cjs`);
  const boxes = t.c[0].length;
  Object.entries(t.a || {}).forEach(([key, list]) => {
    if (!audienceInfo[key]) throw new Error(`Unknown audience "${key}" for "${name}"`);
    list.forEach((c) => {
      if (c.length !== boxes) throw new Error(`"${name}" ${key} caption needs ${boxes} texts: ${JSON.stringify(c)}`);
    });
  });
  return { ...t, name, slug: slugify(name), boxes, ...details };
});

// One /work-memes/ page per audience, listing the templates that have captions for it.
const audiences = Object.entries(audienceInfo).map(([key, details]) => ({
  key,
  ...details,
  path: `/work-memes/${details.slug}`,
  templates: templates.filter((t) => t.a?.[key]?.length),
}));

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

function heroSrc(t) {
  const url = t.names.map((n) => featuredImages.get(featuredKey(n))).find(Boolean);
  return url ? ` src="${esc(url)}"` : '';
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
    <p class="brand"><a href="/">Meme<span>Link</span></a></p>
    <nav class="top-links" aria-label="Main">
      <a href="/templates/">Meme templates</a>
      <a href="/work-memes/">Work memes</a>
      <a class="btn btn-primary" href="/">Make a meme</a>
    </nav>
  </header>

  <main class="page">
${body}
  </main>

  <footer class="site-footer">
    <nav class="footer-links" aria-label="Site">
      <a href="/">MemeLink</a>
      <a href="/templates/">Meme templates</a>
      <a href="/work-memes/">Work memes</a>
      <a href="/about">About</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Use</a>
      <a href="/contact">Contact</a>
      <a href="/impressum">Impressum</a>
    </nav>
    <nav class="footer-links footer-tools" aria-label="More free tools">
      <span>More free tools:</span>
      <a href="https://shipkit.khurramiftikhar.com">ShipKit</a>
      <a href="https://dadops.khurramiftikhar.com">DadOps</a>
    </nav>
    <p class="muted small">&copy; <span id="year">2026</span> MemeLink. Meme templates belong to their respective owners.</p>
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
    { q: `How do I make a ${t.name} meme?`, a: `Click "Make this meme" to open the template in MemeLink, then click any text on the image to type your own. ${t.use}` },
    { q: `How many text boxes does the ${t.name} template have?`, a: `It has ${boxes}. You can add more text, or move, resize and rotate any of it in the editor.` },
    { q: 'Is MemeLink free?', a: 'Yes. MemeLink is free, needs no account, and your pictures never leave your device.' },
  ];

  const body = `${crumbs.html}

    <article class="template-article">
      <h1>${esc(t.name)} meme template</h1>
      <p class="byline">By <a href="/about#author">${AUTHOR}</a></p>

      <figure class="template-figure">
        <img class="template-hero"${heroSrc(t)} data-template-names="${esc(t.names.join('|'))}" alt="${esc(`${t.name} meme template, blank, with ${boxes}`)}" decoding="async">
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
${t.a ? `
      <h2>${esc(t.name)} work meme captions</h2>
${audiences.filter((a) => t.a[a.key]?.length).map((a) => `      <h3><a href="${a.path}">${esc(a.name)}</a></h3>
      <ul class="caption-ideas">
${t.a[a.key].map((caption) => `        <li>${caption.filter(Boolean).map(esc).join(' <span class="muted">/</span> ')}</li>`).join('\n')}
      </ul>`).join('\n')}
` : ''}
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
    title: `${t.name} Meme Template and Generator | MemeLink`,
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
    <p>Making a meme for work? See the <a href="/work-memes/">work memes</a> for ${audiences.map((a) => `<a href="${a.path}">${esc(a.name.toLowerCase())}</a>`).join(', ').replace(/, ([^,]*)$/, ' and $1')}.</p>
    <ul class="template-index">
${templates.map((t) => `      <li><a href="/templates/${t.slug}">${esc(t.name)}</a> <span class="muted small">${t.boxes} text box${t.boxes === 1 ? '' : 'es'}</span></li>`).join('\n')}
    </ul>`;
  return layout({
    title: 'Popular Meme Templates | MemeLink',
    description: `Browse ${templates.length} popular meme templates with their meaning, caption ideas and a free meme generator.`,
    canonical: `${SITE}/templates/`,
    head: `  ${jsonLd(crumbs.schema)}\n`,
    body,
  });
}

function audiencePage(a) {
  const url = `${SITE}${a.path}`;
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Work memes', path: '/work-memes/' },
    { name: a.name, path: a.path },
  ]);
  const count = a.templates.reduce((n, t) => n + t.a[a.key].length, 0);
  const faq = [
    ...a.faq,
    { q: 'Is MemeLink free?', a: 'Yes. MemeLink is free, has no watermark, needs no account, and your pictures never leave your device.' },
  ];
  const others = audiences.filter((o) => o.key !== a.key);

  const body = `${crumbs.html}

    <article class="work-article">
      <h1>${esc(a.name)}</h1>
      <p class="byline">By <a href="/about#author">${AUTHOR}</a></p>
${a.intro.map((p) => `      <p>${esc(p)}</p>`).join('\n')}
      <p><a class="btn btn-primary make-btn" href="${esc(`/?ideas=${a.filter}`)}">Open the meme maker</a></p>

      <h2>${a.templates.length} templates with ${count} ${esc(a.name.toLowerCase().replace(/ memes$/, ''))} captions</h2>
      <ul class="work-meme-list">
${a.templates.map((t) => `        <li class="work-meme">
          <img class="template-thumb" data-template-names="${esc(t.names.join('|'))}" alt="${esc(`${t.name} meme template`)}" loading="lazy" decoding="async">
          <h3><a href="/templates/${t.slug}">${esc(t.name)}</a></h3>
          <ul class="caption-ideas">
${t.a[a.key].map((caption) => `            <li>${caption.filter(Boolean).map(esc).join(' <span class="muted">/</span> ')}</li>`).join('\n')}
          </ul>
          <a class="btn btn-primary make-btn" href="${esc(`/?template=${encodeURIComponent(t.name)}&ideas=${a.filter}`)}">Make this meme</a>
        </li>`).join('\n')}
      </ul>

      <h2>Tips for sharing ${esc(a.name.toLowerCase())}</h2>
      <p>${esc(a.tips)}</p>

      <h2>Frequently asked questions</h2>
      <dl class="faq">
${faq.map(({ q, a: answer }) => `        <dt>${esc(q)}</dt>\n        <dd>${esc(answer)}</dd>`).join('\n')}
      </dl>

      <h2>More work memes</h2>
      <ul class="related-links">
${others.map((o) => `        <li><a href="${o.path}">${esc(o.name)}</a></li>`).join('\n')}
      </ul>
      <p><a href="/templates/">See all meme templates</a></p>
    </article>`;

  const schemas = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(({ q, a: answer }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: a.name,
      url,
      author: { '@type': 'Person', name: AUTHOR, url: AUTHOR_URL },
    },
  ];

  return layout({
    title: `${a.title} | MemeLink`,
    description: a.description,
    canonical: url,
    head: `${schemas.map((sc) => `  ${jsonLd(sc)}`).join('\n')}\n`,
    body,
  });
}

function audienceIndexPage() {
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Work memes', path: '/work-memes/' },
  ]);
  const body = `${crumbs.html}

    <h1>Work memes</h1>
    <p>Memes are how teams say "same" without another meeting. These pages collect meme templates with ready-made, work-safe captions for developers, product and project managers, office life and working parents. Pick one, edit the text, and share it on Slack, Teams or LinkedIn. It is free, with no watermark and no account.</p>
    <ul class="work-index">
${audiences.map((a) => `      <li>
        <h2><a href="${a.path}">${esc(a.name)}</a></h2>
        <p>${esc(a.description)}</p>
        <ul class="caption-ideas">
${a.templates.slice(0, 3).map((t) => `          <li>${t.a[a.key][0].filter(Boolean).map(esc).join(' <span class="muted">/</span> ')} <span class="muted small">(${esc(t.name)})</span></li>`).join('\n')}
        </ul>
      </li>`).join('\n')}
    </ul>
    <p>In the <a href="/">meme maker</a>, the buttons above the caption ideas show the same captions for whichever template you open.</p>`;
  return layout({
    title: 'Work Memes for LinkedIn, Developers, Managers and Parents | MemeLink',
    description: 'Free work meme generator with work-safe captions for developers, product managers, project managers, office life and working parents. Share on Slack or LinkedIn.',
    canonical: `${SITE}/work-memes/`,
    head: `  ${jsonLd(crumbs.schema)}\n`,
    body,
  });
}

function notFoundPage() {
  const body = `    <h1>Page not found</h1>
    <p>Sorry, that page does not exist. It may have moved, or the link may be wrong.</p>
    <p><a class="btn btn-primary" href="/">Make a meme</a></p>
    <p>Or browse the <a href="/templates/">popular meme templates</a>.</p>`;
  return layout({ title: 'Page not found | MemeLink', description: 'This page could not be found.', robots: 'noindex', body });
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
  let out = html.slice(0, i) + links + html.slice(j + end.length);

  const workStart = '<!-- WORK-MEMES-LINKS:START -->';
  const workEnd = '<!-- WORK-MEMES-LINKS:END -->';
  const k = out.indexOf(workStart);
  const l = out.indexOf(workEnd);
  if (k < 0 || l < k) throw new Error('index.html is missing the WORK-MEMES-LINKS markers');
  const workLinks = `${workStart}
      <ul class="home-template-links">
${audiences.map((a) => `        <li><a href="${a.path}">${esc(a.name)}</a></li>`).join('\n')}
      </ul>
      ${workEnd}`;
  out = out.slice(0, k) + workLinks + out.slice(l + workEnd.length);
  fs.writeFileSync(file, out);
}

function sitemap() {
  const paths = ['/', '/templates/', ...templates.map((t) => `/templates/${t.slug}`),
    '/work-memes/', ...audiences.map((a) => a.path), '/about', '/privacy', '/terms', '/contact', '/impressum'];
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
const workDir = path.join(root, 'work-memes');
fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(workDir);
audiences.forEach((a) => fs.writeFileSync(path.join(workDir, `${a.slug}.html`), audiencePage(a)));
fs.writeFileSync(path.join(workDir, 'index.html'), audienceIndexPage());
fs.writeFileSync(path.join(root, '404.html'), notFoundPage());
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap());
updateHomeLinks();
console.log(`Built ${templates.length} template pages, the templates index, ${audiences.length} work meme pages and their index, 404.html and sitemap.xml.`);
