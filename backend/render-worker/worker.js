/* X Architecture — AI render studio backend (Cloudflare Worker + Workers AI).
   Receives a small image + a style from the site, asks an image model to re-render it, and returns the picture.
   It also enforces the daily limits, so the model key/quota never touches the browser.

   Bindings (Workers → Settings → Bindings):
     AI      Workers AI                 (required)
     LIMITS  KV namespace               (required, stores the daily counters)
   Optional variables (Settings → Variables):
     DAILY_LIMIT  images per student per day      default 2
     IP_LIMIT     images per network address/day  default 6   (shared mobile networks need more than 2)
     GLOBAL_CAP   images for everyone per day     default 90  (one 1024px image costs ~85-110 of the 10,000 free neurons/day)
     MODEL        flux2 | sd15                    default flux2
     ORIGINS      comma list of allowed websites  default https://xarch.site,https://www.xarch.site
   Setup in Arabic: backend/render-worker/SETUP.md */

const STYLES = {
  render: 'Transform this into a photorealistic architectural render. Keep the exact building massing, proportions, openings and camera angle. Natural daylight, soft realistic shadows, realistic materials and glass reflections, people and trees for scale, clean professional architectural visualization.',
  night: 'Convert this into a photorealistic architectural night render. Keep the exact geometry and camera angle. Warm interior light glowing through the glazing, deep blue-hour sky, subtle exterior lighting, realistic materials.',
  materials: 'Keep the exact building geometry and camera angle. Redesign the materials: board-formed concrete with warm timber details, realistic reflections, soft overcast light, photorealistic architectural photography.',
  interior: 'Transform this into a photorealistic interior render. Keep the layout, proportions and camera angle. Natural oak, linen textiles, soft morning light through large windows, minimal contemporary furniture, high detail.',
  massing: 'Turn this massing model into a realistic architectural visualization in an urban context. Keep the form and camera angle. Golden hour light, trees, people and street details, shallow depth of field.'
};
const BAD = /(nude|naked|porn|sex|nsfw|erotic|fetish|gore|blood|corpse|kill|murder|weapon|gun|rifle|terror|bomb|explosive|swastika|isis|عاري|عارية|عراة|جنس|اباحي|إباحي|دم|جثة|قتل|سلاح|بندقية|إرهاب|ارهاب|قنبلة|متفجر)/i;
const MAX_BYTES = 1.6 * 1024 * 1024;

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
function snap(n) { n = Math.max(256, Math.min(1024, Math.round(n / 64) * 64)); return n; }

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
    const note = String(fd.get('note') || '').replace(/[\u0000-\u001f<>{}\[\]]/g, ' ').trim().slice(0, 160);
    if (note && BAD.test(note)) return json({ ok: false, error: 'note' }, 400, h);
    const file = fd.get('image');
    if (!file || typeof file === 'string' || !/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > MAX_BYTES || file.size < 500) return json({ ok: false, error: 'image' }, 400, h);

    const k = await ids(req, env, uid, email);
    const per = num(env.DAILY_LIMIT, 2);
    if ((await left(env, k)) <= 0) return json({ ok: false, error: 'limit', left: 0 }, 429, h);
    if ((await getN(env, k.kI)) >= num(env.IP_LIMIT, 6)) return json({ ok: false, error: 'limit', left: 0 }, 429, h);
    if ((await getN(env, k.kG)) >= num(env.GLOBAL_CAP, 90)) return json({ ok: false, error: 'busy' }, 503, h);

    const iw = Math.max(1, num(fd.get('iw'), 4)), ih = Math.max(1, num(fd.get('ih'), 3)), asp = Math.min(3, Math.max(1 / 3, iw / ih));
    const w = asp >= 1 ? 1024 : snap(1024 * asp), hh = asp >= 1 ? snap(1024 / asp) : 1024;
    const prompt = STYLES[style] + (note ? ' The architect also asks for: ' + note + '.' : '');

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
