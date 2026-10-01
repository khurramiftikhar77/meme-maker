// Fills the page's ad slots once the site owner has configured Google AdSense.
// The Worker sets window.SITE_ADS; without it (or without an ad unit ID) slots stay hidden.
(() => {
  'use strict';

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const config = window.SITE_ADS;
  if (!config || !config.client) return;

  document.querySelectorAll('.ad-slot[data-ad]').forEach((slot) => {
    const id = config.slots && config.slots[slot.dataset.ad];
    if (!id) return;

    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = 'Advertisement';

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = config.client;
    ins.dataset.adSlot = id;
    ins.dataset.adFormat = 'auto';
    ins.dataset.fullWidthResponsive = 'true';

    slot.append(label, ins);
    slot.hidden = false;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense could not fill a slot', err);
    }
  });
})();
