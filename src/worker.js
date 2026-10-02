// Serves the static meme maker: renders template images into template pages, sends the
// workers.dev address to the real domain, and adds Google AdSense once configured.
const SITE_HOST = 'mememaker.khurramiftikhar.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // The workers.dev address only redirects, so the site is reachable at one address.
    if (url.hostname.endsWith('.workers.dev')) {
      return Response.redirect(`https://${SITE_HOST}${url.pathname}${url.search}`, 301);
    }
    if (url.pathname === '/ads.txt') return adsTxt(env);

    let response = await env.ASSETS.fetch(request);
    if (!(response.headers.get('content-type') || '').includes('text/html')) return response;

    if (url.pathname.startsWith('/templates/')) response = await withTemplateImage(response);
    return withAds(response, env);
  },
};

/* ------------------------------------------------------------------ */
/* Template images                                                     */
/* ------------------------------------------------------------------ */

const IMAGE_SOURCES_TTL = 24 * 60 * 60;  // seconds
let imageIndex = null;
let imageIndexAt = 0;

function nameKey(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchJson(url) {
  // Cloudflare caches the lists so most page views never call the sources.
  const res = await fetch(url, { cf: { cacheTtl: IMAGE_SOURCES_TTL, cacheEverything: true } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

// name key -> { url, width, height }, built from Imgflip (preferred) and Memegen.
async function templateImages() {
  if (imageIndex && Date.now() - imageIndexAt < IMAGE_SOURCES_TTL * 1000) return imageIndex;
  const [imgflip, memegen] = await Promise.allSettled([
    fetchJson('https://api.imgflip.com/get_memes'),
    fetchJson('https://api.memegen.link/templates'),
  ]);
  const index = new Map();
  if (memegen.status === 'fulfilled') {
    memegen.value.forEach((t) => { if (t.blank) index.set(nameKey(t.name), { url: t.blank }); });
  }
  if (imgflip.status === 'fulfilled') {
    imgflip.value.data.memes.forEach((t) => {
      index.set(nameKey(t.name), { url: t.url, width: t.width, height: t.height });
    });
  }
  if (index.size) {
    imageIndex = index;
    imageIndexAt = Date.now();
  }
  return index;
}

// Fill in the hero image on the server so search engines see a real <img src>.
async function withTemplateImage(response) {
  let index;
  try {
    index = await templateImages();
  } catch (err) {
    console.error('Template image lookup failed', err);
    return response;  // js/template-page.js looks the image up in the browser instead
  }
  return new HTMLRewriter()
    .on('img.template-hero', {
      element(el) {
        const names = (el.getAttribute('data-template-names') || '').split('|');
        const match = names.map((n) => index.get(nameKey(n))).find(Boolean);
        if (!match) return;
        el.setAttribute('src', match.url);
        if (match.width && match.height) {
          el.setAttribute('width', String(match.width));
          el.setAttribute('height', String(match.height));
        }
      },
    })
    .transform(response);
}

/* ------------------------------------------------------------------ */
/* Google AdSense                                                      */
/* ------------------------------------------------------------------ */

// Ads stay off until ADSENSE_CLIENT (ca-pub-...) is set in the Worker's settings.
function adsenseClient(env) {
  const id = String(env.ADSENSE_CLIENT || '').trim();
  return /^ca-pub-\d{10,20}$/.test(id) ? id : '';
}

function adsTxt(env) {
  const client = adsenseClient(env);
  if (!client) return new Response('Not found', { status: 404 });
  // f08c47fec0942fa0 is Google's fixed certification authority ID for ads.txt.
  return new Response(`google.com, ${client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

// Add the AdSense tag to HTML pages server-side so Google's site check can see it.
function withAds(response, env) {
  const client = adsenseClient(env);
  if (!client) return response;

  const slot = (value) => (/^\d{6,20}$/.test(String(value || '').trim()) ? String(value).trim() : '');
  const config = {
    client,
    slots: {
      templates: slot(env.ADSENSE_SLOT_TEMPLATES),
      ideas: slot(env.ADSENSE_SLOT_IDEAS),
      footer: slot(env.ADSENSE_SLOT_FOOTER),
    },
  };
  const head = `<meta name="google-adsense-account" content="${client}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>
<script>window.SITE_ADS = ${JSON.stringify(config)};</script>`;

  return new HTMLRewriter()
    .on('head', { element: (el) => el.append(head, { html: true }) })
    .transform(response);
}
