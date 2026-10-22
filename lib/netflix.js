const axios = require('axios');
async function getNetflixTokens(jumlah = 1) {
    try {
        let agent;
        if (process.env.PROXY_URL) { try { const { HttpsProxyAgent } = require('https-proxy-agent'); agent = new HttpsProxyAgent(process.env.PROXY_URL); } catch (_) {} }
        const cfg = { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://token-netflix.vercel.app/' }, timeout: 15000 };
        if (agent) { cfg.httpsAgent = agent; cfg.proxy = false; }
        const r = await axios.post('https://token-netflix.vercel.app/api/generate', { count: jumlah }, cfg);
        const m = JSON.stringify(r.data).match(/(Bgiqv[a-zA-Z0-9+\/=_-]{50,})/g);
        if (!m || m.length === 0) return { status: false, message: 'Token tidak ditemukan.' };
        const unq = [...new Set(m)]; return { status: true, total: unq.length, data: unq.map(t => ({ token: t, links: { pc: `https://www.netflix.com/browse?nftoken=${t}`, android: `nflx://www.netflix.com/browse?nftoken=${t}`, tv: `https://www.netflix.com/tv?nftoken=${t}` } })) };
    } catch (e) { return { status: false, message: e.message }; }
}
module.exports = { getNetflixTokens };