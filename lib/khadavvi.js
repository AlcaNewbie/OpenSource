const axios = require('axios'); const cheerio = require('cheerio');
const CREATOR = 'AlcaW44'; const SALURAN = 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44'; const BASE_URL = 'https://app.khaddavi.net'; const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function resolvePayload(v, d=0) {
    if(!v||d>4)return''; let r=String(v).trim();
    try{ if(/^https?:\/\//i.test(r)){ const p=new URL(r); for(const k of ['safelink_redirect','url','target','goto','r','out','u','link','data','an']){ const x=p.searchParams.get(k); if(x){ const y=resolvePayload(x,d+1); if(y&&/^https?:\/\//i.test(y))return y; } } } }catch(_){}
    const dec=Buffer.from(r,'base64').toString('utf-8'); if(dec&&dec!==r){ if(/^https?:\/\//i.test(dec))return dec; try{ const j=JSON.parse(dec); const n=j.safelink||j.link||j.url||j.linkr||j.target||j.destination; if(n){ const y=resolvePayload(n,d+1); if(y)return y; } }catch(_){} }
    return /^https?:\/\//i.test(r)?r:''; 
}

function isExternal(u, h) { try { if(!/^https?:\/\//i.test(u))return false; const p=new URL(u); const hn=p.hostname.toLowerCase(); if(hn.includes('khaddavi.')||hn.includes('contentmenarik.com')||hn===h)return false; if(hn.includes('google.')&&(p.pathname==='/'||p.pathname==='/search'))return false; return true; } catch(_){ return false; } }

function extractDest(html, curUrl) {
    const $ = cheerio.load(html); const h = new URL(curUrl).hostname.toLowerCase();
    const mr = $('meta[http-equiv="refresh" i]').attr('content');
    if (mr) { const m = mr.match(/url=([^;]+)/i); if (m) { const u = m[1].replace(/['"]/g,'').trim(); if (isExternal(u,h)) return u; const r = resolvePayload(u); if (r && isExternal(r,h)) return r; } }
    const og = $('meta[property="og:description" i], meta[name="og:description" i]').attr('content');
    if (og) { const m = og.match(/https?:\/\/[^\s<>"']+/i); if (m && isExternal(m[0],h)) return m[0]; }
    for (const sel of ['input[name="safelink_redirect"]','input[name="go"]','input[name="newwpsafelink"]','input[name="wpsafelink"]','input[name="wpsafelink_redirect"]']) { const v = $(sel).val(); if (v) { const r = resolvePayload(v); if (r && isExternal(r,h)) return r; } }
    const fa = $('form#slu-form, form#safelink, form[action*="safelinku"]').attr('action'); if (fa && isExternal(fa,h)) return fa;
    const sb = $('#slu-btn[href], a.slu-btn[href], #btn-main[href]').attr('href'); if (sb) { const r = resolvePayload(sb); if (r && isExternal(r,h)) return r; if (isExternal(sb,h)) return sb; }
    for (const el of $('a[href]').toArray()) { const hh = $(el).attr('href'); if (hh && isExternal(hh,h)) { const t = $(el).text().toLowerCase(); if (t.includes('download')||t.includes('get link')||t.includes('lanjut')||t.includes('direct')) return hh; } }
    for (const s of $('script').toArray()) { const t = $(s).html()||''; const m = t.match(/var\s+(?:url|link|destination)\s*=\s*['"](https?:\/\/[^'"]+)['"]/i); if (m && isExternal(m[1],h)) return m[1]; }
    return '';
}

async function bypass(shortUrl) {
    const st = Date.now(); const raw = String(shortUrl || '').trim();
    if (!raw || !/^https?:\/\//i.test(raw)) return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now()-st}ms`, status: false, error: 'URL tidak valid.' };
    try {
        const dc = resolvePayload(raw); if (dc && /^https?:\/\//i.test(dc) && !dc.includes('khaddavi.')) return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now()-st}ms`, status: true, data: { original_url: raw, destination_url: dc, method: 'URL Param' } };
        const res = await axios.get(raw, { headers: { 'User-Agent': UA, 'Referer': 'https://www.google.com/' }, maxRedirects: 5, timeout: 15000 });
        const fu = res.request?.res?.responseUrl || raw; const dest = extractDest(res.data, fu);
        if (dest) return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now()-st}ms`, status: true, data: { original_url: raw, destination_url: dest, final_page_url: fu, method: 'HTML Safelink' } };
        if (fu !== raw && isExternal(fu, new URL(raw).hostname.toLowerCase())) return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now()-st}ms`, status: true, data: { original_url: raw, destination_url: fu, method: 'HTTP Redirection' } };
        return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now()-st}ms`, status: false, error: 'Link tujuan tidak ditemukan' };
    } catch (err) { return { Creator: CREATOR, Saluran: SALURAN, time: `${Date.now()-st}ms`, status: false, error: err.message }; }
}

module.exports = { bypass };