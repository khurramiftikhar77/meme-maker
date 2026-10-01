import Anthropic from '@anthropic-ai/sdk';
import { DurableObject } from 'cloudflare:workers';

const MAX_IMAGE_BYTES = 1_500_000;  // base64 data URL length cap
const MAX_TEMPLATES = 400;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const TONES = {
  general: 'general internet humor',
  wholesome: 'wholesome and kind, no punching down',
  sarcastic: 'dry and sarcastic',
  dark: 'dark humor, edgy but never hateful or cruel to real groups',
  office: 'office and corporate life humor',
  genz: 'Gen Z internet slang and humor',
  desi: 'Pakistani / South Asian desi humor; Roman Urdu or a Roman Urdu and English mix is welcome',
  dad: 'cheesy dad jokes and puns',
};

const SYSTEM_PROMPT = `You write captions for a meme maker app. Captions should be genuinely funny, short enough to read at a glance on an image (usually under 12 words per text box), and fit the meme format's known use when you recognize the template.

Keep it suitable for a public website: no slurs, no hate toward protected groups, no sexual content, and no mocking real private individuals. Public figures and everyday situations are fair game for light satire.`;

const CAPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          texts: { type: 'array', items: { type: 'string' } },
        },
        required: ['texts'],
        additionalProperties: false,
      },
    },
  },
  required: ['suggestions'],
  additionalProperties: false,
};

const MEME_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          template_id: { type: 'string' },
          texts: { type: 'array', items: { type: 'string' } },
          why: { type: 'string' },
        },
        required: ['template_id', 'texts', 'why'],
        additionalProperties: false,
      },
    },
  },
  required: ['suggestions'],
  additionalProperties: false,
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    try {
      if (request.method !== 'POST') throw new HttpError(405, 'Use POST.');
      checkOrigin(request, url);
      if (!env.ANTHROPIC_API_KEY) {
        throw new HttpError(503, 'AI suggestions are not set up yet: the site owner needs to add an Anthropic API key.');
      }

      const body = await readJson(request);
      const handler = { '/api/captions': suggestCaptions, '/api/meme': suggestMeme }[url.pathname];
      if (!handler) throw new HttpError(404, 'Unknown endpoint.');

      // Validate first so bad requests don't use up the visitor's quota.
      const run = handler(body, env);
      const remaining = await takeQuota(request, env);
      const result = await run();
      return json({ ...result, remaining });
    } catch (err) {
      return errorResponse(err);
    }
  },
};

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

// Each handler validates the request, then returns a function that calls Claude.
function suggestCaptions(body, env) {
  const image = String(body.image || '');
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if (!match) throw new HttpError(400, 'Send the image as a base64 data URL.');
  if (image.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Image is too large.');

  const boxes = clampInt(body.boxes, 1, 6, 2);
  const tone = toneText(body.tone);
  const name = cleanText(body.templateName, 100);
  const current = Array.isArray(body.currentTexts)
    ? body.currentTexts.slice(0, 6).map((t) => cleanText(t, 200)).filter(Boolean)
    : [];
  // Optional box centres as [x%, y%] so Claude knows which caption goes where.
  const positions = Array.isArray(body.positions)
    ? body.positions.slice(0, boxes).map((p) => [clampInt(p?.[0], 0, 100, 50), clampInt(p?.[1], 0, 100, 50)])
    : [];
  const boxList = positions.length === boxes
    ? `Text boxes in order: ${positions.map(([x, y], i) => `box ${i + 1} centred ${x}% from the left and ${y}% from the top`).join('; ')}.`
    : `It has ${boxes} text box${boxes === 1 ? '' : 'es'}, filled in order from top to bottom.`;

  const prompt = [
    name ? `The image is the meme template "${name}".` : 'The image is a picture the user uploaded.',
    boxList,
    current.length ? `Current text in the boxes (may just be placeholders): ${current.map((t) => `"${t}"`).join(', ')}.` : '',
    `Tone: ${tone}.`,
    `Write 5 different caption ideas. Each idea is an array of exactly ${boxes} strings, one per box in order. Use an empty string for a box that should stay blank.`,
  ].filter(Boolean).join('\n');

  return async () => {
    const data = await askClaude(env, CAPTIONS_SCHEMA, [
      { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
      { type: 'text', text: prompt },
    ]);

    const suggestions = data.suggestions
      .map((s) => ({ texts: fitBoxes(s.texts, boxes) }))
      .filter((s) => s.texts.some(Boolean))
      .slice(0, 5);
    if (!suggestions.length) throw new HttpError(502, 'Claude did not return any captions. Try again.');
    return { suggestions };
  };
}

function suggestMeme(body, env) {
  const topic = cleanText(body.topic, 300);
  if (!topic) throw new HttpError(400, 'Describe what the meme should be about.');
  if (!Array.isArray(body.templates) || !body.templates.length) {
    throw new HttpError(400, 'No templates were sent.');
  }

  const templates = new Map();
  body.templates.slice(0, MAX_TEMPLATES).forEach((t) => {
    const id = cleanText(t?.id, 80);
    const name = cleanText(t?.name, 100);
    if (id && name) templates.set(id, { name, boxes: clampInt(t.boxes, 1, 6, 2) });
  });

  const list = [...templates].map(([id, t]) => `${id} | ${t.name} | ${t.boxes}`).join('\n');
  const prompt = `Make a meme about: ${topic}
Tone: ${toneText(body.tone)}.

Pick the 3 best-fitting templates from the list below (columns: id | name | number of text boxes). Use each template's known meme format. For each pick, give its exact id, captions with exactly one string per text box in order, and one short sentence on why it fits.

${list}`;

  if (!templates.size) throw new HttpError(400, 'No valid templates were sent.');

  return async () => {
    const data = await askClaude(env, MEME_SCHEMA, [{ type: 'text', text: prompt }]);

    // Drop picks that name a template we did not offer.
    const suggestions = data.suggestions
      .filter((s) => templates.has(s.template_id))
      .map((s) => ({
        templateId: s.template_id,
        texts: fitBoxes(s.texts, templates.get(s.template_id).boxes),
        why: cleanText(s.why, 200),
      }))
      .slice(0, 3);
    if (!suggestions.length) throw new HttpError(502, 'Claude did not pick any templates. Try rephrasing your idea.');
    return { suggestions };
  };
}

/* ------------------------------------------------------------------ */
/* Claude                                                              */
/* ------------------------------------------------------------------ */

async function askClaude(env, schema, content) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const response = await client.beta.messages.create({
    model: env.CLAUDE_MODEL || 'claude-opus-5-5',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    // If a safety classifier declines, retry server-side on Anthropic's recommended model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') {
    throw new HttpError(422, 'Claude would not write captions for this one. Try a different image or idea.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new HttpError(502, 'Claude ran out of room while writing. Try again.');
  }

  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data.suggestions)) throw new Error('missing suggestions');
    return data;
  } catch {
    throw new HttpError(502, 'Claude returned an unexpected answer. Try again.');
  }
}

/* ------------------------------------------------------------------ */
/* Rate limiting                                                       */
/* ------------------------------------------------------------------ */

// One fixed-window counter per key, stored in a SQLite-backed Durable Object.
export class RateLimiter extends DurableObject {
  async hit(limit, windowMs) {
    const now = Date.now();
    let window = (await this.ctx.storage.get('window')) || { start: now, count: 0 };
    if (now - window.start >= windowMs) window = { start: now, count: 0 };
    if (window.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((window.start + windowMs - now) / 1000) };
    }
    window.count += 1;
    await this.ctx.storage.put('window', window);
    return { ok: true, remaining: limit - window.count };
  }
}

async function takeQuota(request, env) {
  const perVisitor = clampInt(env.HOURLY_LIMIT_PER_VISITOR, 1, 10_000, 20);
  const total = clampInt(env.DAILY_LIMIT_TOTAL, 1, 1_000_000, 500);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const limiter = (name) => env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName(name));

  const visitor = await limiter(`ip:${ip}`).hit(perVisitor, HOUR_MS);
  if (!visitor.ok) {
    throw new HttpError(429, `You've used all ${perVisitor} suggestions for this hour. Try again in ${minutes(visitor.retryAfter)}.`);
  }
  const site = await limiter('site').hit(total, DAY_MS);
  if (!site.ok) {
    throw new HttpError(429, `The site has reached today's limit for AI suggestions. Try again in ${minutes(site.retryAfter)}.`);
  }
  return visitor.remaining;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Only accept calls from pages served by this Worker.
function checkOrigin(request, url) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) throw new HttpError(403, 'Requests from other sites are not allowed.');
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Request body must be JSON.');
  }
}

function errorResponse(err) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  if (err instanceof Anthropic.RateLimitError) {
    return json({ error: 'Claude is busy right now. Try again in a minute.' }, 503);
  }
  if (err instanceof Anthropic.AuthenticationError) {
    console.error('Anthropic API key rejected', err.message);
    return json({ error: 'AI suggestions are misconfigured: the API key was rejected.' }, 503);
  }
  if (err instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${err.status}`, err.message);
    return json({ error: 'Claude could not answer right now. Try again.' }, 502);
  }
  console.error(err);
  return json({ error: 'Something went wrong.' }, 500);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function fitBoxes(texts, boxes) {
  const out = (Array.isArray(texts) ? texts : []).slice(0, boxes).map((t) => cleanText(t, 200));
  while (out.length < boxes) out.push('');
  return out;
}

function toneText(tone) {
  return TONES[tone] || TONES.general;
}

function cleanText(value, max) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function minutes(seconds) {
  const m = Math.max(1, Math.ceil(seconds / 60));
  return m >= 60 ? `${Math.ceil(m / 60)} hour${m >= 120 ? 's' : ''}` : `${m} minute${m === 1 ? '' : 's'}`;
}
