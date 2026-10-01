// Template pages: the Worker normally fills in the template image on the server.
// If it could not (for example on a static host), look the image up in the browser instead.
(() => {
  'use strict';

  const img = document.querySelector('.template-hero');
  if (!img || img.getAttribute('src')) return;

  const key = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  const wanted = new Set(img.dataset.templateNames.split('|').map(key));

  const sources = [
    fetch('https://api.imgflip.com/get_memes').then((r) => r.json())
      .then((json) => json.data.memes.map((t) => ({ name: t.name, url: t.url }))),
    fetch('https://api.memegen.link/templates').then((r) => r.json())
      .then((list) => list.map((t) => ({ name: t.name, url: t.blank }))),
  ];

  Promise.allSettled(sources).then((results) => {
    const found = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .find((t) => t.url && wanted.has(key(t.name)));
    if (found) img.src = found.url;
    else img.closest('figure').hidden = true;
  });
})();
