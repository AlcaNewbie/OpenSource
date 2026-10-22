const axios = require('axios');
const WM = { Creator: 'AlcaW44', Saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44' };
const API = 'https://api.v02.savethevideo.com'; const H = { 'Content-Type': 'application/json', 'Origin': 'https://www.savethevideo.com', 'Referer': 'https://www.savethevideo.com/', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', 'Accept': 'application/json, text/plain, */*' };

async function dl(targetUrl, timeoutMs = 30000) {
    const u = targetUrl.trim();
    const post = await axios.post(`${API}/tasks`, { type: 'info', url: u }, { headers: H, timeout: 10000 });
    const task = post.data; if (!task || !task.href) throw new Error('Gagal buat task');
    const st = Date.now(); let td = task;
    while (Date.now() - st < timeoutMs) {
        await new Promise(r => setTimeout(r, 1500));
        const p = await axios.get(`${API}${task.href}`, { headers: H, timeout: 10000 }); td = p.data;
        if (td.state === 'completed') break;
        if (td.state === 'failed') throw new Error(td.error?.message || 'Gagal ekstrak');
    }
    if (td.state !== 'completed') throw new Error('Timeout');
    const res = td.result || {}; const fmts = (res.formats || []).map(f => ({ format_id: f.format_id || f.id || null, quality: f.format_note || f.resolution || f.quality || null, extension: f.ext || null, file_size: f.filesize ? `${(f.filesize / 1048576).toFixed(2)} MB` : null, url: f.url || null }));
    return { ...WM, status: true, url: u, title: res.title || null, duration: res.duration || null, thumbnail: res.thumbnail || null, uploader: res.uploader || null, formats: fmts };
}
module.exports = { dl };