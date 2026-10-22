const { fetchTheresav } = require('../lib/theresav.js');
const { upscale } = require('../lib/rezolve.js');
const { generate } = require('../lib/imagefree.js');
const { sendLink, verifyLink } = require('../lib/amprem.js');
const { getNetflixTokens } = require('../lib/netflix.js');
const { bypass: sfl } = require('../lib/sfl.js');
const { bypass: khadavvi } = require('../lib/khadavvi.js');
const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Ambil path dari URL (contoh: /api/bypass/sfl)
  const path = req.url.split('?')[0].replace(/^\/api\//, '').replace(/\/$/, '');
  const body = req.body || {};

  try {
    // --- ROUTING LOGIC ---
    if (path === 'bypass/sfl') return res.json(await sfl(body.url));
    if (path === 'bypass/khadavvi') return res.json(await khadavvi(body.url));

    if (path.startsWith('bypass/')) {
      const type = path.replace('bypass/', '');
      return res.json(await fetchTheresav(`/api/bypass/${type}`, body));
    }

    if (path === 'image/upscale') return res.json(await upscale(body.url, body.multiplier));
    if (path === 'image/text2image') return res.json(await generate(body.prompt, { aspectRatio: body.aspectRatio }));
    if (path === 'image/removebg') {
      const img = await axios.get(body.url, { responseType: 'arraybuffer' });
      const form = new FormData();
      form.append('image', Buffer.from(img.data), 'image.jpg');
      const response = await axios.post('https://api.theresav.eu/api/image/magichour/removebg', form, { headers: { ...form.getHeaders(), 'x-apikey': '04i97' } });
      return res.json({ creator: 'AlcaW44', saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', ...response.data });
    }

    if (path === 'download/aio') return res.json(await fetchTheresav('/api/download/aio', body));

    if (path === 'create/amprem') {
      if (body.stage.startsWith('1')) return res.json(await sendLink(body.email));
      return res.json(await verifyLink(body.email, body.magicLink));
    }
    if (path === 'create/netflix') return res.json(await getNetflixTokens(body.count || 1));

    return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
