const crypto = require('crypto'); const axios = require('axios'); const FormData = require('form-data');
const CREATOR = 'IzzXd'; const SALURAN = 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K'; const CLIENT_ID = '1189857605';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36';

async function solveCaptcha(imageBuffer) {
    try {
        const form = new FormData(); form.append('file', imageBuffer, { filename: 'captcha.jpg' }); form.append('apikey', 'helloworld'); form.append('OCREngine', '2');
        const res = await axios.post('https://api.ocr.space/parse/image', form, { headers: form.getHeaders(), timeout: 8000 });
        const text = res.data?.ParsedResults?.[0]?.ParsedText || ''; const cleaned = text.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (cleaned && cleaned.length >= 4) return cleaned;
    } catch (_) {}
    return '';
}

function generateUnloginToken() { const raw = USER_AGENT + Date.now() + Math.floor(100000 + Math.random() * 900000); return crypto.createHash('md5').update(raw).digest('hex'); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getAvailableDomains() {
    try {
        const res = await axios.get('https://tinyhost.shop/api/random-domains/', { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
        const list = Array.isArray(res.data?.domains) ? res.data.domains : [];
        return list.filter(d => /\.(com|net|org|site|space|fun|online|shop)$/i.test(d)).length > 0 ? list.filter(d => /\.(com|net|org|site|space|fun|online|shop)$/i.test(d)) : list;
    } catch { return ['workhorsefilms.com', 'anajakstore.site', 'monglung.space', 'chautuyen.online', 'getotp.fun']; }
}

async function createSession() {
    const domains = await getAvailableDomains(); if (!domains.length) throw new Error('Domain email kosong');
    let lastError = null;
    for (let reg = 0; reg < 3; reg++) {
        const domain = domains[Math.floor(Math.random() * domains.length)]; const username = 'wk' + Math.floor(100000 + Math.random() * 900000); const email = `${username}@${domain}`;
        let unloginToken = '', sent = false;
        for (let att = 0; att < 5; att++) {
            unloginToken = generateUnloginToken();
            try {
                const capRes = await axios.get(`https://api.account.meitu.com/captcha/show?t=${Date.now()}&unlogin_token=${unloginToken}&client_id=${CLIENT_ID}`, { headers: { 'User-Agent': USER_AGENT, 'Unlogin-Token': unloginToken }, responseType: 'arraybuffer' });
                const capText = await solveCaptcha(capRes.data); if (!capText) { await sleep(1000); continue; }
                const pp = new URLSearchParams({ client_id: CLIENT_ID, type: 'login_or_register', email, captcha: capText });
                const sRes = await axios.post('https://api.account.meitu.com/common/send_email_verify_code', pp.toString(), { headers: { 'User-Agent': USER_AGENT, 'Origin': 'https://wink.ai', 'Referer': 'https://wink.ai/', 'Content-Type': 'application/x-www-form-urlencoded', 'Unlogin-Token': unloginToken } });
                if (sRes.data?.meta?.code === 0) { sent = true; break; }
            } catch (_) {}
            await sleep(1500);
        }
        if (!sent) continue;
        let verifyCode = null;
        for (let p = 0; p < 18; p++) {
            await sleep(2000);
            try {
                const inb = await axios.get(`https://tinyhost.shop/api/email/${domain}/${username}/`, { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
                const mails = inb.data?.emails || [];
                if (mails.length > 0) {
                    const h = mails[0].html_body || mails[0].body || ''; const d = [...h.matchAll(/>(\d)</g)].map(m => m[1]);
                    if (d.length >= 6) { verifyCode = d.slice(0, 6).join(''); break; }
                    const ms = h.match(/\b(\d{6})\b/); if (ms) { verifyCode = ms[1]; break; }
                }
            } catch (_) {}
        }
        if (!verifyCode) { lastError = new Error('Kode verifikasi timeout'); continue; }
        try {
            const tp = new URLSearchParams({ client_id: CLIENT_ID, grant_type: 'email_by_login_code', email, code: verifyCode });
            const tRes = await axios.post('https://account.meitu.com/oauth/access_token', tp.toString(), { headers: { 'User-Agent': USER_AGENT, 'Origin': 'https://wink.ai', 'Referer': 'https://wink.ai/', 'Content-Type': 'application/x-www-form-urlencoded', 'Unlogin-Token': unloginToken } });
            if (tRes.data?.meta?.code !== 0 || !tRes.data?.response?.access_token) { lastError = new Error('Gagal tukar token'); continue; }
            const accessToken = tRes.data.response.access_token; const uid = String(tRes.data.response.uid || '');
            const auth = { 'User-Agent': USER_AGENT, 'Access-Token': accessToken, 'Cookie': `auth_token=${accessToken}; __mt_access_token__=${accessToken}`, 'Origin': 'https://wink.ai', 'Referer': 'https://wink.ai/' };
            try { await axios.get(`https://wink.ai/api/login_init.json?client_id=${CLIENT_ID}&gnum=1`, { headers: auth }); await axios.get(`https://wink.ai/api/user/info.json?uid=${uid}&client_id=${CLIENT_ID}&gnum=1`, { headers: auth }); } catch (_) {}
            let beans = 10;
            try { const r = await axios.get(`https://wink.ai/api/subscribe/remain_amount_info.json?client_id=${CLIENT_ID}&gnum=1`, { headers: auth }); if (typeof r.data?.data?.total_amount === 'number') beans = r.data.data.total_amount; } catch (_) {}
            return { token: accessToken, uid, email, beans, updatedAt: Date.now() };
        } catch (err) { lastError = err; }
    }
    throw lastError || new Error('Gagal buat sesi Wink');
}

async function uploadImage(token, buf, ext = '.png') {
    const e = ext.startsWith('.') ? ext : `.${ext}`;
    const auth = { 'User-Agent': USER_AGENT, 'Access-Token': token, 'Cookie': `auth_token=${token}; __mt_access_token__=${token}`, 'Referer': 'https://wink.ai/image-enhancer/upload', 'Origin': 'https://wink.ai' };
    const sRes = await axios.get(`https://wink.ai/api/file/get_maat_sign.json?client_id=${CLIENT_ID}&gnum=1&suffix=${encodeURIComponent(e)}&type=temp&count=1`, { headers: auth });
    if (sRes.data?.code !== 0 || !sRes.data?.data) throw new Error('Gagal sign upload');
    const sd = sRes.data.data; const pp = new URLSearchParams({ app: sd.app, count: String(sd.count), sig: sd.sig, sig_time: String(sd.sig_time), sig_version: String(sd.sig_version), suffix: sd.suffix, type: sd.type });
    const pRes = await axios.get(`${sd.host}/upload/policy?${pp.toString()}`, { headers: auth });
    const q = (Array.isArray(pRes.data) ? pRes.data : [])[0]?.qiniu; if (!q) throw new Error('Storage config error');
    const form = new FormData(); form.append('key', q.key); form.append('token', q.token); form.append('file', buf, { filename: `input${e}`, contentType: e === '.png' ? 'image/png' : 'image/jpeg' });
    const uRes = await axios.post(q.url, form, { headers: { ...form.getHeaders(), 'User-Agent': USER_AGENT } });
    return uRes.data?.url || q.data;
}

function gcd(a, b) { let x = Math.abs(a), y = Math.abs(b); while (y) { let t = y; y = x % y; x = t; } return x || 1; }

async function uploadDirect(buffer, filename = 'image.jpg') {
    try { const f = new FormData(); f.append('files[]', buffer, { filename, contentType: 'image/jpeg' }); const r = await axios.post('https://uguu.se/upload.php', f, { headers: f.getHeaders(), timeout: 15000 }); const u = r.data?.files?.[0]?.url; if (u) return u; } catch (_) {}
    try { const f = new FormData(); f.append('reqtype', 'fileupload'); f.append('time', '72h'); f.append('fileToUpload', buffer, { filename, contentType: 'image/jpeg' }); const r = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', f, { headers: { ...f.getHeaders(), 'User-Agent': USER_AGENT }, timeout: 15000 }); if (typeof r.data === 'string' && r.data.startsWith('http')) return r.data.trim(); } catch (_) {}
    throw new Error('Gagal upload hasil');
}

async function adjustImage(imageUrl, targetW, targetH, cropToRatio = false, origW = 0, origH = 0) {
    const { createCanvas, loadImage } = require('@napi-rs/canvas');
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': USER_AGENT } });
    const img = await loadImage(Buffer.from(res.data)); const canvas = createCanvas(targetW, targetH); const ctx = canvas.getContext('2d');
    if (cropToRatio && origW > 0 && origH > 0) { const ratio = origW / origH; let cw = img.width, ch = Math.round(cw / ratio); if (ch > img.height) { ch = img.height; cw = Math.round(ch * ratio); } const sx = Math.max(0, Math.floor((img.width - cw) / 2)), sy = Math.max(0, Math.floor((img.height - ch) / 2)); ctx.drawImage(img, sx, sy, cw, ch, 0, 0, targetW, targetH); } else { ctx.drawImage(img, 0, 0, targetW, targetH); }
    return canvas.toBuffer('image/jpeg', 95);
}

async function upscale(imageSource, mode = 'uhd ai', options = {}) {
    const opts = typeof options === 'object' && options ? options : {};
    let rawMode = String(mode || 'uhd ai').toLowerCase(); const keepSize = Boolean(opts.keepSize || rawMode.includes('--keep-size') || rawMode.includes('-k')); const fixRatio = opts.fixRatio !== undefined ? Boolean(opts.fixRatio) : true;
    rawMode = rawMode.replace(/--keep-size|--original-size|-k|--fix-ratio|-f/g, '').replace(/[\-_]/g, ' ').trim();
    let taskType = 55, materialId = '63031', modeKey = 'uhd ai';
    if (['hd', 'standar'].includes(rawMode)) { taskType = 2; materialId = '63001'; modeKey = 'hd'; } else if (['ultra', 'ultra hd', 'ultrahd', '4k'].includes(rawMode)) { taskType = 12; materialId = '63011'; modeKey = 'ultra'; }
    
    let buf, ext = '.jpeg';
    if (Buffer.isBuffer(imageSource)) buf = imageSource;
    else if (typeof imageSource === 'string' && /^https?:\/\//i.test(imageSource)) { const r = await axios.get(imageSource, { responseType: 'arraybuffer', headers: { 'User-Agent': USER_AGENT } }); buf = Buffer.from(r.data); }
    else throw new Error('Sumber gambar tidak valid');
    
    let origW = 0, origH = 0;
    try { const { createCanvas, loadImage } = require('@napi-rs/canvas'); const l = await loadImage(buf); origW = l.width; origH = l.height; const c = createCanvas(l.width, l.height); const x = c.getContext('2d'); x.drawImage(l, 0, 0); buf = c.toBuffer('image/jpeg', 95); ext = '.jpeg'; } catch (_) {}

    const session = await createSession();
    const uploadedUrl = await uploadImage(session.token, buf, ext);
    const auth = { 'User-Agent': USER_AGENT, 'Access-Token': session.token, 'Cookie': `auth_token=${session.token}; __mt_access_token__=${session.token}`, 'Origin': 'https://wink.ai', 'Referer': 'https://wink.ai/image-enhancer/upload', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
    const rd = { source: '1', touch_type: '4', function_id: '630', material_id: materialId, url: 'https://wink.ai/image-enhancer/upload' };
    const tp = { is_mirror: 0, orientation_tag: 1, j420_trans: '1', return_ext: '2' };
    const db = new URLSearchParams({ client_id: CLIENT_ID, gnum: '1', type: String(taskType), content_type: '1', source_url: uploadedUrl, type_params: JSON.stringify(tp), right_detail: JSON.stringify(rd), ext_params: JSON.stringify({ from_exportpage: 0, records: String(taskType) }), with_prepare: '0' });
    const dRes = await axios.post('https://wink.ai/api/meitu_ai/delivery.json', db.toString(), { headers: auth });
    if (dRes.data?.code !== 0 || !dRes.data?.data?.msg_id) throw new Error(dRes.data?.message || 'Gagal mulai upscale');
    const msgId = dRes.data.data.msg_id; let final = null; const maxP = modeKey === 'uhd ai' ? 160 : 60;
    
    for (let p = 0; p < maxP; p++) {
        await sleep(2000);
        const qRes = await axios.get(`https://wink.ai/api/meitu_ai/query_batch.json?client_id=${CLIENT_ID}&gnum=1&msg_ids=${msgId}`, { headers: auth });
        const items = qRes.data?.data?.item_list || [];
        if (items.length > 0) {
            const it = items[0], r = it.result;
            if (r && r.error_code === 0) {
                const m = (r.media_info_list || [])[0] || {}, raw = m.raw_media_data || m.media_data || it.cover_pic || '';
                const ow = origW || it.ori_width || 0, oh = origH || it.ori_height || 0; let w = it.width || m.media_profiles?.media_data_width || 0, h = it.height || m.media_profiles?.media_data_height || 0, au = raw, as = it.size_human || '';
                if (ow > 0 && oh > 0) {
                    const g = gcd(ow, oh), bw = ow / g, bh = oh / g;
                    if (modeKey === 'uhd ai' || keepSize) { const b = await adjustImage(raw, ow, oh, false); au = await uploadDirect(b, `wink_${ow}x${oh}.jpg`); w = ow; h = oh; as = `${(b.length / 1048576).toFixed(1)}MB`; }
                    else if (fixRatio) { let k = Math.min(Math.floor(w / bw), Math.floor(h / bh)); if ((k * bw) % 2 !== 0 || (k * bh) % 2 !== 0) { if (k > 1) k--; } const tw = k * bw, th = k * bh; if (tw > 0 && th > 0 && (tw !== w || th !== h)) { const b = await adjustImage(raw, tw, th, true, ow, oh); au = await uploadDirect(b, `wink_${tw}x${th}.jpg`); w = tw; h = th; as = `${(b.length / 1048576).toFixed(1)}MB`; } }
                }
                const rg = (ow > 0 && oh > 0) ? gcd(ow, oh) : gcd(w, h); const rs = (ow > 0 && oh > 0) ? `${ow / rg}:${oh / rg}` : `${w}:${h}`;
                final = { url: au, rawUrl: raw, width: w, height: h, ratio: rs, originalWidth: ow, originalHeight: oh, size: as, mode: modeKey }; break;
            } else if (r && ![0, -1, 1, 29901].includes(r.error_code) && r.error_msg !== 'NOT_RESULT') throw new Error(r.error_msg || 'Upscale gagal');
        }
    }
    if (!final) throw new Error('Upscale timeout');
    return { Creator: CREATOR, Saluran: SALURAN, status: true, data: final };
}

module.exports = { upscale, enhance: upscale, createSession };