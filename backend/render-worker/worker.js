/* X Architecture — AI render studio backend (Cloudflare Worker + Workers AI).
   Receives a small image + a style from the site, asks an image model to re-render it, and returns the picture.
   It also enforces the daily limits, so the model key/quota never touches the browser.

   Bindings (Workers → Settings → Bindings):
     AI      Workers AI                 (required)
     LIMITS  KV namespace               (required, stores the daily counters)
   Optional variables (Settings → Variables):
     DAILY_LIMIT  images per student per day      default 2
     IP_LIMIT     images per network address/day  default 6   (shared mobile networks need more than 2)
     GLOBAL_CAP   images for everyone per day     default 55  (one ~1.5 MP image costs ~160 of the 10,000 free neurons/day)
     MODEL        flux2 | sd15                    default flux2
     MAX_TILES    output size in 512px tiles (1-6)  default 6  (6 = up to 1536x1024; 4 = up to 1024x1024)
     ORIGINS      comma list of allowed websites  default https://xarch.site,https://www.xarch.site
   Setup in Arabic: backend/render-worker/SETUP.md */

// The design must never change: every preset only changes the scene (light, time of day, weather) or the realism of what is already there.
const KEEP = ' Keep the design exactly as it is: the same building and every shape, proportion, opening, material, object, plant, person, vehicle and the same camera angle. Do not add, remove, move, redraw or restyle anything, and do not add text.';
const STYLES = {
  day: 'Change only the time of day to a bright daytime scene with a clear blue sky and natural sunlight.' + KEEP,
  night: 'Change only the time of day to night: a deep blue night sky, with warm light glowing from the windows and existing lamps.' + KEEP,
  sunset: 'Change only the lighting to golden-hour sunset: a warm low sun, long soft shadows and a glowing orange sky.' + KEEP,
  dust: 'Change only the atmosphere to a dusty sandstorm day: a warm orange-brown dust haze in the air, reduced visibility, a dusty hazy sky and soft diffused sunlight.' + KEEP,
  overcast: 'Change only the weather to an overcast cloudy day: a soft grey cloudy sky and gentle diffused light with soft shadows.' + KEEP,
  rain: 'Change only the weather to a rainy day: a grey rainy sky, wet reflective ground and soft diffused light.' + KEEP,
  render: 'Turn this view into a photorealistic photograph of the very same design. Only improve the realism of the existing materials, lighting and shadows.' + KEEP,
  sketch: 'Turn this hand-drawn architectural sketch into a photorealistic render. Follow the sketch lines exactly for the massing, proportions and openings, and draw nothing that is not in the sketch.' + KEEP,
  materials: 'Change only the surface materials of the building as the architect asks. If nothing is specified, keep the same materials and only make their texture more realistic.' + KEEP,
  interior: 'Turn this interior view into a photorealistic photograph of the very same room. Only improve the realism of the existing materials and natural light.' + KEEP,
  massing: 'Render this massing model realistically with plain neutral concrete and soft daylight.' + KEEP,
  custom: 'Edit this image only as the architect asks below, and keep everything else exactly as it is.' + KEEP
};
const QUALITY = ' Photorealistic, ultra-sharp, high resolution, crisp fine details, clean edges, no blur, no noise.';
const BAD = /(nude|naked|porn|sex|nsfw|erotic|fetish|gore|blood|corpse|kill|murder|weapon|gun|rifle|terror|bomb|explosive|swastika|isis|عاري|عارية|عراة|جنس|اباحي|إباحي|دم|جثة|قتل|سلاح|بندقية|إرهاب|ارهاب|قنبلة|متفجر)/i;
const MAX_BYTES = 1.6 * 1024 * 1024;
const NOTE_MAX = 300;
const ARABIC = /[\u0600-\u06FF]/;
const clean = s => String(s || '').replace(/[\u0000-\u001f<>{}\[\]]/g, ' ').replace(/\s+/g, ' ').trim();

function day() { return new Date().toISOString().slice(0, 10); }
function num(v, d) { const n = parseInt(v, 10); return n > 0 ? n : d; }
function origins(env) { return String(env.ORIGINS || 'https://xarch.site,https://www.xarch.site').split(',').map(s => s.trim()).filter(Boolean); }
function cors(req, env) {
  const o = req.headers.get('Origin') || '';
  const ok = origins(env).includes(o) || (env.DEV === '1' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o));
  return {
    'Access-Control-Allow-Origin': ok ? o : origins(env)[0],
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}
function json(obj, status, h) { return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, h) }); }
async function hash(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s).toLowerCase().trim()));
  return [...new Uint8Array(b)].slice(0, 10).map(x => x.toString(16).padStart(2, '0')).join('');
}
async function getN(env, k) { const v = await env.LIMITS.get(k); return v ? parseInt(v, 10) || 0 : 0; }
async function bump(env, k, d) { const n = Math.max(0, (await getN(env, k)) + (d || 1)); await env.LIMITS.put(k, String(n), { expirationTtl: 172800 }); return n; }
function b64(buf) { let s = ''; const a = new Uint8Array(buf), c = 0x8000; for (let i = 0; i < a.length; i += c) s += String.fromCharCode.apply(null, a.subarray(i, i + c)); return btoa(s); }
function mime(b) { return b.startsWith('/9j/') ? 'image/jpeg' : b.startsWith('UklGR') ? 'image/webp' : 'image/png'; }
// The image model understands English best, so Arabic prompts are translated first (falls back to the raw text).
async function english(env, note) {
  if (!note || !ARABIC.test(note) || !env.AI) return note;
  try {
    const out = await env.AI.run('@cf/meta/m2m100-1.2b', { text: note, source_lang: 'arabic', target_lang: 'english' });
    const t = clean(out && out.translated_text).slice(0, NOTE_MAX);
    return t || note;
  } catch (e) { return note; }
}
// Output size: as many pixels as 6 tiles of 512x512 allow (about 1.5 MP, up to 1536x1024), keeping the picture's shape.
// The model bills per 512x512 tile, so the box is chosen from whole tiles and the sides are multiples of 64.
function dims(asp, maxTiles) {
  let best = null;
  for (let cx = 1; cx <= 3; cx++) for (let cy = 1; cy <= 3; cy++) {
    if (cx * cy > maxTiles) continue;
    const bw = cx * 512, bh = cy * 512;
    let w = bw, h = w / asp;
    if (h > bh) { h = bh; w = h * asp; }
    w = Math.min(bw, Math.max(256, Math.round(w / 64) * 64));
    h = Math.min(bh, Math.max(256, Math.round(h / 64) * 64));
    const a = w * h, err = Math.abs(Math.log(w / h / asp));
    if (!best || a > best.a * 1.001 || (Math.abs(a - best.a) <= best.a * 0.001 && err < best.err)) best = { w, h, a, err };
  }
  return [best.w, best.h];
}

async function ids(req, env, uid, email) {
  const ip = req.headers.get('CF-Connecting-IP') || 'x';
  const d = day();
  return { ip, kU: 'u:' + (await hash(uid || email || ip)) + ':' + d, kE: email ? 'e:' + (await hash(email)) + ':' + d : '', kI: 'i:' + (await hash(ip)) + ':' + d, kG: 'g:' + d };
}
async function left(env, k) {
  const per = num(env.DAILY_LIMIT, 2);
  const used = Math.max(await getN(env, k.kU), k.kE ? await getN(env, k.kE) : 0);
  return Math.max(0, per - used);
}

async function run(env, prompt, bytes, w, h) {
  const model = String(env.MODEL || 'flux2').toLowerCase();
  if (model === 'sd15') {
    const out = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', { prompt, image_b64: b64(bytes), strength: 0.62, guidance: 7.5, num_steps: 20, width: w, height: h });
    const buf = out instanceof ReadableStream ? await new Response(out).arrayBuffer() : out;
    return b64(buf);
  }
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('input_image_0', new Blob([bytes], { type: 'image/jpeg' }), 'input.jpg');
  form.append('width', String(w));
  form.append('height', String(h));
  const fr = new Response(form);
  const out = await env.AI.run('@cf/black-forest-labs/flux-2-klein-4b', { multipart: { body: fr.body, contentType: fr.headers.get('content-type') } });
  if (out && typeof out.image === 'string') return out.image.replace(/^data:[^,]+,/, '');
  if (out instanceof ReadableStream) return b64(await new Response(out).arrayBuffer());
  throw new Error('no image');
}

export default {
  async fetch(req, env) {
    const h = cors(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    if (!env.AI || !env.LIMITS) return json({ ok: false, error: 'closed' }, 503, h);
    const url = new URL(req.url);

    if (req.method === 'GET') {
      const k = await ids(req, env, url.searchParams.get('uid'), url.searchParams.get('email'));
      return json({ ok: true, left: await left(env, k), limit: num(env.DAILY_LIMIT, 2) }, 200, h);
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'bad' }, 405, h);

    let fd;
    try { fd = await req.formData(); } catch (e) { return json({ ok: false, error: 'bad' }, 400, h); }
    const uid = String(fd.get('uid') || '').slice(0, 80), email = String(fd.get('email') || '').slice(0, 120);
    if (uid.length < 8 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'register' }, 401, h);
    if (fd.get('status')) {
      const ks = await ids(req, env, uid, email);
      return json({ ok: true, left: await left(env, ks), limit: num(env.DAILY_LIMIT, 2) }, 200, h);
    }
    const style = String(fd.get('style') || 'render');
    if (!STYLES[style]) return json({ ok: false, error: 'bad' }, 400, h);
    const note = clean(fd.get('note')).slice(0, NOTE_MAX);
    if (note && BAD.test(note)) return json({ ok: false, error: 'note' }, 400, h);
    if (style === 'custom' && note.length < 3) return json({ ok: false, error: 'empty' }, 400, h);
    const file = fd.get('image');
    if (!file || typeof file === 'string' || !/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > MAX_BYTES || file.size < 500) return json({ ok: false, error: 'image' }, 400, h);

    const k = await ids(req, env, uid, email);
    const per = num(env.DAILY_LIMIT, 2);
    if ((await left(env, k)) <= 0) return json({ ok: false, error: 'limit', left: 0 }, 429, h);
    if ((await getN(env, k.kI)) >= num(env.IP_LIMIT, 6)) return json({ ok: false, error: 'limit', left: 0 }, 429, h);
    if ((await getN(env, k.kG)) >= num(env.GLOBAL_CAP, 55)) return json({ ok: false, error: 'busy' }, 503, h);

    const iw = Math.max(1, num(fd.get('iw'), 4)), ih = Math.max(1, num(fd.get('ih'), 3)), asp = Math.min(3, Math.max(1 / 3, iw / ih));
    const [w, hh] = dims(asp, Math.min(6, num(env.MAX_TILES, 6)));
    const en = await english(env, note);
    if (en !== note && BAD.test(en)) return json({ ok: false, error: 'note' }, 400, h);
    const prompt = STYLES[style] + (en ? ' The architect asks for: ' + en + '. Change nothing else.' : '') + QUALITY;

    // reserve the slot first (narrows the window for parallel requests), give it back if the model fails
    const keys = [k.kU, k.kE, k.kI, k.kG].filter(Boolean);
    await Promise.all(keys.map(x => bump(env, x, 1)));
    let image;
    try { image = await run(env, prompt, await file.arrayBuffer(), w, hh); }
    catch (e) {
      await Promise.all(keys.map(x => bump(env, x, -1)));
      return json({ ok: false, error: 'busy', detail: String(e && e.message || e).slice(0, 120) }, 503, h);
    }
    return json({ ok: true, image: 'data:' + mime(image) + ';base64,' + image, left: Math.max(0, per - Math.max(await getN(env, k.kU), k.kE ? await getN(env, k.kE) : 0)), limit: per }, 200, h);
  }
};
