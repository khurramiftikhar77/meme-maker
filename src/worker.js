// Serves the static meme maker and adds Google AdSense to its pages once configured.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ads.txt') return adsTxt(env);
    return withAds(await env.ASSETS.fetch(request), env);
  },
};

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
  const type = response.headers.get('content-type') || '';
  if (!client || !type.includes('text/html')) return response;

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
