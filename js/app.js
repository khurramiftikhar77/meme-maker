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
        setImage(img, t.name, exportable, t.boxes, builtIn?.b);
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

    [els.addTextBtn, els.addTextBtn2, els.copyBtn, els.shareBtn, els.downloadBtn].forEach((b) => { b.disabled = false; });
    document.body.classList.add('has-image');
    els.copyBtn.disabled = els.shareBtn.disabled = els.downloadBtn.disabled = !exportable;
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
  bindProp(els.propSize, 'input', (l) => { l.fontSize = Number(els.propSize.value); });
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
      layer.fontSize = clamp(Math.round(drag.startFont * ratio), 8, 1000);
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

  function exportBlob() {
    const out = document.createElement('canvas');
    out.width = els.canvas.width;
    out.height = els.canvas.height;
    drawScene(out.getContext('2d'), false);
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
  /* Applying captions                                                */
  /* ---------------------------------------------------------------- */

  // Text boxes in caption order: template slots first, then any extra boxes top to bottom.
  function orderedLayers() {
    const key = (l) => (l.order ?? 1000) * 1e6 + l.y;
    return [...state.layers].sort((a, b) => key(a) - key(b));
  }

  function applyTexts(texts) {
    const ordered = orderedLayers();
    texts.forEach((text, i) => {
      if (ordered[i]) {
        ordered[i].text = text;
      } else {
        ordered.push(addLayer({ text, y: Math.min(0.9, (i + 0.5) / texts.length) }, false));
      }
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
        applyTexts(texts);
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
    const general = boxes === 1 ? [...pools.one, ...pools.two]
      : boxes === 2 ? pools.two
        : boxes === 3 ? [...pools.three, ...pools.two]
          : [...pools.four, ...pools.three];
    const ideas = [];
    if (template?.example?.some((t) => String(t).trim())) ideas.push(template.example);
    // Templates with 3+ boxes lead with ideas written for that many boxes.
    if (boxes >= 3) ideas.push(...seededShuffle(boxes === 3 ? pools.three : pools.four, seed).slice(0, 4));
    ideas.push(...seededShuffle(themeIdeas(`${template?.name || ''} ${template?.keywords || ''}`), seed).slice(0, 6));
    ideas.push(...seededShuffle(general, seed));

    const seen = new Set();
    return ideas
      .map((idea) => fitIdea(idea, boxes))
      .filter((idea) => {
        const key = idea.join('|').toLowerCase();
        if (!idea.some(Boolean) || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }

  // Every picture opens with the first idea filled in and more to pick from.
  function showIdeas(builtIn, template) {
    els.ideas.hidden = false;
    const boxes = Math.max(1, Math.min(6, state.layers.length || 2));
    const ideas = builtIn ? builtIn.c : ideasFor(template, boxes);
    renderIdeas(ideas);
    applyTexts(ideas[0]);
    els.ideaList.querySelector('.idea')?.classList.add('is-active');
    els.ideasStatus.textContent = 'Tap an idea to use it, or tap the text on the image to write your own.';
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
