// Template and work meme pages: the Worker normally fills in the template images on the server.
// If it could not (for example on a static host), look the images up in the browser instead.
(() => {
  'use strict';

  const imgs = [...document.querySelectorAll('img[data-template-names]')].filter((img) => !img.getAttribute('src'));
  if (!imgs.length) return;

  const key = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

  const sources = [
    fetch('https://api.imgflip.com/get_memes').then((r) => r.json())
      .then((json) => json.data.memes.map((t) => ({ name: t.name, url: t.url }))),
    fetch('https://api.memegen.link/templates').then((r) => r.json())
      .then((list) => list.map((t) => ({ name: t.name, url: t.blank }))),
  ];

  Promise.allSettled(sources).then((results) => {
    const list = results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
    imgs.forEach((img) => {
      const wanted = new Set(img.dataset.templateNames.split('|').map(key));
      const found = list.find((t) => t.url && wanted.has(key(t.name)));
      if (found) img.src = found.url;
      else if (img.closest('figure')) img.closest('figure').hidden = true;
      else img.classList.add('is-missing');
    });
  });
})();
