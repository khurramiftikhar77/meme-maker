(() => {
  'use strict';

  const IMGFLIP_API = 'https://api.imgflip.com/get_memes';
  const MEMEGEN_API = 'https://api.memegen.link/templates';
  const REDDIT_API = 'https://www.reddit.com/r/MemeTemplatesOfficial/top.json?t=all&limit=100&raw_json=1';
  const REDDIT_PAGES = 5;
  // CORS-enabled image proxy, used when a host does not allow canvas export.
  const IMAGE_PROXY = 'https://images.weserv.nl/?url=';
  const MAX_UPLOAD_SIDE = 2400;
  const HANDLE_RADIUS = 7;   // screen px
  const HANDLE_HIT = 14;     // screen px
  const BOX_PAD = 6;         // screen px
  const ROTATE_OFFSET = 26;  // screen px
  const LINE_HEIGHT = 1.15;

  const $ = (sel) => document.querySelector(sel);

  const els = {
    tabs: document.querySelectorAll('.tab'),
    panels: document.querySelectorAll('.tab-panel'),
    searchInput: $('#searchInput'),
    sourceFilter: $('#sourceFilter'),
    searchStatus: $('#searchStatus'),
    templateGrid: $('#templateGrid'),
    fileInput: $('#fileInput'),
    dropZone: $('#dropZone'),
    canvas: $('#canvas'),
    emptyState: $('#emptyState'),
    addTextBtn: $('#addTextBtn'),
    addTextBtn2: $('#addTextBtn2'),
    changeTemplateBtn: $('#changeTemplateBtn'),
    copyBtn: $('#copyBtn'),
    shareBtn: $('#shareBtn'),
    downloadBtn: $('#downloadBtn'),
    toast: $('#toast'),
    layerList: $('#layerList'),
    noSelection: $('#noSelection'),
    propsForm: $('#propsForm'),
    propText: $('#propText'),
    propFont: $('#propFont'),
    propSize: $('#propSize'),
    propSizeOut: $('#propSizeOut'),
    propRotate: $('#propRotate'),
    propRotateOut: $('#propRotateOut'),
    propFill: $('#propFill'),
    propStroke: $('#propStroke'),
    propStrokeWidth: $('#propStrokeWidth'),
    propStrokeWidthOut: $('#propStrokeWidthOut'),
    propAlign: $('#propAlign'),
    propUpper: $('#propUpper'),
    duplicateBtn: $('#duplicateBtn'),
    deleteBtn: $('#deleteBtn'),
    ideas: $('#ideas'),
    ideasStatus: $('#ideasStatus'),
    ideaList: $('#ideaList'),
    topicPicker: $('#topicPicker'),
    liTools: $('#liTools'),
    exportSize: $('#exportSize'),
    exportBg: $('#exportBg'),
    postText: $('#postText'),
    newPostTextBtn: $('#newPostTextBtn'),
    copyPostTextBtn: $('#copyPostTextBtn'),
    linkedinBtn: $('#linkedinBtn'),
  };

  const ctx = els.canvas.getContext('2d');

  const state = {
    image: null,        // CanvasImageSource
    imageName: 'meme',
    exportable: true,   // false when the image is cross-origin without CORS
    layers: [],
    selectedId: null,
    drag: null,
    editingId: null,    // layer being typed into directly on the image
    templates: [],
  };

  let nextId = 1;
  let renderQueued = false;
  let toastTimer = null;

  /* ---------------------------------------------------------------- */
  /* Tabs                                                              */
  /* ---------------------------------------------------------------- */

  els.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      els.tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      els.panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
    });
  });

  /* ---------------------------------------------------------------- */
  /* Template search (Imgflip)                                         */
  /* ---------------------------------------------------------------- */

  // Each loader resolves to [{ id, name, url, thumb, boxes, source, search }].
  const SOURCES = {
    // Hand-picked LinkedIn and office templates (js/featured.js), always listed first.
    featured: async () => (window.MEME_FEATURED || []).map((t, i) => ({
      id: `featured-${i}`,
      name: t.name,
      url: t.url,
      thumb: t.url,
      boxes: t.boxes || 2,
    })),

    imgflip: async () => {
      const json = await fetchJson(IMGFLIP_API);
      if (!json.success) throw new Error('Imgflip returned an error');
      return json.data.memes.map((t) => ({
        id: `imgflip-${t.id}`,
        name: t.name,
        url: t.url,
        thumb: t.url,
        boxes: t.box_count || 2,
      }));
    },

    memegen: async () => {
      const list = await fetchJson(MEMEGEN_API);
      return list.filter((t) => t.blank).map((t) => ({
        id: `memegen-${t.id}`,
        name: t.name,
        url: t.blank,
        thumb: `${t.blank}${t.blank.includes('?') ? '&' : '?'}width=240`,
        boxes: t.lines || 2,
        keywords: (t.keywords || []).join(' '),
        example: (t.example && Array.isArray(t.example.text)) ? t.example.text.map(memegenText) : [],
      }));
    },

    reddit: async () => {
      const out = [];
      let after = '';
      for (let page = 0; page < REDDIT_PAGES; page++) {
        const json = await fetchJson(`${REDDIT_API}${after ? `&after=${after}` : ''}`);
        json.data.children.forEach(({ data: post }) => {
          if (post.over_18 || !/\.(jpe?g|png|webp)$/i.test(post.url || '')) return;
          const resolutions = post.preview?.images?.[0]?.resolutions || [];
          const thumb = (resolutions.find((r) => r.width >= 216) || resolutions[resolutions.length - 1])?.url;
          out.push({
            id: `reddit-${post.id}`,
            name: cleanRedditTitle(post.title),
            url: post.url,
            thumb: thumb || post.url,
            boxes: 2,
          });
        });
        after = json.data.after;
        if (!after) break;
      }
      return out;
    },
  };

  // Memegen writes captions in URL style: _ for spaces and ~q, ~a... for special characters.
  function memegenText(text) {
    let out = String(text || '');
    if (!out.includes(' ')) out = out.replace(/__/g, '\u0000').replace(/_/g, ' ').replace(/\u0000/g, '_');
    return out.replace(/~q/g, '?').replace(/~a/g, '&').replace(/~p/g, '%').replace(/~h/g, '#')
      .replace(/~s/g, '/').replace(/~b/g, '\\').replace(/''/g, '"').trim();
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
    return res.json();
  }

  function cleanRedditTitle(title) {
    return title
      .replace(/\[[^\]]*\]|\([^)]*template[^)]*\)/gi, '')
      .replace(/\btemplates?\b/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s\-:|]+|[\s\-:|]+$/g, '') || 'Untitled template';
  }

  function nameKey(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  const sourceStatus = {};

  // Load every source in parallel and show templates as each one arrives.
  function loadTemplates() {
    state.templates = [];
    const seen = new Set();
    els.searchStatus.textContent = 'Loading templates…';

    const order = Object.keys(SOURCES);
    const results = {};

    const merge = () => {
      state.templates = [];
      seen.clear();
      // Keep source priority stable no matter which request finishes first.
      order.forEach((source) => (results[source] || []).forEach((t) => {
        const key = nameKey(t.name);
        if (key && seen.has(key)) return;
        seen.add(key);
        state.templates.push({ ...t, source, search: `${t.name} ${t.keywords || ''}`.toLowerCase() });
      }));
      renderTemplates();
      openRequestedTemplate();
    };

    order.forEach((source) => {
      sourceStatus[source] = 'loading';
      SOURCES[source]()
        .then((list) => {
          results[source] = list;
          sourceStatus[source] = 'ok';
        })
        .catch((err) => {
          sourceStatus[source] = 'failed';
          console.error(`Could not load ${source} templates`, err);
        })
        .finally(merge);
    });
  }

  function renderTemplates() {
    const terms = els.searchInput.value.toLowerCase().split(/\s+/).filter(Boolean);
    const source = els.sourceFilter.value;
    const matches = state.templates.filter((t) =>
      (source === 'all' || t.source === source) && terms.every((term) => t.search.includes(term)));

    els.templateGrid.replaceChildren(...matches.map((t) => {
      const btn = document.createElement('button');
      btn.className = 'template';
      btn.title = t.name;
      const img = document.createElement('img');
      img.src = t.thumb;
      img.alt = t.name;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      const label = document.createElement('span');
      label.textContent = t.name;
      btn.append(img, label);
      btn.addEventListener('click', () => loadTemplate(t));
      return btn;
    }));

    renderSearchStatus(terms, matches.length);
  }

  function renderSearchStatus(terms, matchCount) {
    const loading = Object.values(sourceStatus).includes('loading');
    const failed = Object.keys(sourceStatus).filter((k) => sourceStatus[k] === 'failed');

    els.searchStatus.replaceChildren();
    let text;
    if (!state.templates.length) {
      text = loading ? 'Loading templates…' : 'Could not load templates. ';
    } else if (terms.length || els.sourceFilter.value !== 'all') {
      text = `${matchCount} of ${state.templates.length} templates match`;
    } else {
      text = `${state.templates.length} templates${loading ? ' (loading more…)' : ''}`;
    }
    if (failed.length && !loading) text += ` (${failed.join(', ')} unavailable) `;
    els.searchStatus.append(text);

    if (failed.length && !loading) {
      const retry = document.createElement('button');
      retry.className = 'btn';
      retry.textContent = 'Retry';
      retry.addEventListener('click', loadTemplates);
      els.searchStatus.append(retry);
    }
  }

  els.searchInput.addEventListener('input', renderTemplates);
  els.sourceFilter.addEventListener('change', renderTemplates);

  // Template pages link to the editor as /?template=Name; open that template once it has loaded.
  const requestedTemplate = new URLSearchParams(location.search).get('template');
  let requestHandled = !requestedTemplate;

  function openRequestedTemplate() {
    if (requestHandled) return;
    const builtIn = findBuiltIn(requestedTemplate);
    const keys = new Set([requestedTemplate, ...(builtIn ? builtIn.names : [])].map(nameKey));
    const match = state.templates.find((t) => keys.has(nameKey(t.name)));
    if (match) {
      requestHandled = true;
      loadTemplate(match);
    } else if (!Object.values(sourceStatus).includes('loading')) {
      requestHandled = true;
      showToast(`Could not find "${requestedTemplate}". Try searching for it.`);
      els.searchInput.value = requestedTemplate;
      renderTemplates();
    }
  }

  function loadTemplate(t) {
    showToast('Loading template…');
    return loadRemoteImage(t.url)
      .then(({ img, exportable }) => {
        const builtIn = findBuiltIn(t.name);
        // A template with built-in captions gets exactly as many boxes as its captions have lines.
        const boxes = builtIn ? (builtIn.b?.length || builtIn.c[0].length) : t.boxes;
        setImage(img, t.name, exportable, boxes, builtIn?.b);
        showIdeas(builtIn, t);
        showEditor();
        showToast(exportable ? '' : 'This image blocks downloads from other sites. Try another template.');
        return true;
      })
      .catch(() => {
        showToast('Could not load that image.');
        return false;
      });
  }

  // Prefer a direct CORS load, then the proxy, and finally a display-only load.
  function loadRemoteImage(url) {
    const load = (src, withCors) => new Promise((resolve, reject) => {
      const img = new Image();
      if (withCors) img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    return load(url, true)
      .catch(() => load(`${IMAGE_PROXY}${encodeURIComponent(url)}`, true))
      .then((img) => ({ img, exportable: true }))
      .catch(() => load(url, false).then((img) => ({ img, exportable: false })));
  }

  /* ---------------------------------------------------------------- */
  /* Upload / drag and drop / paste                                    */
  /* ---------------------------------------------------------------- */

  els.fileInput.addEventListener('change', () => {
    const file = els.fileInput.files[0];
    if (file) loadFile(file);
    els.fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((type) => {
    els.dropZone.addEventListener(type, (e) => {
      e.preventDefault();
      els.dropZone.classList.add('is-over');
    });
  });
  ['dragleave', 'drop'].forEach((type) => {
    els.dropZone.addEventListener(type, () => els.dropZone.classList.remove('is-over'));
  });
  els.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = [...e.dataTransfer.files].find((f) => f.type.startsWith('image/'));
    if (file) loadFile(file);
    else showToast('Please drop an image file.');
  });

  // Dropping an image anywhere else should not navigate away from the app.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = [...(e.dataTransfer?.files || [])].find((f) => f.type.startsWith('image/'));
    if (file) loadFile(file);
  });

  window.addEventListener('paste', (e) => {
    if (isTyping(e.target)) return;
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
    if (!item) return;
    e.preventDefault();
    loadFile(item.getAsFile());
  });

  function loadFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('That file is not an image.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const name = file.name.replace(/\.[^.]+$/, '') || 'meme';
      setImage(downscale(img), name, true, 2);
      showIdeas(null, { name: `${file.name} ${file.size}` });
      showEditor();
      showToast('');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Could not read that image.');
    };
    img.src = url;
  }

  // Keep very large photos at a size the editor can redraw smoothly.
  function downscale(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(w, h));
    if (scale === 1) return img;
    const c = document.createElement('canvas');
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  /* ---------------------------------------------------------------- */
  /* Image + layers                                                    */
  /* ---------------------------------------------------------------- */

  // layout: optional [[x, y, width, size], ...] from captions.js, as fractions of the image.
  function setImage(img, name, exportable, boxCount, layout) {
    state.image = img;
    state.imageName = name;
    state.exportable = exportable;
    state.layers = [];
    state.selectedId = null;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    els.canvas.width = w;
    els.canvas.height = h;
    els.canvas.hidden = false;
    els.canvas.tabIndex = 0;
    els.emptyState.hidden = true;

    els.propSize.max = Math.max(300, Math.round(Math.min(w, h) * 0.6));

    const count = Math.max(1, Math.min(boxCount, 6));
    if (layout) {
      layout.forEach(([x, y, width, size], i) => {
        addLayer({ text: `TEXT ${i + 1}`, x, y, width, size, order: i }, false);
      });
    } else if (count === 2) {
      addLayer({ text: 'TOP TEXT', y: 0.12, order: 0 }, false);
      addLayer({ text: 'BOTTOM TEXT', y: 0.88, order: 1 }, false);
    } else {
      for (let i = 0; i < count; i++) {
        addLayer({ text: `TEXT ${i + 1}`, y: (i + 0.5) / count, order: i }, false);
      }
    }
    select(state.layers[0].id);

    [els.addTextBtn, els.addTextBtn2, els.copyBtn, els.shareBtn, els.downloadBtn, els.linkedinBtn].forEach((b) => { b.disabled = false; });
    els.liTools.hidden = false;
    document.body.classList.add('has-image');
    els.changeTemplateBtn.hidden = false;
    els.copyBtn.disabled = els.shareBtn.disabled = els.downloadBtn.disabled = els.linkedinBtn.disabled = !exportable;
  }

  function addLayer({ text = 'YOUR TEXT', x = 0.5, y = 0.5, width = 0.92, size = 0.09, order } = {}, selectIt = true) {
    const W = els.canvas.width;
    const H = els.canvas.height;
    const fontSize = Math.max(12, Math.round(Math.min(W, H) * size));
    const layer = {
      id: nextId++,
      order,
      text,
      x: W * x,
      y: H * y,
      width: Math.round(W * width),
      fontSize,
      baseSize: fontSize,   // the layout's size; long captions shrink from here to fit
      fontFamily: 'Impact, Anton, sans-serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: Math.max(1, Math.round(fontSize / 14 * 2) / 2),
      rotation: 0,
      align: 'center',
      uppercase: true,
    };
    state.layers.push(layer);
    if (selectIt) select(layer.id);
    else renderLayerList();
    return layer;
  }

  function selectedLayer() {
    return state.layers.find((l) => l.id === state.selectedId) || null;
  }

  function select(id) {
    if (state.editingId !== null && state.editingId !== id) stopEditing();
    state.selectedId = id;
    syncProps();
    renderLayerList();
    requestRender();
  }

  function removeSelected() {
    const layer = selectedLayer();
    if (!layer) return;
    if (state.editingId === layer.id) stopEditing();
    state.layers = state.layers.filter((l) => l !== layer);
    select(state.layers.length ? state.layers[state.layers.length - 1].id : null);
  }

  function duplicateSelected() {
    const layer = selectedLayer();
    if (!layer) return;
    const offset = els.canvas.width * 0.03;
    const copy = { ...layer, id: nextId++, order: undefined, x: layer.x + offset, y: layer.y + offset };
    state.layers.push(copy);
    select(copy.id);
  }

  function renderLayerList() {
    els.layerList.replaceChildren(...state.layers.map((layer, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = layer.text.trim() || `(empty text ${i + 1})`;
      btn.classList.toggle('is-selected', layer.id === state.selectedId);
      btn.addEventListener('click', () => select(layer.id));
      li.append(btn);
      return li;
    }));
  }

  /* ---------------------------------------------------------------- */
  /* Properties panel                                                  */
  /* ---------------------------------------------------------------- */

  function syncProps() {
    const layer = selectedLayer();
    els.propsForm.hidden = !layer;
    els.noSelection.hidden = !!layer || !state.image;
    if (!layer) return;

    if (els.propText.value !== layer.text) els.propText.value = layer.text;
    els.propFont.value = layer.fontFamily;
    els.propSize.value = layer.fontSize;
    els.propSizeOut.textContent = Math.round(layer.fontSize);
    els.propRotate.value = Math.round(layer.rotation);
    els.propRotateOut.textContent = `${Math.round(layer.rotation)}°`;
    els.propFill.value = layer.fill;
    els.propStroke.value = layer.stroke;
    els.propStrokeWidth.value = layer.strokeWidth;
    els.propStrokeWidthOut.textContent = layer.strokeWidth;
    els.propUpper.checked = layer.uppercase;
    els.propAlign.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.align === layer.align);
    });
  }

  function bindProp(input, event, apply) {
    input.addEventListener(event, () => {
      const layer = selectedLayer();
      if (!layer) return;
      apply(layer);
      syncProps();
      requestRender();
    });
  }

  bindProp(els.propText, 'input', (l) => { l.text = els.propText.value; renderLayerList(); });
  bindProp(els.propFont, 'change', (l) => {
    l.fontFamily = els.propFont.value;
    ensureFont(l.fontFamily);
  });
  bindProp(els.propSize, 'input', (l) => { l.fontSize = l.baseSize = Number(els.propSize.value); });
  bindProp(els.propRotate, 'input', (l) => { l.rotation = Number(els.propRotate.value); });
  bindProp(els.propFill, 'input', (l) => { l.fill = els.propFill.value; });
  bindProp(els.propStroke, 'input', (l) => { l.stroke = els.propStroke.value; });
  bindProp(els.propStrokeWidth, 'input', (l) => { l.strokeWidth = Number(els.propStrokeWidth.value); });
  bindProp(els.propUpper, 'change', (l) => { l.uppercase = els.propUpper.checked; });

  els.propAlign.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-align]');
    const layer = selectedLayer();
    if (!btn || !layer) return;
    layer.align = btn.dataset.align;
    syncProps();
    requestRender();
  });

  // Two "Add text box" buttons: under the image and in the Text panel.
  [els.addTextBtn, els.addTextBtn2].forEach((btn) => btn.addEventListener('click', () => {
    const layer = addLayer();
    showEditor();
    startEditing(layer, { selectAll: true });
  }));

  // On phones the editor sits above or below other panels; bring the meme into view.
  function showEditor() {
    if (!window.matchMedia('(max-width: 760px)').matches) return;
    const panel = els.canvas.closest('.stage-panel');
    const top = panel.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  // Phones: jump back up to the template list without losing the meme being edited.
  els.changeTemplateBtn.addEventListener('click', () => {
    const panel = document.querySelector('.source');
    const top = panel.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  els.duplicateBtn.addEventListener('click', duplicateSelected);
  els.deleteBtn.addEventListener('click', removeSelected);

  function ensureFont(family) {
    if (!document.fonts?.load) return;
    document.fonts.load(`40px ${family}`).then(requestRender).catch(() => {});
  }

  /* ---------------------------------------------------------------- */
  /* Rendering                                                         */
  /* ---------------------------------------------------------------- */

  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      if (state.image) drawScene(ctx, true);
    });
  }

  function drawScene(c, withOverlay) {
    const { width: W, height: H } = c.canvas;
    c.clearRect(0, 0, W, H);
    c.drawImage(state.image, 0, 0, W, H);
    state.layers.forEach((layer) => {
      if (!(withOverlay && layer.id === state.editingId)) drawLayer(c, layer);
    });
    if (withOverlay) {
      const layer = selectedLayer();
      if (layer) drawSelection(c, layer);
    }
  }

  function fontString(layer) {
    return `${layer.fontSize}px ${layer.fontFamily}`;
  }

  // Word-wrap the layer's text to its box width. Returns lines and box height.
  function layout(c, layer) {
    c.font = fontString(layer);
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    const maxWidth = layer.width;
    const lines = [];

    text.split('\n').forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push('');
        return;
      }
      let line = '';
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (c.measureText(candidate).width <= maxWidth) {
          line = candidate;
          return;
        }
        if (line) lines.push(line);
        // Break words that are wider than the box on their own.
        line = '';
        for (const ch of word) {
          if (line && c.measureText(line + ch).width > maxWidth) {
            lines.push(line);
            line = '';
          }
          line += ch;
        }
      });
      lines.push(line);
    });

    const lineHeight = layer.fontSize * LINE_HEIGHT;
    return { lines, lineHeight, height: Math.max(1, lines.length) * lineHeight };
  }

  function drawLayer(c, layer) {
    const { lines, lineHeight, height } = layout(c, layer);
    c.save();
    c.translate(layer.x, layer.y);
    c.rotate(toRad(layer.rotation));
    c.font = fontString(layer);
    c.textAlign = layer.align;
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    c.miterLimit = 2;

    const x = layer.align === 'left' ? -layer.width / 2 : layer.align === 'right' ? layer.width / 2 : 0;
    lines.forEach((line, i) => {
      const y = -height / 2 + lineHeight * (i + 0.5);
      if (layer.strokeWidth > 0) {
        c.strokeStyle = layer.stroke;
        c.lineWidth = layer.strokeWidth * 2; // strokes are centred on the glyph edge
        c.strokeText(line, x, y);
      }
      c.fillStyle = layer.fill;
      c.fillText(line, x, y);
    });
    c.restore();
  }

  function drawSelection(c, layer) {
    const s = screenScale();
    const { height } = layout(c, layer);
    const pad = BOX_PAD * s;
    const hw = layer.width / 2 + pad;
    const hh = height / 2 + pad;

    c.save();
    c.translate(layer.x, layer.y);
    c.rotate(toRad(layer.rotation));

    c.lineWidth = 1.5 * s;
    c.setLineDash([6 * s, 4 * s]);
    c.strokeStyle = '#ffcc00';
    c.strokeRect(-hw, -hh, hw * 2, hh * 2);
    c.setLineDash([]);

    const handles = handlePositions(layer, height);
    const rotate = handles.find((h) => h.type === 'rotate');
    c.beginPath();
    c.moveTo(0, Math.sign(rotate.y) * hh);
    c.lineTo(0, rotate.y);
    c.stroke();

    handles.forEach(({ x, y }) => {
      c.beginPath();
      c.arc(x, y, HANDLE_RADIUS * s, 0, Math.PI * 2);
      c.fillStyle = '#ffcc00';
      c.fill();
      c.lineWidth = 1.5 * s;
      c.strokeStyle = '#111';
      c.stroke();
    });
    c.restore();
  }

  // Handle centres in the layer's local (unrotated) coordinate space.
  function handlePositions(layer, height) {
    const s = screenScale();
    const pad = BOX_PAD * s;
    const hw = layer.width / 2 + pad;
    const hh = height / 2 + pad;
    // Put the rotate handle below the box when above would fall off the image.
    const rotateY = layer.y - hh - ROTATE_OFFSET * s - HANDLE_RADIUS * s < 0
      ? hh + ROTATE_OFFSET * s
      : -hh - ROTATE_OFFSET * s;
    return [
      { type: 'scale', x: hw, y: hh },
      { type: 'width', x: -hw, y: 0 },
      { type: 'width', x: hw, y: 0 },
      { type: 'rotate', x: 0, y: rotateY },
    ];
  }

  /* ---------------------------------------------------------------- */
  /* Pointer interaction                                               */
  /* ---------------------------------------------------------------- */

  // Canvas pixels per CSS pixel, so handles stay the same size on screen.
  function screenScale() {
    const rect = els.canvas.getBoundingClientRect();
    return rect.width ? els.canvas.width / rect.width : 1;
  }

  function toCanvasPoint(e) {
    const rect = els.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (els.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (els.canvas.height / rect.height),
    };
  }

  function toLocal(layer, p) {
    const a = -toRad(layer.rotation);
    const dx = p.x - layer.x;
    const dy = p.y - layer.y;
    return {
      x: dx * Math.cos(a) - dy * Math.sin(a),
      y: dx * Math.sin(a) + dy * Math.cos(a),
    };
  }

  function pointerAngle(layer, p) {
    return Math.atan2(p.y - layer.y, p.x - layer.x) * 180 / Math.PI;
  }

  function hitHandle(p) {
    const layer = selectedLayer();
    if (!layer) return null;
    const local = toLocal(layer, p);
    const { height } = layout(ctx, layer);
    const r = HANDLE_HIT * screenScale();
    const handle = handlePositions(layer, height)
      .find((h) => Math.hypot(local.x - h.x, local.y - h.y) <= r);
    return handle ? { layer, handle } : null;
  }

  function hitLayer(p) {
    const pad = BOX_PAD * screenScale();
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const layer = state.layers[i];
      const local = toLocal(layer, p);
      const { height } = layout(ctx, layer);
      if (Math.abs(local.x) <= layer.width / 2 + pad && Math.abs(local.y) <= height / 2 + pad) {
        return layer;
      }
    }
    return null;
  }

  function cursorFor(p) {
    const hit = hitHandle(p);
    if (hit) {
      if (hit.handle.type === 'rotate') return 'grab';
      if (hit.handle.type === 'width') return 'ew-resize';
      return 'nwse-resize';
    }
    return hitLayer(p) ? 'text' : 'default';
  }

  els.canvas.addEventListener('pointerdown', (e) => {
    if (!state.image) return;
    if (state.editingId !== null) stopEditing();
    const p = toCanvasPoint(e);
    const handleHit = hitHandle(p);

    if (handleHit) {
      const { layer, handle } = handleHit;
      state.drag = {
        mode: handle.type,
        layer,
        startDist: Math.max(1, Math.hypot(p.x - layer.x, p.y - layer.y)),
        startFont: layer.fontSize,
        startWidth: layer.width,
        startStroke: layer.strokeWidth,
        angleOffset: layer.rotation - pointerAngle(layer, p),
      };
    } else {
      const layer = hitLayer(p);
      if (layer) {
        // Bring the grabbed layer to the front.
        state.layers = state.layers.filter((l) => l !== layer).concat(layer);
        select(layer.id);
        state.drag = {
          mode: 'move', layer, dx: p.x - layer.x, dy: p.y - layer.y,
          startX: e.clientX, startY: e.clientY,
        };
      } else {
        select(null);
        return;
      }
    }

    els.canvas.setPointerCapture(e.pointerId);
    els.canvas.focus({ preventScroll: true });
    e.preventDefault();
  });

  els.canvas.addEventListener('pointermove', (e) => {
    if (!state.image) return;
    const p = toCanvasPoint(e);
    const drag = state.drag;
    if (!drag) {
      els.canvas.style.cursor = cursorFor(p);
      return;
    }

    const { layer } = drag;
    if (drag.mode === 'move') {
      layer.x = clamp(p.x - drag.dx, 0, els.canvas.width);
      layer.y = clamp(p.y - drag.dy, 0, els.canvas.height);
    } else if (drag.mode === 'scale') {
      const ratio = Math.hypot(p.x - layer.x, p.y - layer.y) / drag.startDist;
      layer.fontSize = layer.baseSize = clamp(Math.round(drag.startFont * ratio), 8, 1000);
      layer.width = Math.max(20, drag.startWidth * ratio);
      layer.strokeWidth = Math.round(drag.startStroke * ratio * 2) / 2;
    } else if (drag.mode === 'width') {
      const local = toLocal(layer, p);
      layer.width = Math.max(layer.fontSize, 2 * (Math.abs(local.x) - BOX_PAD * screenScale()));
    } else if (drag.mode === 'rotate') {
      let deg = pointerAngle(layer, p) + drag.angleOffset;
      deg = ((deg + 540) % 360) - 180;
      if (e.shiftKey) deg = Math.round(deg / 15) * 15;
      else if (Math.abs(deg) < 3) deg = 0;
      layer.rotation = Math.round(deg);
      els.canvas.style.cursor = 'grabbing';
    }
    syncProps();
    requestRender();
  });

  const endDrag = (e) => {
    const drag = state.drag;
    if (!drag) return;
    state.drag = null;
    if (els.canvas.hasPointerCapture(e.pointerId)) els.canvas.releasePointerCapture(e.pointerId);
    els.canvas.style.cursor = cursorFor(toCanvasPoint(e));

    const moved = drag.mode === 'move' && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 4;
    if (moved) els.canvas.style.cursor = 'text';
    // A click or tap without dragging starts typing straight away.
    if (e.type === 'pointerup' && drag.mode === 'move' && !moved) {
      startEditing(drag.layer);
    }
  };
  els.canvas.addEventListener('pointerup', endDrag);
  els.canvas.addEventListener('pointercancel', endDrag);

  els.canvas.addEventListener('dblclick', (e) => {
    const layer = hitLayer(toCanvasPoint(e));
    if (layer) startEditing(layer, { selectAll: true });
  });

  /* ---------------------------------------------------------------- */
  /* Typing directly on the image                                      */
  /* ---------------------------------------------------------------- */

  const editor = document.createElement('textarea');
  editor.className = 'text-editor';
  editor.spellcheck = false;
  editor.setAttribute('aria-label', 'Edit meme text');
  els.canvas.parentElement.append(editor);
  editor.hidden = true;

  function startEditing(layer, { selectAll = false, append = '', backspace = false } = {}) {
    if (state.editingId !== layer.id) {
      if (state.editingId !== null) stopEditing();
      if (state.selectedId !== layer.id) select(layer.id);
      state.editingId = layer.id;
      editor.value = layer.text;
      editor.hidden = false;
    }
    if (append) editor.value += append;
    if (backspace) editor.value = editor.value.slice(0, -1);
    if (append || backspace) updateFromEditor();
    positionEditor();
    editor.focus({ preventScroll: true });
    if (selectAll) editor.select();
    else editor.setSelectionRange(editor.value.length, editor.value.length);
    requestRender();
  }

  function stopEditing() {
    if (state.editingId === null) return;
    state.editingId = null;
    editor.hidden = true;
    editor.blur();
    renderLayerList();
    requestRender();
  }

  function updateFromEditor() {
    const layer = state.layers.find((l) => l.id === state.editingId);
    if (!layer) return;
    layer.text = editor.value;
    syncProps();
    renderLayerList();
    positionEditor();
  }

  // Lay the editor over the text box so typing looks like the final meme.
  function positionEditor() {
    const layer = state.layers.find((l) => l.id === state.editingId);
    if (!layer) return;
    const rect = els.canvas.getBoundingClientRect();
    const host = els.canvas.parentElement.getBoundingClientRect();
    const k = rect.width / els.canvas.width;
    const { height } = layout(ctx, { ...layer, text: editor.value || ' ' });
    const w = layer.width * k;
    const h = Math.max(height, layer.fontSize * LINE_HEIGHT) * k;
    const outline = Math.max(0, layer.strokeWidth * k);

    Object.assign(editor.style, {
      left: `${rect.left - host.left + layer.x * k - w / 2}px`,
      top: `${rect.top - host.top + layer.y * k - h / 2}px`,
      width: `${w}px`,
      height: `${h}px`,
      transform: `rotate(${layer.rotation}deg)`,
      font: `${layer.fontSize * k}px/${LINE_HEIGHT} ${layer.fontFamily}`,
      color: layer.fill,
      textAlign: layer.align,
      textTransform: layer.uppercase ? 'uppercase' : 'none',
      webkitTextStroke: outline ? `${outline * 2}px ${layer.stroke}` : '0',
      paintOrder: 'stroke fill',
    });
  }

  editor.addEventListener('input', () => {
    updateFromEditor();
    requestRender();
  });
  editor.addEventListener('blur', () => {
    // Clicking inside the editor's own text should not end editing.
    setTimeout(() => { if (document.activeElement !== editor) stopEditing(); }, 0);
  });
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing();
      els.canvas.focus({ preventScroll: true });
    }
  });
  window.addEventListener('resize', positionEditor);

  /* ---------------------------------------------------------------- */
  /* Keyboard                                                          */
  /* ---------------------------------------------------------------- */

  function isTyping(target) {
    return target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  }

  window.addEventListener('keydown', (e) => {
    if (isTyping(e.target)) return;
    const layer = selectedLayer();
    if (!layer) return;

    const step = (e.shiftKey ? 10 : 1) * screenScale();
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };

    if (moves[e.key]) {
      layer.x += moves[e.key][0];
      layer.y += moves[e.key][1];
      requestRender();
    } else if (e.key === 'Delete') {
      removeSelected();
    } else if (e.key === 'Backspace') {
      startEditing(layer, { backspace: true });
    } else if (e.key === 'Enter' || e.key === 'F2') {
      startEditing(layer);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      startEditing(layer, { append: e.key });
    } else if (e.key === 'Escape') {
      select(null);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      duplicateSelected();
    } else {
      return;
    }
    e.preventDefault();
  });

  /* ---------------------------------------------------------------- */
  /* Export                                                            */
  /* ---------------------------------------------------------------- */

  // LinkedIn feed sizes. The meme is fitted inside and the rest is filled with the background.
  const EXPORT_SIZES = {
    square: [1200, 1200],
    portrait: [1080, 1350],
    landscape: [1200, 627],
  };

  function exportCanvas() {
    const meme = document.createElement('canvas');
    meme.width = els.canvas.width;
    meme.height = els.canvas.height;
    drawScene(meme.getContext('2d'), false);
    const size = EXPORT_SIZES[els.exportSize.value];
    if (!size) return meme;

    const [W, H] = size;
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const c = out.getContext('2d');
    const bg = els.exportBg.value;
    if (bg === 'blur') {
      // Blur the plain picture (without the captions), scaled to cover the whole frame.
      const pic = state.image;
      const pw = pic.naturalWidth || pic.width;
      const ph = pic.naturalHeight || pic.height;
      const cover = Math.max(W / pw, H / ph) * 1.15;
      const dw = pw * cover;
      const dh = ph * cover;
      if ('filter' in c) {
        c.filter = `blur(${Math.round(W / 30)}px)`;
        c.drawImage(pic, (W - dw) / 2, (H - dh) / 2, dw, dh);
        c.filter = 'none';
      }
      if (!('filter' in c) || c.getImageData(0, 0, 1, 1).data[3] === 0) {
        // No canvas filter (older Safari): shrink to a few pixels and scale back up in steps.
        let src = pic;
        let sw = pw;
        let sh = ph;
        for (const size of [96, 24]) {
          const step = document.createElement('canvas');
          step.width = size;
          step.height = Math.max(1, Math.round(size * sh / sw));
          step.getContext('2d').drawImage(src, 0, 0, step.width, step.height);
          src = step; sw = step.width; sh = step.height;
        }
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        c.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
      }
      c.fillStyle = 'rgba(0, 0, 0, 0.3)';
      c.fillRect(0, 0, W, H);
    } else {
      c.fillStyle = bg === 'black' ? '#000' : '#fff';
      c.fillRect(0, 0, W, H);
    }
    const fit = Math.min(W / meme.width, H / meme.height);
    const w = meme.width * fit;
    const h = meme.height * fit;
    c.imageSmoothingQuality = 'high';
    c.drawImage(meme, (W - w) / 2, (H - h) / 2, w, h);
    return out;
  }

  function exportBlob() {
    const out = exportCanvas();
    return new Promise((resolve, reject) => {
      out.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))), 'image/png');
    });
  }

  function fileName() {
    const slug = state.imageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${slug || 'meme'}.png`;
  }

  els.downloadBtn.addEventListener('click', async () => {
    try {
      const blob = await exportBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName();
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Downloaded!');
    } catch (err) {
      console.error(err);
      showToast('Could not export this image.');
    }
  });

  els.copyBtn.addEventListener('click', async () => {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      showToast('Copying images is not supported in this browser. Use Download instead.');
      return;
    }
    try {
      // Passing the promise keeps Safari's user-gesture requirement happy.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': exportBlob() })]);
      showToast('Copied to clipboard!');
    } catch (err) {
      console.error(err);
      showToast('Could not copy. Use Download instead.');
    }
  });

  const canShareFiles = (() => {
    try {
      return !!navigator.canShare &&
        navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] });
    } catch {
      return false;
    }
  })();
  els.shareBtn.hidden = !canShareFiles;

  els.shareBtn.addEventListener('click', async () => {
    try {
      const blob = await exportBlob();
      await navigator.share({ files: [new File([blob], fileName(), { type: 'image/png' })] });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        showToast('Could not share this image.');
      }
    }
  });

  /* ---------------------------------------------------------------- */
  /* LinkedIn post text and sharing                                    */
  /* ---------------------------------------------------------------- */

  const POSTS = window.MEME_POSTS || {};
  let postIndex = 0;
  let postEdited = false;

  function suggestPostText(next = false) {
    if (next) postIndex++;
    const set = POSTS[currentTopic] || POSTS.general;
    if (!set) return;
    const hooks = seededShuffle(set.hooks, `${state.imageName}:${currentTopic}`);
    const hook = hooks[postIndex % hooks.length];
    els.postText.value = `${hook}\n\n${set.tags.join(' ')}`;
    postEdited = false;
  }

  els.postText.addEventListener('input', () => { postEdited = true; });
  els.newPostTextBtn.addEventListener('click', () => suggestPostText(true));
  els.copyPostTextBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(els.postText.value);
      showToast('Post text copied!');
    } catch {
      els.postText.select();
      showToast('Select the text and copy it with Ctrl+C.');
    }
  });

  els.linkedinBtn.addEventListener('click', async () => {
    const text = els.postText.value.trim();
    const touch = window.matchMedia?.('(pointer: coarse)').matches;
    // Phones: the share sheet hands image and text to the LinkedIn app.
    if (touch && canShareFiles) {
      try {
        const blob = await exportBlob();
        await navigator.share({ files: [new File([blob], fileName(), { type: 'image/png' })], text });
      } catch (err) {
        if (err.name !== 'AbortError') showToast('Could not share. Use Download instead.');
      }
      return;
    }
    // Computers: copy the image, then open the LinkedIn post window with the text filled in.
    let copied = false;
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
      try {
        // Start the copy before opening the tab, while the click still counts as a user gesture.
        const copy = navigator.clipboard.write([new ClipboardItem({ 'image/png': exportBlob() })]);
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        await copy;
        copied = true;
      } catch (err) {
        console.error(err);
      }
    } else {
      window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
    if (copied) {
      showToast('Meme copied! In LinkedIn, click into the post and press Ctrl+V (Cmd+V on Mac) to add it.');
    } else {
      els.downloadBtn.click();
      setTimeout(() => showToast('Meme downloaded. In LinkedIn, add it with the image button.'), 50);
    }
  });

  /* ---------------------------------------------------------------- */
  /* Applying captions                                                */
  /* ---------------------------------------------------------------- */

  // Text boxes in caption order: template slots first, then any extra boxes top to bottom.
  function orderedLayers() {
    const key = (l) => (l.order ?? 1000) * 1e6 + l.y;
    return [...state.layers].sort((a, b) => key(a) - key(b));
  }

  // Shrink a caption until it stays inside the picture and wraps to at most 3 lines.
  const MAX_FIT_LINES = 3;
  const MIN_FIT_SCALE = 0.45;
  function fitLayer(layer) {
    const H = els.canvas.height;
    const base = layer.baseSize || layer.fontSize;
    layer.baseSize = base;
    layer.fontSize = base;
    const room = Math.max(2 * Math.min(layer.y, H - layer.y) - H * 0.02, H * 0.08);
    for (let i = 0; i < 40 && layer.fontSize > base * MIN_FIT_SCALE; i++) {
      const { lines, height } = layout(ctx, layer);
      if (height <= room && lines.length <= MAX_FIT_LINES) break;
      layer.fontSize = Math.max(Math.round(base * MIN_FIT_SCALE), Math.floor(layer.fontSize * 0.93));
    }
    layer.strokeWidth = Math.max(1, Math.round(layer.fontSize / 14 * 2) / 2);
  }

  function applyTexts(texts) {
    const ordered = orderedLayers();
    texts.forEach((text, i) => {
      if (ordered[i]) {
        ordered[i].text = text;
      } else {
        ordered.push(addLayer({ text, y: Math.min(0.9, (i + 0.5) / texts.length) }, false));
      }
      fitLayer(ordered[i]);
    });
    ordered.slice(texts.length).forEach((layer) => { layer.text = ''; });
    syncProps();
    renderLayerList();
    requestRender();
  }

  /* ---------------------------------------------------------------- */
  /* Caption ideas for the open image                                  */
  /* ---------------------------------------------------------------- */

  const BUILT_IN = new Map();
  (window.MEME_CAPTIONS || []).forEach((entry) => {
    entry.names.forEach((name) => BUILT_IN.set(nameKey(name), entry));
  });

  function findBuiltIn(name) {
    return BUILT_IN.get(nameKey(name || '')) || null;
  }

  function renderIdeas(ideas) {
    els.ideaList.replaceChildren(...ideas.map((texts) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'idea';
      texts.filter(Boolean).forEach((text) => {
        const line = document.createElement('span');
        line.textContent = text;
        btn.append(line);
      });
      btn.addEventListener('click', () => {
        useIdea(texts);
        els.ideaList.querySelectorAll('.idea').forEach((b) => b.classList.toggle('is-active', b === btn));
      });
      li.append(btn);
      return li;
    }));
  }

  // Stable pseudo-random order per template, so each meme gets its own mix of ideas.
  function seededShuffle(list, seedText) {
    let seed = 2166136261;
    for (const ch of seedText) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
    const random = () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const POOL_NAMES = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

  // Ideas written for exactly this many boxes. Only when a pack has none (6+ boxes) do we
  // borrow the biggest smaller pool and stretch it with fitIdea.
  function exactPool(pools, boxes) {
    const exact = pools[POOL_NAMES[boxes]] || [];
    if (exact.length) return exact;
    for (let n = Math.min(boxes - 1, 5); n >= 1; n--) {
      const list = pools[POOL_NAMES[n]] || [];
      if (list.length) return list;
    }
    return [];
  }

  // Keep only ideas with one line per box. Stretching other ideas is a last resort for
  // pictures where nothing was written for that many boxes (for example 6 boxes).
  function fitAll(ideas, boxes) {
    const exact = ideas.filter((idea) => idea.length === boxes);
    return (exact.length ? exact : ideas).map((idea) => fitIdea(idea, boxes));
  }

  // Fit an idea to the number of text boxes: first line on top, last line at the bottom.
  function fitIdea(texts, boxes) {
    const lines = texts.map((t) => String(t || '').trim());
    if (boxes === 1) return [lines.filter(Boolean).join(' ')];
    if (lines.length === boxes) return lines;
    if (lines.length > boxes) return [...lines.slice(0, boxes - 1), lines.slice(boxes - 1).filter(Boolean).join(' ')];
    return [...lines.slice(0, -1), ...Array(boxes - lines.length).fill(''), lines[lines.length - 1]];
  }

  function themeIdeas(text) {
    const words = new Set(String(text).toLowerCase().split(/[^a-z]+/).filter(Boolean));
    const has = (w) => words.has(w) || words.has(`${w}s`);
    return Object.values(window.MEME_IDEAS?.themes || {})
      .filter((theme) => theme.words.some(has))
      .flatMap((theme) => theme.ideas);
  }

  // Ideas for a template without its own captions: its Memegen example, themed ideas
  // matching its name, then general ideas for its number of text boxes.
  function ideasFor(template, boxes) {
    const pools = window.MEME_IDEAS || { two: [], one: [], three: [], four: [] };
    const seed = template?.name || 'meme';
    const ideas = [];
    if (template?.example?.length === boxes && template.example.some((t) => String(t).trim())) ideas.push(template.example);
    ideas.push(...seededShuffle(themeIdeas(`${template?.name || ''} ${template?.keywords || ''}`), seed).slice(0, 6));
    ideas.push(...seededShuffle(exactPool(pools, boxes), seed));

    const seen = new Set();
    return fitAll(ideas, boxes)
      .filter((idea) => {
        const key = idea.join('|').toLowerCase();
        if (!idea.some(Boolean) || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }

  /* Topic packs (js/topics.js): the labels and captions live there; buttons are built from it. */

  const TOPICS = window.MEME_TOPICS || {};
  const TOPIC_KEY = 'meme-maker-topic';
  let currentTopic = TOPICS.linkedin ? 'linkedin' : 'general';
  try {
    const saved = localStorage.getItem(TOPIC_KEY);
    if (saved && TOPICS[saved]) currentTopic = saved;
  } catch { /* storage blocked: keep the default */ }

  let openMeme = null;      // { builtIn, template } of the picture being edited
  let lastApplied = null;   // the idea last put on the image, to tell it apart from the user's own text

  function useIdea(texts) {
    applyTexts(texts);
    lastApplied = orderedLayers().map((l) => l.text);
  }

  // True while the text on the image is still an idea we filled in, not the user's own words.
  function textIsOurs() {
    const now = orderedLayers().map((l) => l.text);
    return !lastApplied || (now.length === lastApplied.length && now.every((t, i) => t === lastApplied[i]));
  }

  function topicIdeas(topic, builtIn, template, boxes) {
    const seed = `${template?.name || 'meme'}:${currentTopic}`;
    const specific = builtIn ? topic.templates[builtIn.names[0]] || [] : [];
    const seen = new Set();
    return fitAll([...specific, ...seededShuffle(exactPool(topic, boxes), seed)], boxes)
      .filter((idea) => {
        const key = idea.join('|').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }

  function renderTopicPicker() {
    // Work topics first, then General, then the fun packs.
    const options = Object.entries(TOPICS).map(([key, t]) => [key, t.label]);
    const after = options.findIndex(([key]) => key === 'ai');
    options.splice(after + 1, 0, ['general', 'General']);
    els.topicPicker.replaceChildren(...options.map(([key, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'topic';
      btn.textContent = label;
      btn.setAttribute('aria-pressed', String(key === currentTopic));
      btn.addEventListener('click', () => {
        if (key === currentTopic) return;
        currentTopic = key;
        try { localStorage.setItem(TOPIC_KEY, key); } catch { /* ignore */ }
        renderTopicPicker();
        // Swap the caption on the image too, unless the user has written their own.
        if (openMeme) showIdeas(openMeme.builtIn, openMeme.template, { fill: textIsOurs() });
      });
      return btn;
    }));
  }
  renderTopicPicker();

  // Every picture opens with the first idea filled in and more to pick from.
  function showIdeas(builtIn, template, { fill = true } = {}) {
    openMeme = { builtIn, template };
    els.ideas.hidden = false;
    const boxes = Math.max(1, Math.min(6, state.layers.length || 2));
    const topic = TOPICS[currentTopic];
    const ideas = topic ? topicIdeas(topic, builtIn, template, boxes)
      : builtIn ? builtIn.c : ideasFor(template, boxes);
    renderIdeas(ideas);
    if (fill) {
      useIdea(ideas[0]);
      els.ideaList.querySelector('.idea')?.classList.add('is-active');
    }
    if (!postEdited || fill) { postIndex = 0; suggestPostText(); }
    els.ideasStatus.textContent = topic
      ? `${topic.label} ideas. Tap one to use it, or tap the text on the image to write your own.`
      : 'Tap an idea to use it, or tap the text on the image to write your own.';
  }

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    if (message) toastTimer = setTimeout(() => { els.toast.textContent = ''; }, 3500);
  }

  function toRad(deg) { return deg * Math.PI / 180; }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  window.addEventListener('resize', requestRender);
  document.fonts?.ready.then(requestRender);
  ensureFont('Impact, Anton, sans-serif');

  syncProps();
  loadTemplates();
})();
