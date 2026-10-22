const axios = require('axios'); const crypto = require('crypto');
const CREATOR = 'AlcaW44'; const SALURAN = 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44'; const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

class AdlinksumoBypasser {
    constructor() { this.cookies = {}; }
    saveCookies(h) { if (h && Array.isArray(h['set-cookie'])) h['set-cookie'].forEach(c => { const p = c.split(';')[0].split('='); if (p[0]) this.cookies[p[0].trim()] = p.slice(1).join('='); }); }
    getCookieHeader() { return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; '); }
    generateToken(xsrf) { const r = decodeURIComponent(xsrf || ''); const h = crypto.createHash('sha256').update(String(Math.random()) + Date.now()).digest('hex'); const e = '#' + Buffer.from(h).toString('base64'); return r.slice(0, 128 - e.length) + e; }
    clean(url) { if (!url) return null; return url.trim().replace(/\\+(\/)/g, '$1'); }

    async resolveDirectDownload(url) {
        if (!url || typeof url !== 'string') return null;
        try { if (/mediafire\.com/i.test(url)) { const r = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 10000, validateStatus: null }); const h = typeof r.data === 'string' ? r.data : ''; const m = h.match(/id=["']downloadButton["'][^>]*href=["']([^"']+)["']/i) || h.match(/href=["'](https?:\/\/download[^"']+)["']/i); if (m && m[1]) return m[1]; } } catch (_) {}
        return null;
    }

    async bypass(u) {
        const st = Date.now();
        try {
            if (!u || typeof u !== 'string') throw new Error('URL tidak valid');
            let n = u.trim(); if (!/^https?:\/\//i.test(n)) n = 'https://' + n;
            const p = new URL(n); const a = p.pathname.replace(/^\/+|\/+$/g, ''); if (!a) throw new Error('Slug tidak ditemukan');
            const i = await axios.get(n, { headers: { 'User-Agent': UA }, maxRedirects: 5, validateStatus: null }); this.saveCookies(i.headers);
            let g = null, r = null;
            if (typeof i.data === 'object' && i.data.url) { g = i.data.url; r = i.data.ray_id; }
            else if (typeof i.data === 'string') { const am = i.data.match(/action=["']([^"']+)["']/i); const rm = i.data.match(/name=["']ray_id["']\s+value=["']([^"']+)["']/i); if (am && rm) { g = am[1]; r = rm[1]; } }
            if (!g || !r) throw new Error('Gateway gagal');
            const go = new URL(g).origin;
            const h1 = await axios.get(`${g}?ray_id=${encodeURIComponent(r)}&alias=${encodeURIComponent(a)}`, { headers: { 'User-Agent': UA, 'Referer': n }, maxRedirects: 0, validateStatus: null }); this.saveCookies(h1.headers);
            const a1 = new URL(h1.headers['location'], go).href; const ar1 = await axios.get(a1, { headers: { 'User-Agent': UA, 'Referer': g, 'Cookie': this.getCookieHeader() }, maxRedirects: 0, validateStatus: null }); this.saveCookies(ar1.headers);
            const t1 = this.generateToken(this.cookies['XSRF-TOKEN']);
            await axios.post(`${go}/api/session`, { _token: t1 }, { headers: { 'User-Agent': UA, 'Referer': a1, 'Origin': go, 'Cookie': this.getCookieHeader(), 'Content-Type': 'application/json' }, validateStatus: null });
            const v1 = await axios.post(`${go}/api/verify`, { _a: 0 }, { headers: { 'User-Agent': UA, 'Referer': a1, 'Origin': go, 'Cookie': this.getCookieHeader(), 'Content-Type': 'application/json' }, validateStatus: null });
            const t2 = v1.data.target; if (!t2) throw new Error('Verify 1 gagal');
            const h2 = await axios.get(t2, { headers: { 'User-Agent': UA, 'Referer': a1, 'Cookie': this.getCookieHeader() }, maxRedirects: 0, validateStatus: null }); this.saveCookies(h2.headers);
            const a2 = new URL(h2.headers['location'], go).href; const ar2 = await axios.get(a2, { headers: { 'User-Agent': UA, 'Referer': t2, 'Cookie': this.getCookieHeader() }, maxRedirects: 0, validateStatus: null }); this.saveCookies(ar2.headers);
            const t3 = this.generateToken(this.cookies['XSRF-TOKEN']);
            await axios.post(`${go}/api/session`, { _token: t3 }, { headers: { 'User-Agent': UA, 'Referer': a2, 'Origin': go, 'Cookie': this.getCookieHeader(), 'Content-Type': 'application/json' }, validateStatus: null });
            const rk = Math.floor(Math.random() * 1000); const sv = (1920 + rk) * 2 + '.' + (1080 + rk) * 2;
            const gr = await axios.post(`${go}/api/go`, { key: rk, size: sv, ado: null }, { headers: { 'User-Agent': UA, 'Referer': a2, 'Origin': go, 'Cookie': this.getCookieHeader(), 'Content-Type': 'application/json' }, validateStatus: null });
            const ru = gr.data.url; if (!ru) throw new Error('Go gagal');
            const rr = await axios.get(ru, { headers: { 'User-Agent': UA, 'Referer': go }, maxRedirects: 5, validateStatus: null });
            let du = rr.request?.res?.responseUrl;
            if (!du && typeof rr.data === 'string') { const m = rr.data.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i) || rr.data.match(/location\.href\s*=\s*["']([^"']+)["']/i); if (m) du = this.clean(m[1]); }
            if (!du && typeof rr.data === 'string') { const m = rr.data.match(/href=["'](https?:\/\/[^"']+)["']/i); if (m) du = this.clean(m[1]); }
            if (!du) throw new Error('Extract gagal');
            const dd = await this.resolveDirectDownload(du);
            return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now() - st}ms`, status: true, result: { short_url: n, destination_url: du, direct_download: dd || null } };
        } catch (e) { return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now() - st}ms`, status: false, error: e.message }; }
    }
}
async function bypass(url) { return await new AdlinksumoBypasser().bypass(url); }
module.exports = { bypass, AdlinksumoBypasser };